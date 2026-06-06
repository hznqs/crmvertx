package br.com.vertxmidia.crm.modules.tasks.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.ContractServiceItem;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.domain.ServiceTaskTemplate;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceTaskTemplateRepository;
import br.com.vertxmidia.crm.modules.tasks.domain.Task;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskPriority;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskFilterRequest;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskRequest;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskResponse;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskStatusUpdateRequest;
import br.com.vertxmidia.crm.modules.tasks.infrastructure.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
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
public class TaskService {

    private final TaskRepository repository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ContractRepository contractRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ServiceTaskTemplateRepository serviceTaskTemplateRepository;
    private final DeliveryRepository deliveryRepository;
    private final TaskMapper mapper;
    private final AuditService auditService;

    public TaskService(TaskRepository repository,
                       ClientRepository clientRepository,
                       ProjectRepository projectRepository,
                       ContractRepository contractRepository,
                       ServiceOfferingRepository serviceOfferingRepository,
                       ServiceTaskTemplateRepository serviceTaskTemplateRepository,
                       DeliveryRepository deliveryRepository,
                       TaskMapper mapper,
                       AuditService auditService) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.contractRepository = contractRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.serviceTaskTemplateRepository = serviceTaskTemplateRepository;
        this.deliveryRepository = deliveryRepository;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> search(TaskFilterRequest filter, Pageable pageable) {
        return repository.findAll(TaskSpecifications.byFilters(withDefaultActiveFilter(filter)), pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(UUID id) {
        return mapper.toResponse(getActiveTask(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public TaskResponse create(TaskRequest request) {
        validateReferences(request);
        Task task = mapper.toEntity(request);
        task.setCreatedBy(currentUserId());
        task.setUpdatedBy(currentUserId());

        Task saved = repository.save(task);
        recalculateProjectProgress(saved.getProjectId());
        auditService.log("CREATE", "Task", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public TaskResponse update(UUID id, TaskRequest request) {
        validateReferences(request);
        Task task = getActiveTask(id);
        auditChanges(task, request);
        mapper.updateEntity(request, task);
        task.setUpdatedBy(currentUserId());

        Task saved = repository.save(task);
        recalculateProjectProgress(saved.getProjectId());
        auditService.log("UPDATE", "Task", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public TaskResponse updateStatus(UUID id, TaskStatusUpdateRequest request) {
        Task task = getActiveTask(id);
        TaskStatus normalizedStatus = mapper.normalizeStatus(request.status(), task.getDueDate());
        auditService.logChange("Task", task.getId(), "status", task.getStatus(), normalizedStatus);
        task.setStatus(normalizedStatus);
        mapper.stampCompletion(task, normalizedStatus);
        task.setUpdatedBy(currentUserId());

        Task saved = repository.save(task);
        recalculateProjectProgress(saved.getProjectId());
        auditService.log("STATUS_UPDATE", "Task", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        Task task = getActiveTask(id);
        auditService.logChange("Task", task.getId(), "active", task.isActive(), false);
        task.setActive(false);
        task.setStatus(TaskStatus.CANCELADA);
        task.setUpdatedBy(currentUserId());
        repository.save(task);
        recalculateProjectProgress(task.getProjectId());
        auditService.log("SOFT_DELETE", "Task", id);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public List<TaskResponse> syncProjectTasks(Project project,
                                               List<DeliveryResponse> deliveries,
                                               Optional<ServiceOffering> service) {
        List<Task> currentTasks = repository.findByProjectIdAndActiveTrue(project.getId());

        if (!project.isActive() || project.getStatus() == ProjectStatus.CANCELADO) {
            currentTasks.forEach(this::cancelOpenTask);
            return List.of();
        }

        List<String> checklist = checklistItems(service);
        Map<String, Task> tasksByTitle = currentTasks.stream()
                .collect(Collectors.toMap(task -> normalizeKey(task.getTitle()), Function.identity(), (first, ignored) -> first));
        List<DeliveryResponse> orderedDeliveries = deliveries.stream()
                .sorted(Comparator.comparing(DeliveryResponse::deadline))
                .toList();
        List<TaskResponse> responses = new ArrayList<>();

        for (int index = 0; index < checklist.size(); index++) {
            String checklistItem = checklist.get(index);
            DeliveryResponse delivery = relatedDelivery(orderedDeliveries, index);
            Task task = tasksByTitle.getOrDefault(normalizeKey(checklistItem), new Task());
            boolean isNewTask = task.getId() == null;
            applyProjectTask(project, checklistItem, delivery, index, checklist.size(), task);
            Task saved = repository.save(task);
            auditService.log(isNewTask ? "CREATE_PROJECT_TASK" : "UPDATE_PROJECT_TASK", "Task", saved.getId());
            responses.add(mapper.toResponse(saved));
        }

        return responses;
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public List<TaskResponse> createContractProjectTasks(Project project,
                                                         Contract contract,
                                                         List<ContractServiceItem> serviceItems) {
        List<Task> currentTasks = repository.findByProjectIdAndActiveTrue(project.getId());
        if (!currentTasks.isEmpty()) {
            return currentTasks.stream()
                    .sorted(Comparator.comparing(Task::getSortOrder).thenComparing(Task::getCreatedAt))
                    .map(mapper::toResponse)
                    .toList();
        }

        List<TaskResponse> responses = new ArrayList<>();
        int sortOrder = 10;
        LocalDate startDate = project.getStartDate() == null ? LocalDate.now() : project.getStartDate();

        for (ContractServiceItem item : serviceItems) {
            List<ServiceTaskTemplate> templates = item.getServiceId() == null
                    ? List.of()
                    : serviceTaskTemplateRepository.findByServiceIdAndActiveTrueOrderBySortOrderAsc(item.getServiceId());

            if (templates.isEmpty()) {
                Task fallbackTask = taskFromFallback(project, contract, item, sortOrder, startDate);
                Task saved = repository.save(fallbackTask);
                auditService.log("CREATE_CONTRACT_PROJECT_TASK", "Task", saved.getId());
                responses.add(mapper.toResponse(saved));
                sortOrder += 10;
                continue;
            }

            for (ServiceTaskTemplate template : templates) {
                Task task = taskFromTemplate(project, contract, item, template, sortOrder, startDate);
                Task saved = repository.save(task);
                auditService.log("CREATE_CONTRACT_PROJECT_TASK", "Task", saved.getId());
                responses.add(mapper.toResponse(saved));
                sortOrder += 10;
            }
        }

        recalculateProjectProgress(project.getId());
        return responses;
    }

    private Task getActiveTask(UUID id) {
        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa nao encontrada"));
    }

    private void validateReferences(TaskRequest request) {
        if (projectRepository.findByIdAndActiveTrue(request.projectId()).isEmpty()) {
            throw new EntityNotFoundException("Projeto ativo nao encontrado para a tarefa");
        }
        if (request.deliveryId() != null && !deliveryRepository.existsById(request.deliveryId())) {
            throw new EntityNotFoundException("Entrega nao encontrada para a tarefa");
        }
        if (request.clientId() != null && !clientRepository.existsById(request.clientId())) {
            throw new EntityNotFoundException("Cliente nao encontrado para a tarefa");
        }
        if (request.contractId() != null && !contractRepository.existsById(request.contractId())) {
            throw new EntityNotFoundException("Contrato nao encontrado para a tarefa");
        }
        if (request.serviceId() != null && serviceOfferingRepository.findByIdAndActiveTrue(request.serviceId()).isEmpty()) {
            throw new EntityNotFoundException("Servico ativo nao encontrado para a tarefa");
        }
    }

    private void auditChanges(Task task, TaskRequest request) {
        auditService.logChange("Task", task.getId(), "projectId", task.getProjectId(), request.projectId());
        auditService.logChange("Task", task.getId(), "deliveryId", task.getDeliveryId(), request.deliveryId());
        auditService.logChange("Task", task.getId(), "clientId", task.getClientId(), request.clientId());
        auditService.logChange("Task", task.getId(), "contractId", task.getContractId(), request.contractId());
        auditService.logChange("Task", task.getId(), "serviceId", task.getServiceId(), request.serviceId());
        auditService.logChange("Task", task.getId(), "responsibleUserId", task.getResponsibleUserId(), request.responsibleUserId());
        auditService.logChange("Task", task.getId(), "title", task.getTitle(), request.title().trim());
        auditService.logChange("Task", task.getId(), "description", task.getDescription(), normalizeNullable(request.description()));
        auditService.logChange("Task", task.getId(), "checklist", task.getChecklist(), normalizeNullable(request.checklist()));
        auditService.logChange("Task", task.getId(), "comments", task.getComments(), normalizeNullable(request.comments()));
        auditService.logChange("Task", task.getId(), "priority", task.getPriority(), request.priority());
        auditService.logChange("Task", task.getId(), "dueDate", task.getDueDate(), request.dueDate());
        auditService.logChange("Task", task.getId(), "status", task.getStatus(), mapper.normalizeStatus(request.status(), request.dueDate()));
        auditService.logChange("Task", task.getId(), "sortOrder", task.getSortOrder(), request.sortOrder() == null ? 0 : request.sortOrder());
        auditService.logChange("Task", task.getId(), "active", task.isActive(), request.active() == null || request.active());
    }

    private TaskFilterRequest withDefaultActiveFilter(TaskFilterRequest filter) {
        return new TaskFilterRequest(
                filter.search(),
                filter.projectId(),
                filter.deliveryId(),
                filter.responsibleUserId(),
                filter.priority(),
                filter.status(),
                filter.dueFrom(),
                filter.dueTo(),
                filter.active() == null ? true : filter.active(),
                filter.createdFrom(),
                filter.createdTo()
        );
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

    private void applyProjectTask(Project project,
                                  String checklistItem,
                                  DeliveryResponse delivery,
                                  int index,
                                  int totalTasks,
                                  Task task) {
        task.setProjectId(project.getId());
        task.setDeliveryId(delivery == null ? task.getDeliveryId() : delivery.id());
        task.setClientId(project.getClientId());
        task.setContractId(project.getContractId());
        task.setServiceId(project.getServiceId());
        task.setResponsibleUserId(task.getResponsibleUserId() == null ? project.getResponsibleUserId() : task.getResponsibleUserId());
        task.setTitle(truncate(checklistItem, 180));
        task.setDescription(taskDescription(project, delivery));
        task.setPriority(taskPriority(project));
        task.setDueDate(taskDueDate(project, delivery, index, totalTasks));
        task.setStatus(taskStatus(project.getStatus(), task.getStatus()));
        task.setSortOrder(index * 10);
        mapper.stampCompletion(task, task.getStatus());
        task.setActive(true);
        task.setUpdatedBy(currentUserId());
        if (task.getCreatedBy() == null) {
            task.setCreatedBy(currentUserId());
        }
    }

    private void cancelOpenTask(Task task) {
        if (task.getStatus() == TaskStatus.CONCLUIDA) {
            return;
        }
        auditService.logChange("Task", task.getId(), "status", task.getStatus(), TaskStatus.CANCELADA);
        auditService.logChange("Task", task.getId(), "active", task.isActive(), false);
        task.setStatus(TaskStatus.CANCELADA);
        task.setActive(false);
        task.setUpdatedBy(currentUserId());
        repository.save(task);
        auditService.log("CANCEL_PROJECT_TASK", "Task", task.getId());
    }

    private List<String> checklistItems(Optional<ServiceOffering> service) {
        return splitOperationalTemplate(service.map(ServiceOffering::getDefaultChecklist).orElse(null), List.of(
                "Validar briefing do projeto",
                "Executar producao principal",
                "Revisar entrega com criterios de qualidade",
                "Preparar aprovacao e handoff"
        ));
    }

    private List<String> splitOperationalTemplate(String value, List<String> fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        List<String> items = java.util.Arrays.stream(value.split("[\\r\\n;,|]+"))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .distinct()
                .limit(30)
                .toList();
        return items.isEmpty() ? fallback : items;
    }

    private DeliveryResponse relatedDelivery(List<DeliveryResponse> deliveries, int index) {
        if (deliveries.isEmpty()) {
            return null;
        }
        return deliveries.get(Math.min(index, deliveries.size() - 1));
    }

    private String taskDescription(Project project, DeliveryResponse delivery) {
        if (delivery == null) {
            return "Tarefa automatica do projeto " + project.getName() + ".";
        }
        return "Tarefa automatica vinculada a entrega " + delivery.title() + ".";
    }

    private Task taskFromTemplate(Project project,
                                  Contract contract,
                                  ContractServiceItem item,
                                  ServiceTaskTemplate template,
                                  int sortOrder,
                                  LocalDate startDate) {
        Task task = baseContractProjectTask(project, contract, item, sortOrder);
        task.setTitle(truncate(template.getTitle().trim(), 180));
        task.setDescription(templateDescription(project, item, template));
        task.setPriority(template.getDefaultPriority() == null ? TaskPriority.MEDIA : template.getDefaultPriority());
        task.setDueDate(startDate.plusDays(Math.max(0, template.getEstimatedDays() == null ? 1 : template.getEstimatedDays())));
        return task;
    }

    private Task taskFromFallback(Project project,
                                  Contract contract,
                                  ContractServiceItem item,
                                  int sortOrder,
                                  LocalDate startDate) {
        Task task = baseContractProjectTask(project, contract, item, sortOrder);
        String serviceName = item.getServiceNameSnapshot() == null ? "servico contratado" : item.getServiceNameSnapshot();
        task.setTitle(truncate("Executar servico: " + serviceName, 180));
        task.setDescription("Tarefa operacional criada como fallback. Configure templates no servico para proximos projetos.");
        task.setPriority(TaskPriority.MEDIA);
        task.setDueDate(startDate.plusDays(3));
        return task;
    }

    private Task baseContractProjectTask(Project project, Contract contract, ContractServiceItem item, int sortOrder) {
        Task task = new Task();
        task.setProjectId(project.getId());
        task.setClientId(project.getClientId());
        task.setContractId(contract.getId());
        task.setServiceId(item.getServiceId());
        task.setResponsibleUserId(project.getResponsibleUserId());
        task.setStatus(TaskStatus.PENDENTE);
        task.setActive(true);
        task.setSortOrder(sortOrder);
        task.setCreatedBy(currentUserId());
        task.setUpdatedBy(currentUserId());
        return task;
    }

    private String templateDescription(Project project, ContractServiceItem item, ServiceTaskTemplate template) {
        String serviceName = item.getServiceNameSnapshot() == null ? "Servico contratado" : item.getServiceNameSnapshot();
        String description = template.getDescription() == null || template.getDescription().isBlank()
                ? "Tarefa gerada a partir do template operacional do servico."
                : template.getDescription().trim();
        return description + "\n\nServico: " + serviceName + "\nProjeto: " + project.getName();
    }

    private void recalculateProjectProgress(UUID projectId) {
        if (projectId == null) {
            return;
        }
        List<Task> tasks = repository.findByProjectIdAndActiveTrue(projectId);
        projectRepository.findByIdAndActiveTrue(projectId).ifPresent(project -> {
            if (tasks.isEmpty()) {
                project.setProgress(0);
            } else {
                long completed = tasks.stream().filter(task -> task.getStatus() == TaskStatus.CONCLUIDA).count();
                project.setProgress((int) Math.round((completed * 100.0) / tasks.size()));
            }
            project.setUpdatedBy(currentUserId());
            projectRepository.save(project);
        });
    }

    private TaskPriority taskPriority(Project project) {
        if (project.getSlaDueDate() != null && !project.getSlaDueDate().isAfter(LocalDate.now().plusDays(3))) {
            return TaskPriority.ALTA;
        }
        return TaskPriority.MEDIA;
    }

    private LocalDate taskDueDate(Project project, DeliveryResponse delivery, int index, int totalTasks) {
        if (delivery != null) {
            return delivery.deadline();
        }
        LocalDate end = project.getSlaDueDate() == null ? LocalDate.now().plusDays(7) : project.getSlaDueDate();
        long days = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), end));
        long offset = Math.max(1, Math.round((double) days * (index + 1) / totalTasks));
        return LocalDate.now().plusDays(offset);
    }

    private TaskStatus taskStatus(ProjectStatus projectStatus, TaskStatus currentStatus) {
        if (currentStatus == TaskStatus.CONCLUIDA || currentStatus == TaskStatus.CANCELADA) {
            return currentStatus;
        }
        return switch (projectStatus) {
            case EM_EXECUCAO -> TaskStatus.EM_ANDAMENTO;
            case EM_REVISAO, AGUARDANDO_CLIENTE -> TaskStatus.EM_REVISAO;
            case FINALIZADO -> TaskStatus.CONCLUIDA;
            default -> TaskStatus.PENDENTE;
        };
    }

    private String normalizeKey(String value) {
        String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private String truncate(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
