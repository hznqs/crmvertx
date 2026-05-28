package br.com.vertxmidia.crm.modules.projects.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.application.DeliveryService;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectFilterRequest;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectRequest;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectResponse;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectStatusUpdateRequest;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import br.com.vertxmidia.crm.modules.tasks.application.TaskService;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private static final BigDecimal DEFAULT_COST_RATIO = new BigDecimal("0.60");
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100.00");

    private final ProjectRepository repository;
    private final ClientRepository clientRepository;
    private final ContractRepository contractRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final DeliveryService deliveryService;
    private final TaskService taskService;
    private final ProjectMapper mapper;
    private final AuditService auditService;

    public ProjectService(ProjectRepository repository,
                          ClientRepository clientRepository,
                          ContractRepository contractRepository,
                          ServiceOfferingRepository serviceOfferingRepository,
                          DeliveryService deliveryService,
                          TaskService taskService,
                          ProjectMapper mapper,
                          AuditService auditService) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.contractRepository = contractRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.deliveryService = deliveryService;
        this.taskService = taskService;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> search(ProjectFilterRequest filter, Pageable pageable) {
        return repository.findAll(ProjectSpecifications.byFilters(filter), pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(UUID id) {
        return mapper.toResponse(getActiveProject(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ProjectResponse create(ProjectRequest request) {
        validateReferences(request);
        validateProgressForStatus(request.status(), request.progress());

        Project project = mapper.toEntity(request);
        project.setCreatedBy(currentUserId());
        project.setUpdatedBy(currentUserId());

        Project saved = repository.save(project);
        syncProjectOperations(saved);
        auditService.log("CREATE", "Project", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ProjectResponse update(UUID id, ProjectRequest request) {
        validateReferences(request);
        validateProgressForStatus(request.status(), request.progress());

        Project project = getActiveProject(id);
        auditChanges(project, request);
        mapper.updateEntity(request, project);
        project.setUpdatedBy(currentUserId());

        Project saved = repository.save(project);
        syncProjectOperations(saved);
        auditService.log("UPDATE", "Project", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ProjectResponse updateStatus(UUID id, ProjectStatusUpdateRequest request) {
        Project project = getActiveProject(id);
        int progress = request.progress() == null ? defaultProgressForStatus(request.status(), project.getProgress()) : request.progress();
        validateProgressForStatus(request.status(), progress);

        auditService.logChange("Project", project.getId(), "status", project.getStatus(), request.status());
        auditService.logChange("Project", project.getId(), "progress", project.getProgress(), progress);
        project.setStatus(request.status());
        project.setProgress(progress);
        project.setUpdatedBy(currentUserId());

        Project saved = repository.save(project);
        syncProjectOperations(saved);
        auditService.log("STATUS_UPDATE", "Project", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        Project project = getActiveProject(id);
        auditService.logChange("Project", project.getId(), "active", project.isActive(), false);
        project.setActive(false);
        project.setStatus(ProjectStatus.CANCELADO);
        project.setUpdatedBy(currentUserId());
        Project saved = repository.save(project);
        syncProjectOperations(saved);
        auditService.log("SOFT_DELETE", "Project", id);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public Optional<ProjectResponse> syncContractProject(Contract contract) {
        Optional<Project> currentProject = repository.findFirstByContractIdAndActiveTrue(contract.getId());

        if (!isProjectGeneratingContract(contract)) {
            currentProject.ifPresent(this::cancelAutomaticProject);
            return Optional.empty();
        }

        ProjectRequest request = automaticProjectRequest(contract, currentProject.orElse(null));
        if (currentProject.isPresent()) {
            Project project = currentProject.get();
            auditChanges(project, request);
            mapper.updateEntity(request, project);
            project.setUpdatedBy(currentUserId());
            Project saved = repository.save(project);
            syncProjectOperations(saved);
            auditService.log("UPDATE_CONTRACT_PROJECT", "Project", saved.getId());
            return Optional.of(mapper.toResponse(saved));
        }

        Project project = mapper.toEntity(request);
        project.setCreatedBy(currentUserId());
        project.setUpdatedBy(currentUserId());
        Project saved = repository.save(project);
        syncProjectOperations(saved);
        auditService.log("CREATE_CONTRACT_PROJECT", "Project", saved.getId());
        return Optional.of(mapper.toResponse(saved));
    }

    private Project getActiveProject(UUID id) {
        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Projeto nao encontrado"));
    }

    private void validateReferences(ProjectRequest request) {
        if (!clientRepository.existsById(request.clientId())) {
            throw new EntityNotFoundException("Cliente nao encontrado para o projeto");
        }
        if (request.contractId() != null && !contractRepository.existsById(request.contractId())) {
            throw new EntityNotFoundException("Contrato nao encontrado para o projeto");
        }
        if (request.serviceId() != null && serviceOfferingRepository.findByIdAndActiveTrue(request.serviceId()).isEmpty()) {
            throw new EntityNotFoundException("Servico ativo nao encontrado para o projeto");
        }
    }

    private void cancelAutomaticProject(Project project) {
        if (project.getStatus() == ProjectStatus.FINALIZADO) {
            return;
        }
        auditService.logChange("Project", project.getId(), "status", project.getStatus(), ProjectStatus.CANCELADO);
        auditService.logChange("Project", project.getId(), "active", project.isActive(), false);
        project.setStatus(ProjectStatus.CANCELADO);
        project.setActive(false);
        project.setUpdatedBy(currentUserId());
        Project saved = repository.save(project);
        syncProjectOperations(saved);
        auditService.log("CANCEL_CONTRACT_PROJECT", "Project", saved.getId());
    }

    private void syncProjectOperations(Project project) {
        Optional<ServiceOffering> service = project.getServiceId() == null
                ? Optional.empty()
                : serviceOfferingRepository.findByIdAndActiveTrue(project.getServiceId());
        List<DeliveryResponse> deliveries = deliveryService.syncProjectDeliveries(project, service);
        if (deliveries == null) {
            deliveries = List.of();
        }
        taskService.syncProjectTasks(project, deliveries, service);
    }

    private boolean isProjectGeneratingContract(Contract contract) {
        return contract.isActive()
                && "ativo".equalsIgnoreCase(contract.getStatus())
                && contract.getClientId() != null;
    }

    private ProjectRequest automaticProjectRequest(Contract contract, Project currentProject) {
        Optional<ServiceOffering> service = contract.getServiceId() == null
                ? Optional.empty()
                : serviceOfferingRepository.findByIdAndActiveTrue(contract.getServiceId());
        BigDecimal budget = projectBudget(contract, service);
        LocalDate slaDueDate = projectSlaDueDate(contract, service);
        ProjectStatus status = currentProject == null ? ProjectStatus.PLANEJAMENTO : currentProject.getStatus();
        Integer progress = currentProject == null ? 0 : currentProject.getProgress();

        return new ProjectRequest(
                contract.getClientId(),
                contract.getId(),
                service.map(ServiceOffering::getId).orElse(null),
                projectName(contract, service),
                projectDescription(contract, service),
                status,
                currentProject == null ? null : currentProject.getResponsibleUserId(),
                currentProject == null ? null : currentProject.getTeamMemberIds(),
                progress,
                slaDueDate,
                budget,
                estimatedProjectCost(budget, service),
                currentProject == null ? BigDecimal.ZERO : currentProject.getActualCost(),
                true
        );
    }

    private String projectName(Contract contract, Optional<ServiceOffering> service) {
        return service
                .map(item -> item.getName() + " - " + contract.getPlan())
                .orElse("Projeto - " + contract.getPlan());
    }

    private String projectDescription(Contract contract, Optional<ServiceOffering> service) {
        String serviceDescription = service.map(ServiceOffering::getDescription).orElse(null);
        String deliveryStages = service.map(ServiceOffering::getDeliveryStages).orElse(null);
        String defaultChecklist = service.map(ServiceOffering::getDefaultChecklist).orElse(null);
        StringBuilder description = new StringBuilder("Projeto criado automaticamente a partir do contrato ")
                .append(contract.getId())
                .append(".");

        return serviceDescription == null || serviceDescription.isBlank()
                ? appendOperationalTemplate(description, deliveryStages, defaultChecklist)
                : appendOperationalTemplate(description.append("\n\n").append(serviceDescription.trim()), deliveryStages, defaultChecklist);
    }

    private BigDecimal projectBudget(Contract contract, Optional<ServiceOffering> service) {
        if (contract.getTotalValue() != null && contract.getTotalValue().compareTo(BigDecimal.ZERO) > 0) {
            return contract.getTotalValue();
        }
        if (contract.getMonthlyValue() != null && contract.getMonthlyValue().compareTo(BigDecimal.ZERO) > 0) {
            return contract.getMonthlyValue();
        }
        return service.map(ServiceOffering::getBasePrice).orElse(BigDecimal.ZERO);
    }

    private BigDecimal estimatedProjectCost(BigDecimal budget, Optional<ServiceOffering> service) {
        BigDecimal grossMargin = service
                .map(ServiceOffering::getGrossMarginPercentage)
                .filter(margin -> margin.compareTo(BigDecimal.ZERO) > 0)
                .orElse(null);

        if (grossMargin == null) {
            return budget.multiply(DEFAULT_COST_RATIO);
        }

        BigDecimal costRatio = ONE_HUNDRED.subtract(grossMargin).divide(ONE_HUNDRED);
        return budget.multiply(costRatio);
    }

    private String appendOperationalTemplate(StringBuilder description, String deliveryStages, String defaultChecklist) {
        if (deliveryStages != null && !deliveryStages.isBlank()) {
            description.append("\n\nEtapas padrao:\n").append(deliveryStages.trim());
        }
        if (defaultChecklist != null && !defaultChecklist.isBlank()) {
            description.append("\n\nChecklist padrao:\n").append(defaultChecklist.trim());
        }
        return description.toString();
    }

    private LocalDate projectSlaDueDate(Contract contract, Optional<ServiceOffering> service) {
        return service
                .map(ServiceOffering::getSlaDays)
                .filter(days -> days > 0)
                .map(days -> contract.getStartDate().plusDays(days))
                .orElse(contract.getEndDate());
    }

    private void validateProgressForStatus(ProjectStatus status, Integer progress) {
        if (status == ProjectStatus.FINALIZADO && progress < 100) {
            throw new IllegalArgumentException("Projetos finalizados precisam estar com 100% de progresso");
        }
        if (status == ProjectStatus.CANCELADO && progress > 99) {
            throw new IllegalArgumentException("Projetos cancelados nao podem estar com 100% de progresso");
        }
    }

    private int defaultProgressForStatus(ProjectStatus status, int currentProgress) {
        if (status == ProjectStatus.FINALIZADO) {
            return 100;
        }
        if (status == ProjectStatus.PLANEJAMENTO) {
            return Math.min(currentProgress, 20);
        }
        return currentProgress;
    }

    private void auditChanges(Project project, ProjectRequest request) {
        auditService.logChange("Project", project.getId(), "clientId", project.getClientId(), request.clientId());
        auditService.logChange("Project", project.getId(), "contractId", project.getContractId(), request.contractId());
        auditService.logChange("Project", project.getId(), "serviceId", project.getServiceId(), request.serviceId());
        auditService.logChange("Project", project.getId(), "name", project.getName(), request.name().trim());
        auditService.logChange("Project", project.getId(), "status", project.getStatus(), request.status());
        auditService.logChange("Project", project.getId(), "responsibleUserId", project.getResponsibleUserId(), request.responsibleUserId());
        auditService.logChange("Project", project.getId(), "progress", project.getProgress(), request.progress());
        auditService.logChange("Project", project.getId(), "slaDueDate", project.getSlaDueDate(), request.slaDueDate());
        auditService.logChange("Project", project.getId(), "budget", project.getBudget(), request.budget());
        auditService.logChange("Project", project.getId(), "estimatedCost", project.getEstimatedCost(), request.estimatedCost());
        auditService.logChange("Project", project.getId(), "actualCost", project.getActualCost(), request.actualCost());
        auditService.logChange("Project", project.getId(), "active", project.isActive(), request.active() == null || request.active());
    }

    private UUID currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return null;
        }

        try {
            return UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
