package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.Delivery;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryRequest;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryResponse;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryStatusUpdateRequest;
import br.com.vertxmidia.crm.modules.operations.dto.DeliverySummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeliveryService {

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
                .and(OperationSpecifications.equalsUuid("clientId", clientId));
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
                repository.countByStatusAndFilters("pendente", clientId, normalizedOwner),
                repository.countByStatusAndFilters("producao", clientId, normalizedOwner),
                repository.countByStatusAndFilters("revisao", clientId, normalizedOwner),
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
        Delivery saved = repository.save(delivery);
        auditService.log("STATUS_UPDATE", "Entrega", saved.getId());
        return DeliveryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Entrega nao encontrada");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Entrega", id);
    }

    private Delivery get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entrega nao encontrada"));
    }

    private void apply(DeliveryRequest request, Delivery delivery) {
        delivery.setClientId(request.clientId());
        delivery.setType(request.type().trim());
        delivery.setTitle(request.title().trim());
        delivery.setOwner(request.owner().trim());
        delivery.setDeadline(request.deadline());
        delivery.setStatus(request.status().trim());
    }

    private void auditDeliveryChanges(Delivery delivery, DeliveryRequest request) {
        auditService.logChange("Entrega", delivery.getId(), "clientId", delivery.getClientId(), request.clientId());
        auditService.logChange("Entrega", delivery.getId(), "type", delivery.getType(), request.type().trim());
        auditService.logChange("Entrega", delivery.getId(), "title", delivery.getTitle(), request.title().trim());
        auditService.logChange("Entrega", delivery.getId(), "owner", delivery.getOwner(), request.owner().trim());
        auditService.logChange("Entrega", delivery.getId(), "deadline", delivery.getDeadline(), request.deadline());
        auditService.logChange("Entrega", delivery.getId(), "status", delivery.getStatus(), request.status().trim());
    }
}
