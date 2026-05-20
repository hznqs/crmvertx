package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryRequest;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
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
public class FinanceEntryService {

    private final FinanceEntryRepository repository;
    private final AuditService auditService;

    public FinanceEntryService(FinanceEntryRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<FinanceEntryResponse> search(String type, String status, LocalDate from, LocalDate to, Pageable pageable) {
        Specification<FinanceEntry> spec = Specification
                .where(OperationSpecifications.<FinanceEntry>equalsText("type", type))
                .and(OperationSpecifications.equalsText("status", status))
                .and(OperationSpecifications.dateFrom("due", from))
                .and(OperationSpecifications.dateTo("due", to));
        return repository.findAll(spec, pageable).map(FinanceEntryResponse::from);
    }

    @Transactional(readOnly = true)
    public FinanceEntryResponse findById(UUID id) {
        return FinanceEntryResponse.from(get(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public FinanceEntryResponse create(FinanceEntryRequest request) {
        FinanceEntry entry = new FinanceEntry();
        apply(request, entry);
        FinanceEntry saved = repository.save(entry);
        auditService.log("CREATE", "Lancamento financeiro", saved.getId());
        return FinanceEntryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public FinanceEntryResponse update(UUID id, FinanceEntryRequest request) {
        FinanceEntry entry = get(id);
        auditFinanceChanges(entry, request);
        apply(request, entry);
        FinanceEntry saved = repository.save(entry);
        auditService.log("UPDATE", "Lancamento financeiro", saved.getId());
        return FinanceEntryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Lancamento financeiro nao encontrado");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Lancamento financeiro", id);
    }

    private FinanceEntry get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lancamento financeiro nao encontrado"));
    }

    private void apply(FinanceEntryRequest request, FinanceEntry entry) {
        entry.setType(request.type().trim());
        entry.setStatus(request.status().trim());
        entry.setDescription(request.description().trim());
        entry.setValue(request.value() == null ? BigDecimal.ZERO : request.value());
        entry.setDue(request.due());
        entry.setRecurring(request.recurring());
        entry.setAutoBilling(request.autoBilling());
    }

    private void auditFinanceChanges(FinanceEntry entry, FinanceEntryRequest request) {
        auditService.logChange("Lancamento financeiro", entry.getId(), "type", entry.getType(), request.type().trim());
        auditService.logChange("Lancamento financeiro", entry.getId(), "status", entry.getStatus(), request.status().trim());
        auditService.logChange("Lancamento financeiro", entry.getId(), "description", entry.getDescription(), request.description().trim());
        auditService.logChange("Lancamento financeiro", entry.getId(), "value", entry.getValue(), request.value() == null ? BigDecimal.ZERO : request.value());
        auditService.logChange("Lancamento financeiro", entry.getId(), "due", entry.getDue(), request.due());
        auditService.logChange("Lancamento financeiro", entry.getId(), "recurring", entry.isRecurring(), request.recurring());
        auditService.logChange("Lancamento financeiro", entry.getId(), "autoBilling", entry.isAutoBilling(), request.autoBilling());
    }
}
