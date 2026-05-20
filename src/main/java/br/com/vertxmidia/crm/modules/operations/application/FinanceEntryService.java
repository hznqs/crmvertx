package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryRequest;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryResponse;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceSummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final ClientRepository clientRepository;
    private final AuditService auditService;

    public FinanceEntryService(FinanceEntryRepository repository, ClientRepository clientRepository, AuditService auditService) {
        this.repository = repository;
        this.clientRepository = clientRepository;
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

    @Transactional(readOnly = true)
    public FinanceSummaryResponse summary(LocalDate from, LocalDate to) {
        BigDecimal activeClientRecurring = clientRepository.sumContractValueByPhase(ClientPhase.FECHADO);
        BigDecimal recurringEntries = repository.sumRecurringByTypeAndPeriod("receita", from, to);
        BigDecimal revenueEntries = repository.sumByTypeAndPeriod("receita", from, to);
        BigDecimal expenses = repository.sumByTypeAndPeriod("despesa", from, to);
        BigDecimal commissions = repository.sumByTypeAndPeriod("comissao", from, to);
        BigDecimal taxes = repository.sumByTypeAndPeriod("imposto", from, to);
        BigDecimal overdue = repository.sumByStatusAndPeriod("vencido", from, to);
        long autoBilling = repository.countAutoBillingByPeriod(from, to);

        BigDecimal recurringRevenue = activeClientRecurring.add(recurringEntries);
        BigDecimal grossRevenue = activeClientRecurring.add(revenueEntries);
        BigDecimal forecast = grossRevenue.add(recurringRevenue);
        BigDecimal netProfit = grossRevenue.subtract(expenses).subtract(commissions).subtract(taxes);
        BigDecimal margin = grossRevenue.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.multiply(BigDecimal.valueOf(100)).divide(grossRevenue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new FinanceSummaryResponse(
                recurringRevenue,
                forecast,
                netProfit,
                margin,
                overdue,
                autoBilling,
                commissions,
                taxes,
                grossRevenue,
                expenses
        );
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
