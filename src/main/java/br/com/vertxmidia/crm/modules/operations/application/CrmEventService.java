package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import br.com.vertxmidia.crm.modules.operations.dto.CrmEventRequest;
import br.com.vertxmidia.crm.modules.operations.dto.CrmEventResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CrmEventRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CrmEventService {

    private final CrmEventRepository repository;
    private final AuditService auditService;

    public CrmEventService(CrmEventRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<CrmEventResponse> search(String status, UUID clientId, LocalDate from, LocalDate to, Pageable pageable) {
        Specification<CrmEvent> spec = Specification
                .where(OperationSpecifications.<CrmEvent>equalsText("status", status))
                .and(OperationSpecifications.equalsUuid("clientId", clientId))
                .and(OperationSpecifications.dateFrom("date", from))
                .and(OperationSpecifications.dateTo("date", to));
        return repository.findAll(spec, pageable).map(CrmEventResponse::from);
    }

    @Transactional(readOnly = true)
    public CrmEventResponse findById(UUID id) {
        return CrmEventResponse.from(get(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public CrmEventResponse create(CrmEventRequest request) {
        CrmEvent event = new CrmEvent();
        apply(request, event);
        CrmEvent saved = repository.save(event);
        auditService.log("CREATE", "Evento", saved.getId());
        return CrmEventResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public CrmEventResponse update(UUID id, CrmEventRequest request) {
        CrmEvent event = get(id);
        auditEventChanges(event, request);
        apply(request, event);
        CrmEvent saved = repository.save(event);
        auditService.log("UPDATE", "Evento", saved.getId());
        return CrmEventResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Evento nao encontrado");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Evento", id);
    }

    private CrmEvent get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento nao encontrado"));
    }

    private void apply(CrmEventRequest request, CrmEvent event) {
        event.setClientId(request.clientId());
        event.setTitle(request.title().trim());
        event.setDate(request.date());
        event.setTime(request.time());
        event.setStatus(request.status().trim());
        event.setSale(request.sale());
        event.setRevenue(request.revenue() == null ? BigDecimal.ZERO : request.revenue());
    }

    private void auditEventChanges(CrmEvent event, CrmEventRequest request) {
        auditService.logChange("Evento", event.getId(), "clientId", event.getClientId(), request.clientId());
        auditService.logChange("Evento", event.getId(), "title", event.getTitle(), request.title().trim());
        auditService.logChange("Evento", event.getId(), "date", event.getDate(), request.date());
        auditService.logChange("Evento", event.getId(), "time", event.getTime(), request.time());
        auditService.logChange("Evento", event.getId(), "status", event.getStatus(), request.status().trim());
        auditService.logChange("Evento", event.getId(), "sale", event.isSale(), request.sale());
        auditService.logChange("Evento", event.getId(), "revenue", event.getRevenue(), request.revenue() == null ? BigDecimal.ZERO : request.revenue());
    }
}
