package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryRequest;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryResponse;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceSummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinanceEntryService {

    private static final String TYPE_REVENUE = "receita";
    private static final String TYPE_EXPENSE = "despesa";
    private static final String STATUS_PENDING = "pendente";
    private static final String STATUS_PAID = "pago";
    private static final String STATUS_CANCELED = "cancelado";
    private static final String CONTRACT_REVENUE_COST_CENTER = "vendas";
    private static final String COMMISSION_EXPENSE_COST_CENTER = "vendas";
    private static final LocalDate MIN_REPORT_DATE = LocalDate.of(1900, 1, 1);
    private static final LocalDate MAX_REPORT_DATE = LocalDate.of(9999, 12, 31);

    private final FinanceEntryRepository repository;
    private final ContractRepository contractRepository;
    private final AuditService auditService;

    public FinanceEntryService(FinanceEntryRepository repository,
                               ContractRepository contractRepository,
                               AuditService auditService) {
        this.repository = repository;
        this.contractRepository = contractRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<FinanceEntryResponse> search(String type, String status, LocalDate from, LocalDate to, Pageable pageable) {
        Specification<FinanceEntry> spec = Specification
                .where(OperationSpecifications.<FinanceEntry>equalsText("type", type))
                .and(OperationSpecifications.equalsText("status", status))
                .and(OperationSpecifications.dateFrom("due", from))
                .and(OperationSpecifications.dateTo("due", to))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
        return repository.findAll(spec, pageable).map(FinanceEntryResponse::from);
    }

    @Transactional(readOnly = true)
    public FinanceEntryResponse findById(UUID id) {
        return FinanceEntryResponse.from(get(id));
    }

    @Transactional(readOnly = true)
    public FinanceSummaryResponse summary(LocalDate from, LocalDate to) {
        LocalDate periodStart = normalizePeriodStart(from);
        LocalDate periodEnd = normalizePeriodEnd(to);
        BigDecimal activeClientRecurring = contractRepository.sumMonthlyValueByStatusAndActiveTrue("ativo");
        BigDecimal recurringEntries = repository.sumRecurringByTypeAndPeriod("receita", periodStart, periodEnd);
        BigDecimal revenueEntries = repository.sumByTypeAndPeriod("receita", periodStart, periodEnd);
        BigDecimal expenses = repository.sumByTypeAndPeriod("despesa", periodStart, periodEnd);
        BigDecimal commissions = repository.sumByTypeAndPeriod("comissao", periodStart, periodEnd);
        BigDecimal taxes = repository.sumByTypeAndPeriod("imposto", periodStart, periodEnd);
        BigDecimal overdue = repository.sumByStatusAndPeriod("vencido", periodStart, periodEnd);
        long autoBilling = repository.countAutoBillingByPeriod(periodStart, periodEnd);

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
        entry.setCreatedBy(currentUserId());
        entry.setUpdatedBy(currentUserId());
        FinanceEntry saved = repository.save(entry);
        auditService.log("CREATE", "Lancamento financeiro", saved.getId());
        return FinanceEntryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public Optional<FinanceEntryResponse> syncContractRevenue(Contract contract) {
        Optional<FinanceEntry> currentEntry = repository.findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(contract.getId(), TYPE_REVENUE);

        if (!isRevenueGeneratingContract(contract)) {
            currentEntry.ifPresent(this::cancelAutomaticRevenue);
            return Optional.empty();
        }

        FinanceEntryRequest request = automaticRevenueRequest(contract);
        FinanceEntry entry = currentEntry.orElseGet(FinanceEntry::new);

        if (entry.getId() == null) {
            apply(request, entry);
            entry.setCreatedBy(currentUserId());
            entry.setUpdatedBy(currentUserId());
            FinanceEntry saved = repository.save(entry);
            auditService.log("CREATE_AUTO_BILLING", "Lancamento financeiro", saved.getId());
            return Optional.of(FinanceEntryResponse.from(saved));
        }

        auditFinanceChanges(entry, request);
        apply(request, entry);
        entry.setUpdatedBy(currentUserId());
        FinanceEntry saved = repository.save(entry);
        auditService.log("UPDATE_AUTO_BILLING", "Lancamento financeiro", saved.getId());
        return Optional.of(FinanceEntryResponse.from(saved));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public Optional<FinanceEntryResponse> syncCommissionExpense(CommissionSale commission) {
        Optional<FinanceEntry> currentEntry = automaticCommissionExpense(commission);

        if (!isExpenseGeneratingCommission(commission)) {
            currentEntry.ifPresent(this::cancelAutomaticCommissionExpense);
            return Optional.empty();
        }

        FinanceEntryRequest request = automaticCommissionExpenseRequest(commission);
        FinanceEntry entry = currentEntry.orElseGet(FinanceEntry::new);

        if (entry.getId() == null) {
            apply(request, entry);
            entry.setCreatedBy(currentUserId());
            entry.setUpdatedBy(currentUserId());
            FinanceEntry saved = repository.save(entry);
            commission.setFinanceEntryId(saved.getId());
            auditService.log("CREATE_COMMISSION_EXPENSE", "Lancamento financeiro", saved.getId());
            return Optional.of(FinanceEntryResponse.from(saved));
        }

        if (STATUS_PAID.equalsIgnoreCase(entry.getStatus())) {
            commission.setFinanceEntryId(entry.getId());
            return Optional.of(FinanceEntryResponse.from(entry));
        }

        auditFinanceChanges(entry, request);
        apply(request, entry);
        entry.setUpdatedBy(currentUserId());
        FinanceEntry saved = repository.save(entry);
        commission.setFinanceEntryId(saved.getId());
        auditService.log("UPDATE_COMMISSION_EXPENSE", "Lancamento financeiro", saved.getId());
        return Optional.of(FinanceEntryResponse.from(saved));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public FinanceEntryResponse update(UUID id, FinanceEntryRequest request) {
        FinanceEntry entry = get(id);
        auditFinanceChanges(entry, request);
        apply(request, entry);
        entry.setUpdatedBy(currentUserId());
        FinanceEntry saved = repository.save(entry);
        auditService.log("UPDATE", "Lancamento financeiro", saved.getId());
        return FinanceEntryResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        FinanceEntry entry = get(id);
        auditService.logChange("Lancamento financeiro", entry.getId(), "active", entry.isActive(), false);
        entry.setActive(false);
        entry.setStatus("cancelado");
        entry.setUpdatedBy(currentUserId());
        repository.save(entry);
        auditService.log("SOFT_DELETE", "Lancamento financeiro", id);
    }

    private FinanceEntry get(UUID id) {
        return repository.findById(id)
                .filter(FinanceEntry::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Lancamento financeiro nao encontrado"));
    }

    private void cancelAutomaticRevenue(FinanceEntry entry) {
        auditService.logChange("Lancamento financeiro", entry.getId(), "status", entry.getStatus(), STATUS_CANCELED);
        auditService.logChange("Lancamento financeiro", entry.getId(), "active", entry.isActive(), false);
        entry.setStatus(STATUS_CANCELED);
        entry.setActive(false);
        entry.setUpdatedBy(currentUserId());
        FinanceEntry saved = repository.save(entry);
        auditService.log("CANCEL_AUTO_BILLING", "Lancamento financeiro", saved.getId());
    }

    private void cancelAutomaticCommissionExpense(FinanceEntry entry) {
        if (STATUS_PAID.equalsIgnoreCase(entry.getStatus())) {
            return;
        }
        auditService.logChange("Lancamento financeiro", entry.getId(), "status", entry.getStatus(), STATUS_CANCELED);
        auditService.logChange("Lancamento financeiro", entry.getId(), "active", entry.isActive(), false);
        entry.setStatus(STATUS_CANCELED);
        entry.setActive(false);
        entry.setUpdatedBy(currentUserId());
        FinanceEntry saved = repository.save(entry);
        auditService.log("CANCEL_COMMISSION_EXPENSE", "Lancamento financeiro", saved.getId());
    }

    private boolean isRevenueGeneratingContract(Contract contract) {
        return contract.isActive()
                && "ativo".equalsIgnoreCase(contract.getStatus())
                && automaticRevenueValue(contract).compareTo(BigDecimal.ZERO) > 0;
    }

    private FinanceEntryRequest automaticRevenueRequest(Contract contract) {
        return new FinanceEntryRequest(
                contract.getClientId(),
                contract.getId(),
                contract.getProjectId(),
                contract.getServiceId(),
                TYPE_REVENUE,
                STATUS_PENDING,
                "Receita automatica do contrato " + contract.getPlan(),
                automaticRevenueValue(contract),
                automaticRevenueDueDate(contract),
                contract.isAutoRenew() || contract.getDurationMonths() > 1,
                true,
                CONTRACT_REVENUE_COST_CENTER,
                null,
                null,
                true
        );
    }

    private Optional<FinanceEntry> automaticCommissionExpense(CommissionSale commission) {
        if (commission.getFinanceEntryId() != null) {
            Optional<FinanceEntry> entry = repository.findById(commission.getFinanceEntryId())
                    .filter(FinanceEntry::isActive);
            if (entry.isPresent()) {
                return entry;
            }
        }
        if (commission.getContractId() == null) {
            return Optional.empty();
        }
        return repository.findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(commission.getContractId(), TYPE_EXPENSE);
    }

    private boolean isExpenseGeneratingCommission(CommissionSale commission) {
        return commission.isActive()
                && "PAGA".equalsIgnoreCase(commission.getStatus())
                && commissionValue(commission).compareTo(BigDecimal.ZERO) > 0;
    }

    private FinanceEntryRequest automaticCommissionExpenseRequest(CommissionSale commission) {
        return new FinanceEntryRequest(
                null,
                commission.getContractId(),
                null,
                null,
                TYPE_EXPENSE,
                STATUS_PAID,
                "Despesa automatica da comissao " + commissionDescription(commission),
                commissionValue(commission),
                commissionExpenseDate(commission),
                false,
                true,
                COMMISSION_EXPENSE_COST_CENTER,
                null,
                null,
                true
        );
    }

    private String commissionDescription(CommissionSale commission) {
        String client = commission.getClient() == null || commission.getClient().isBlank()
                ? "sem cliente informado"
                : commission.getClient().trim();
        return client.length() > 180 ? client.substring(0, 180) : client;
    }

    private BigDecimal commissionValue(CommissionSale commission) {
        if ("FIXA".equalsIgnoreCase(commission.getCalculationType())) {
            return commission.getFixedValue() == null ? BigDecimal.ZERO : commission.getFixedValue();
        }
        BigDecimal value = commission.getValue() == null ? BigDecimal.ZERO : commission.getValue();
        BigDecimal percent = commission.getPercent() == null ? BigDecimal.ZERO : commission.getPercent();
        return value.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private LocalDate commissionExpenseDate(CommissionSale commission) {
        return commission.getPaidAt() == null
                ? LocalDate.now()
                : commission.getPaidAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
    }

    private BigDecimal automaticRevenueValue(Contract contract) {
        BigDecimal monthlyValue = contract.getMonthlyValue() == null ? BigDecimal.ZERO : contract.getMonthlyValue();
        if (monthlyValue.compareTo(BigDecimal.ZERO) > 0) {
            return monthlyValue;
        }
        return contract.getTotalValue() == null ? BigDecimal.ZERO : contract.getTotalValue();
    }

    private LocalDate automaticRevenueDueDate(Contract contract) {
        LocalDate baseDate = contract.getStartDate();
        if (contract.getBillingDueDay() == null) {
            return baseDate;
        }

        YearMonth month = YearMonth.from(baseDate);
        int dueDay = Math.min(contract.getBillingDueDay(), month.lengthOfMonth());
        LocalDate dueDate = month.atDay(dueDay);
        return dueDate.isBefore(baseDate) ? dueDate.plusMonths(1) : dueDate;
    }

    private void apply(FinanceEntryRequest request, FinanceEntry entry) {
        entry.setClientId(request.clientId());
        entry.setContractId(request.contractId());
        entry.setProjectId(request.projectId());
        entry.setServiceId(request.serviceId());
        entry.setType(request.type().trim());
        entry.setStatus(request.status().trim());
        entry.setDescription(request.description().trim());
        entry.setValue(request.value() == null ? BigDecimal.ZERO : request.value());
        entry.setDue(request.due());
        entry.setRecurring(request.recurring());
        entry.setAutoBilling(request.autoBilling());
        entry.setCostCenter(normalizeCostCenter(request.costCenter()));
        entry.setPaymentMethod(blankToNull(request.paymentMethod()));
        entry.setNotes(blankToNull(request.notes()));
        if (request.active() != null) {
            entry.setActive(request.active());
        }
    }

    private void auditFinanceChanges(FinanceEntry entry, FinanceEntryRequest request) {
        auditService.logChange("Lancamento financeiro", entry.getId(), "clientId", entry.getClientId(), request.clientId());
        auditService.logChange("Lancamento financeiro", entry.getId(), "contractId", entry.getContractId(), request.contractId());
        auditService.logChange("Lancamento financeiro", entry.getId(), "projectId", entry.getProjectId(), request.projectId());
        auditService.logChange("Lancamento financeiro", entry.getId(), "serviceId", entry.getServiceId(), request.serviceId());
        auditService.logChange("Lancamento financeiro", entry.getId(), "type", entry.getType(), request.type().trim());
        auditService.logChange("Lancamento financeiro", entry.getId(), "status", entry.getStatus(), request.status().trim());
        auditService.logChange("Lancamento financeiro", entry.getId(), "description", entry.getDescription(), request.description().trim());
        auditService.logChange("Lancamento financeiro", entry.getId(), "value", entry.getValue(), request.value() == null ? BigDecimal.ZERO : request.value());
        auditService.logChange("Lancamento financeiro", entry.getId(), "due", entry.getDue(), request.due());
        auditService.logChange("Lancamento financeiro", entry.getId(), "recurring", entry.isRecurring(), request.recurring());
        auditService.logChange("Lancamento financeiro", entry.getId(), "autoBilling", entry.isAutoBilling(), request.autoBilling());
        auditService.logChange("Lancamento financeiro", entry.getId(), "costCenter", entry.getCostCenter(), normalizeCostCenter(request.costCenter()));
        auditService.logChange("Lancamento financeiro", entry.getId(), "paymentMethod", entry.getPaymentMethod(), blankToNull(request.paymentMethod()));
        auditService.logChange("Lancamento financeiro", entry.getId(), "notes", entry.getNotes(), blankToNull(request.notes()));
        auditService.logChange("Lancamento financeiro", entry.getId(), "active", entry.isActive(), request.active() == null || request.active());
    }

    private String normalizeCostCenter(String value) {
        return value == null || value.isBlank() ? "operacional" : value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
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

    private LocalDate normalizePeriodStart(LocalDate from) {
        return from == null ? MIN_REPORT_DATE : from;
    }

    private LocalDate normalizePeriodEnd(LocalDate to) {
        return to == null ? MAX_REPORT_DATE : to;
    }
}
