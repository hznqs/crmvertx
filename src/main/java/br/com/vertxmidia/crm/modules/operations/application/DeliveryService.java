package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.Delivery;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryRequest;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryResponse;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryStatusUpdateRequest;
import br.com.vertxmidia.crm.modules.operations.dto.DeliverySummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import jakarta.persistence.EntityNotFoundException;
import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeliveryService {

    private static final String DEFAULT_OWNER = "Operacional";

    private final DeliveryRepository repository;
    private final AuditService auditService;

    public DeliveryService(DeliveryRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<DeliveryResponse> search(String status, String owner, UUID clientId, Pageable pageable) {
        Specification<Delivery> spec = Specification
                .where(OperationSpecifications.<Delivery>equalsText("status", status))
                .and(OperationSpecifications.textLike("owner", owner))
                .and(OperationSpecifications.equalsUuid("clientId", clientId))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
        return repository.findAll(spec, pageable).map(DeliveryResponse::from);
    }

    @Transactional(readOnly = true)
    public DeliveryResponse findById(UUID id) {
        return DeliveryResponse.from(get(id));
    }

    @Transactional(readOnly = true)
    public DeliverySummaryResponse summary(UUID clientId, String owner) {
        String normalizedOwner = owner == null ? "" : owner.trim();
        return new DeliverySummaryResponse(
                repository.countByStatusAndFilters("backlog", clientId, normalizedOwner)
                        + repository.countByStatusAndFilters("pendente", clientId, normalizedOwner)
                        + repository.countByStatusAndFilters("planejamento", clientId, normalizedOwner),
                repository.countByStatusAndFilters("producao", clientId, normalizedOwner),
                repository.countByStatusAndFilters("revisao", clientId, normalizedOwner)
                        + repository.countByStatusAndFilters("ajustes", clientId, normalizedOwner),
                repository.countByStatusAndFilters("aprovado", clientId, normalizedOwner),
                repository.countLateByFilters(LocalDate.now(), clientId, normalizedOwner)
        );
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public DeliveryResponse create(DeliveryRequest request) {
        Delivery delivery = new Delivery();
        apply(request, delivery);
        Delivery saved = repository.save(delivery);
        auditService.log("CREATE", "Entrega", saved.getId());
        return DeliveryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public DeliveryResponse update(UUID id, DeliveryRequest request) {
        Delivery delivery = get(id);
        auditDeliveryChanges(delivery, request);
        apply(request, delivery);
        Delivery saved = repository.save(delivery);
        auditService.log("UPDATE", "Entrega", saved.getId());
        return DeliveryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public DeliveryResponse updateStatus(UUID id, DeliveryStatusUpdateRequest request) {
        Delivery delivery = get(id);
        String newStatus = request.status().trim();
        auditService.logChange("Entrega", delivery.getId(), "status", delivery.getStatus(), newStatus);
        delivery.setStatus(newStatus);
        stampStatusTimestamps(delivery, newStatus);
        Delivery saved = repository.save(delivery);
        auditService.log("STATUS_UPDATE", "Entrega", saved.getId());
        return DeliveryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        Delivery delivery = get(id);
        delivery.setActive(false);
        repository.save(delivery);
        auditService.log("SOFT_DELETE", "Entrega", id);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public List<DeliveryResponse> syncProjectDeliveries(Project project, Optional<ServiceOffering> service) {
        List<Delivery> currentDeliveries = repository.findByProjectIdAndActiveTrue(project.getId());

        if (!project.isActive() || project.getStatus() == ProjectStatus.CANCELADO) {
            currentDeliveries.forEach(this::cancelOpenDelivery);
            return List.of();
        }

        List<String> stages = deliveryStages(service);
        Map<String, Delivery> deliveriesByType = currentDeliveries.stream()
                .collect(Collectors.toMap(delivery -> normalizeKey(delivery.getType()), Function.identity(), (first, ignored) -> first));
        List<DeliveryResponse> responses = new ArrayList<>();

        for (int index = 0; index < stages.size(); index++) {
            String stage = stages.get(index);
            String type = deliveryType(stage);
            Delivery delivery = deliveriesByType.getOrDefault(normalizeKey(type), new Delivery());
            boolean isNewDelivery = delivery.getId() == null;
            applyProjectDelivery(project, service, stage, type, deliveryDeadline(project, index, stages.size()), delivery);
            Delivery saved = repository.save(delivery);
            auditService.log(isNewDelivery ? "CREATE_PROJECT_DELIVERY" : "UPDATE_PROJECT_DELIVERY", "Entrega", saved.getId());
            responses.add(DeliveryResponse.from(saved));
        }

        return responses;
    }

    private Delivery get(UUID id) {
        return repository.findById(id)
                .filter(Delivery::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Entrega nao encontrada"));
    }

    private void apply(DeliveryRequest request, Delivery delivery) {
        delivery.setClientId(request.clientId());
        delivery.setProjectId(request.projectId());
        delivery.setContractId(request.contractId());
        delivery.setServiceId(request.serviceId());
        delivery.setType(request.type().trim());
        delivery.setTitle(request.title().trim());
        delivery.setDescription(blankToNull(request.description()));
        delivery.setOwner(request.owner().trim());
        delivery.setDeadline(request.deadline());
        delivery.setStatus(request.status().trim());
        delivery.setPriority(defaultPriority(request.priority()));
        delivery.setProgress(request.progress() == null ? 0 : request.progress());
        delivery.setTags(blankToNull(request.tags()));
        stampStatusTimestamps(delivery, request.status().trim());
        if (request.active() != null) {
            delivery.setActive(request.active());
        }
    }

    private void auditDeliveryChanges(Delivery delivery, DeliveryRequest request) {
        auditService.logChange("Entrega", delivery.getId(), "clientId", delivery.getClientId(), request.clientId());
        auditService.logChange("Entrega", delivery.getId(), "projectId", delivery.getProjectId(), request.projectId());
        auditService.logChange("Entrega", delivery.getId(), "contractId", delivery.getContractId(), request.contractId());
        auditService.logChange("Entrega", delivery.getId(), "serviceId", delivery.getServiceId(), request.serviceId());
        auditService.logChange("Entrega", delivery.getId(), "type", delivery.getType(), request.type().trim());
        auditService.logChange("Entrega", delivery.getId(), "title", delivery.getTitle(), request.title().trim());
        auditService.logChange("Entrega", delivery.getId(), "description", delivery.getDescription(), blankToNull(request.description()));
        auditService.logChange("Entrega", delivery.getId(), "owner", delivery.getOwner(), request.owner().trim());
        auditService.logChange("Entrega", delivery.getId(), "deadline", delivery.getDeadline(), request.deadline());
        auditService.logChange("Entrega", delivery.getId(), "status", delivery.getStatus(), request.status().trim());
        auditService.logChange("Entrega", delivery.getId(), "priority", delivery.getPriority(), defaultPriority(request.priority()));
        auditService.logChange("Entrega", delivery.getId(), "progress", delivery.getProgress(), request.progress() == null ? 0 : request.progress());
        auditService.logChange("Entrega", delivery.getId(), "tags", delivery.getTags(), blankToNull(request.tags()));
    }

    private void stampStatusTimestamps(Delivery delivery, String status) {
        Instant now = Instant.now();
        if ("aprovado".equalsIgnoreCase(status) && delivery.getApprovedAt() == null) {
            delivery.setApprovedAt(now);
        }
        if ("aprovado".equalsIgnoreCase(status) && delivery.getDeliveredAt() == null) {
            delivery.setDeliveredAt(now);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String defaultPriority(String value) {
        return value == null || value.isBlank() ? "MEDIA" : value.trim().toUpperCase();
    }

    private void applyProjectDelivery(Project project,
                                      Optional<ServiceOffering> service,
                                      String stage,
                                      String type,
                                      LocalDate deadline,
                                      Delivery delivery) {
        delivery.setClientId(project.getClientId());
        delivery.setProjectId(project.getId());
        delivery.setContractId(project.getContractId());
        delivery.setServiceId(project.getServiceId());
        delivery.setType(type);
        delivery.setTitle(deliveryTitle(project, stage));
        delivery.setDescription(deliveryDescription(project, service, stage));
        delivery.setOwner(delivery.getOwner() == null || delivery.getOwner().isBlank() ? DEFAULT_OWNER : delivery.getOwner());
        delivery.setDeadline(deadline);
        delivery.setStatus(deliveryStatus(project.getStatus(), delivery.getStatus()));
        delivery.setPriority(project.getPriority() == null ? "MEDIA" : project.getPriority());
        delivery.setProgress(project.getProgress() == null ? 0 : project.getProgress());
        delivery.setActive(true);
        stampStatusTimestamps(delivery, delivery.getStatus());
    }

    private void cancelOpenDelivery(Delivery delivery) {
        if ("aprovado".equalsIgnoreCase(delivery.getStatus())) {
            return;
        }
        auditService.logChange("Entrega", delivery.getId(), "active", delivery.isActive(), false);
        delivery.setActive(false);
        repository.save(delivery);
        auditService.log("CANCEL_PROJECT_DELIVERY", "Entrega", delivery.getId());
    }

    private List<String> deliveryStages(Optional<ServiceOffering> service) {
        return splitOperationalTemplate(service.map(ServiceOffering::getDeliveryStages).orElse(null), "Entrega principal");
    }

    private List<String> splitOperationalTemplate(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return List.of(fallback);
        }

        List<String> items = java.util.Arrays.stream(value.split("[\\r\\n;,|]+"))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .distinct()
                .limit(12)
                .toList();
        return items.isEmpty() ? List.of(fallback) : items;
    }

    private String deliveryType(String stage) {
        return truncate(normalizeKey(stage).replace('-', '_'), 80);
    }

    private String deliveryTitle(Project project, String stage) {
        return truncate(stage + " - " + project.getName(), 180);
    }

    private String deliveryDescription(Project project, Optional<ServiceOffering> service, String stage) {
        String serviceName = service.map(ServiceOffering::getName).orElse("servico vinculado");
        return truncateText("Entrega automatica da etapa \"" + stage + "\" para o projeto " + project.getName()
                + " baseada no " + serviceName + ".", 10000);
    }

    private LocalDate deliveryDeadline(Project project, int index, int totalStages) {
        LocalDate start = LocalDate.now();
        LocalDate end = project.getSlaDueDate() == null ? start.plusDays(7) : project.getSlaDueDate();
        long days = Math.max(1, ChronoUnit.DAYS.between(start, end));
        long offset = Math.max(1, Math.round((double) days * (index + 1) / totalStages));
        return start.plusDays(offset);
    }

    private String deliveryStatus(ProjectStatus projectStatus, String currentStatus) {
        if ("aprovado".equalsIgnoreCase(currentStatus)) {
            return "aprovado";
        }
        return switch (projectStatus) {
            case EM_EXECUCAO -> "producao";
            case EM_REVISAO, AGUARDANDO_CLIENTE -> "revisao";
            case FINALIZADO -> "aprovado";
            default -> "backlog";
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

    private String truncateText(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
