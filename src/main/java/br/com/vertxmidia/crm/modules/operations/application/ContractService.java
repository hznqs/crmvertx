package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.ContractServiceItem;
import br.com.vertxmidia.crm.modules.operations.dto.ContractChurnMetricsResponse;
import br.com.vertxmidia.crm.modules.operations.dto.ContractLifecycleRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ContractRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ContractResponse;
import br.com.vertxmidia.crm.modules.operations.dto.ContractSummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractServiceItemRepository;
import br.com.vertxmidia.crm.modules.projects.application.ProjectService;
import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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
public class ContractService {
    public static final List<String> ACTIVE_CONTRACT_STATUSES = List.of("ativo", "em_andamento", "aprovado", "vigente");
    private static final List<String> LOST_CONTRACT_STATUSES = List.of("cancelado", "nao_renovado");
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final ContractRepository repository;
    private final ContractServiceItemRepository serviceItemRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ClientRepository clientRepository;
    private final FinanceEntryService financeEntryService;
    private final CommissionSaleService commissionSaleService;
    private final ProjectService projectService;
    private final AuditService auditService;

    public ContractService(ContractRepository repository,
                           ContractServiceItemRepository serviceItemRepository,
                           ServiceOfferingRepository serviceOfferingRepository,
                           ClientRepository clientRepository,
                           FinanceEntryService financeEntryService,
                           CommissionSaleService commissionSaleService,
                           ProjectService projectService,
                           AuditService auditService) {
        this.repository = repository;
        this.serviceItemRepository = serviceItemRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.clientRepository = clientRepository;
        this.financeEntryService = financeEntryService;
        this.commissionSaleService = commissionSaleService;
        this.projectService = projectService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> search(String status, UUID clientId, Pageable pageable) {
        Specification<Contract> spec = Specification
                .where(OperationSpecifications.<Contract>equalsText("status", status))
                .and(OperationSpecifications.equalsUuid("clientId", clientId))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ContractResponse findById(UUID id) {
        return toResponse(get(id));
    }

    @Transactional(readOnly = true)
    public ContractSummaryResponse summary() {
        LocalDate today = LocalDate.now();
        return new ContractSummaryResponse(
                repository.countByStatusAndActiveTrue("ativo"),
                repository.countByStatusAndEndDateBetweenAndActiveTrue("ativo", today, today.plusDays(30)),
                repository.countByAutoRenewTrueAndActiveTrue(),
                repository.sumMonthlyValueByStatusAndActiveTrue("ativo")
        );
    }

    @Transactional(readOnly = true)
    public ContractChurnMetricsResponse churnMetrics(LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now();
        LocalDate periodStart = from == null ? today.withDayOfMonth(1) : from;
        LocalDate periodEnd = to == null ? periodStart.plusMonths(1).minusDays(1) : to;
        if (periodEnd.isBefore(periodStart)) {
            throw new IllegalArgumentException("Data final do churn nao pode ser anterior a data inicial");
        }

        long customersAtStart = repository.countRecurringCustomersActiveAt(ACTIVE_CONTRACT_STATUSES, periodStart);
        long contractsAtStart = repository.countRecurringContractsActiveAt(ACTIVE_CONTRACT_STATUSES, periodStart);
        long lostCustomers = repository.countLostRecurringCustomersBetween(LOST_CONTRACT_STATUSES, ACTIVE_CONTRACT_STATUSES, periodStart, periodEnd);
        long lostContracts = repository.countLostRecurringContractsBetween(LOST_CONTRACT_STATUSES, periodStart, periodEnd);
        long nonRenewed = repository.countNonRenewedRecurringContractsBetween(periodStart, periodEnd);
        BigDecimal activeMrrAtStart = zeroIfNull(repository.sumRecurringMrrActiveAt(ACTIVE_CONTRACT_STATUSES, periodStart));
        BigDecimal mrrLost = zeroIfNull(repository.sumMrrLostBetween(LOST_CONTRACT_STATUSES, periodStart, periodEnd));

        return new ContractChurnMetricsResponse(
                percentage(BigDecimal.valueOf(lostCustomers), BigDecimal.valueOf(customersAtStart)),
                percentage(BigDecimal.valueOf(lostContracts), BigDecimal.valueOf(contractsAtStart)),
                percentage(mrrLost, activeMrrAtStart),
                mrrLost,
                customersAtStart,
                lostCustomers,
                contractsAtStart,
                lostContracts,
                nonRenewed,
                repository.countChurnReasonsBetween(LOST_CONTRACT_STATUSES, periodStart, periodEnd)
        );
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse create(ContractRequest request) {
        validateStaticFields(request);
        ContractPricing pricing = resolvePricing(request, List.of());
        Contract contract = new Contract();
        apply(request, contract, pricing);
        contract.setCreatedBy(currentUserId());
        contract.setUpdatedBy(currentUserId());
        Contract saved = repository.save(contract);
        List<ContractServiceItem> savedItems = saveNewItems(saved.getId(), pricing.items());
        financeEntryService.syncContractRevenue(saved);
        commissionSaleService.syncContractCommission(saved);
        projectService.syncContractProject(saved);
        saved = maybeGenerateProject(request, saved, savedItems);
        auditService.log("CREATE", "Contrato", saved.getId());
        return ContractResponse.from(saved, savedItems);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse update(UUID id, ContractRequest request) {
        validateStaticFields(request);
        Contract contract = get(id);
        List<ContractServiceItem> currentItems = serviceItemRepository.findByContractIdAndActiveTrueOrderByCreatedAtAsc(contract.getId());
        ContractPricing pricing = resolvePricing(request, currentItems);
        auditContractChanges(contract, request, pricing);
        apply(request, contract, pricing);
        contract.setUpdatedBy(currentUserId());
        Contract saved = repository.save(contract);
        List<ContractServiceItem> savedItems = pricing.reusedExistingSnapshots()
                ? currentItems
                : replaceItems(saved.getId(), pricing.items());
        financeEntryService.syncContractRevenue(saved);
        commissionSaleService.syncContractCommission(saved);
        projectService.syncContractProject(saved);
        saved = maybeGenerateProject(request, saved, savedItems);
        auditService.log("UPDATE", "Contrato", saved.getId());
        return ContractResponse.from(saved, savedItems);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        Contract contract = get(id);
        auditService.logChange("Contrato", contract.getId(), "active", contract.isActive(), false);
        contract.setActive(false);
        contract.setStatus("cancelado");
        contract.setUpdatedBy(currentUserId());
        Contract saved = repository.save(contract);
        financeEntryService.syncContractRevenue(saved);
        commissionSaleService.syncContractCommission(saved);
        projectService.syncContractProject(saved);
        auditService.log("SOFT_DELETE", "Contrato", id);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse cancel(UUID id, ContractLifecycleRequest request) {
        Contract contract = get(id);
        LocalDate cancellationDate = lifecycleDate(request, LocalDate.now());
        auditService.logChange("Contrato", contract.getId(), "status", contract.getStatus(), "cancelado");
        auditService.logChange("Contrato", contract.getId(), "cancelledAt", contract.getCancelledAt(), cancellationDate);
        contract.setStatus("cancelado");
        contract.setCancelledAt(cancellationDate);
        contract.setEndedAt(cancellationDate);
        contract.setCancellationReason(blankToNull(request == null ? null : request.reason()));
        contract.setChurnReason(blankToNull(request == null ? null : request.reason()));
        appendLifecycleNotes(contract, request == null ? null : request.notes());
        registerMrrLost(contract);
        contract.setUpdatedBy(currentUserId());
        Contract saved = repository.save(contract);
        syncOperationalSideEffects(saved);
        auditService.log(contract.isRecurring() ? "CANCEL_RECURRING_CONTRACT" : "CANCEL_ONE_TIME_CONTRACT", "Contrato", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse markAsNonRenewed(UUID id, ContractLifecycleRequest request) {
        Contract contract = get(id);
        LocalDate endedAt = lifecycleDate(request, contract.getEndDate() == null ? LocalDate.now() : contract.getEndDate());
        auditService.logChange("Contrato", contract.getId(), "status", contract.getStatus(), "nao_renovado");
        auditService.logChange("Contrato", contract.getId(), "endedAt", contract.getEndedAt(), endedAt);
        contract.setStatus("nao_renovado");
        contract.setEndedAt(endedAt);
        contract.setNonRenewalReason(blankToNull(request == null ? null : request.reason()));
        contract.setChurnReason(blankToNull(request == null ? null : request.reason()));
        appendLifecycleNotes(contract, request == null ? null : request.notes());
        registerMrrLost(contract);
        contract.setUpdatedBy(currentUserId());
        Contract saved = repository.save(contract);
        syncOperationalSideEffects(saved);
        auditService.log(contract.isRecurring() ? "NON_RENEW_RECURRING_CONTRACT" : "NON_RENEW_ONE_TIME_CONTRACT", "Contrato", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse renew(UUID oldContractId, ContractRequest request) {
        Contract oldContract = get(oldContractId);
        validateStaticFields(request);
        ContractPricing pricing = resolvePricing(request, List.of());
        Contract newContract = new Contract();
        apply(request, newContract, pricing);
        newContract.setRenewedFromContractId(oldContract.getId());
        newContract.setCreatedBy(currentUserId());
        newContract.setUpdatedBy(currentUserId());
        Contract savedNewContract = repository.save(newContract);
        List<ContractServiceItem> savedItems = saveNewItems(savedNewContract.getId(), pricing.items());
        syncOperationalSideEffects(savedNewContract);

        oldContract.setStatus("renovado");
        oldContract.setEndedAt(oldContract.getEndDate());
        oldContract.setRenewedToContractId(savedNewContract.getId());
        oldContract.setMrrLost(BigDecimal.ZERO);
        oldContract.setUpdatedBy(currentUserId());
        repository.save(oldContract);
        auditService.log("RENEW_CONTRACT", "Contrato", oldContract.getId());
        auditService.log("CREATE_RENEWED_CONTRACT", "Contrato", savedNewContract.getId());
        return ContractResponse.from(savedNewContract, savedItems);
    }

    private Contract maybeGenerateProject(ContractRequest request, Contract saved, List<ContractServiceItem> savedItems) {
        if (!Boolean.TRUE.equals(request.generateProject())) {
            return saved;
        }
        var project = projectService.generateProjectFromContract(saved, savedItems);
        if (!project.id().equals(saved.getProjectId())) {
            saved.setProjectId(project.id());
            saved.setUpdatedBy(currentUserId());
            return repository.save(saved);
        }
        return saved;
    }

    private Contract get(UUID id) {
        return repository.findById(id)
                .filter(Contract::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Contrato nao encontrado"));
    }

    private ContractResponse toResponse(Contract contract) {
        return ContractResponse.from(contract, serviceItemRepository.findByContractIdAndActiveTrueOrderByCreatedAtAsc(contract.getId()));
    }

    private void apply(ContractRequest request, Contract contract, ContractPricing pricing) {
        contract.setClientId(request.clientId());
        contract.setServiceId(pricing.primaryServiceId());
        contract.setProjectId(request.projectId());
        contract.setSellerName(blankToNull(request.sellerName()));
        contract.setPlan(request.plan().trim());
        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setStatus(normalizeStatus(request.status()));
        contract.setAutoRenew(request.autoRenew());
        contract.setDurationMonths(pricing.durationMonths());
        contract.setMonthlyValue(pricing.monthlyValue());
        contract.setRecurring(pricing.recurring());
        contract.setImplementationFee(defaultMoney(request.implementationFee()));
        contract.setDiscount(defaultMoney(request.discount()));
        contract.setTotalValue(pricing.totalValue());
        if (!LOST_CONTRACT_STATUSES.contains(normalizeStatus(request.status()))) {
            contract.setMrrLost(BigDecimal.ZERO);
        }
        contract.setBillingDueDay(request.billingDueDay());
        contract.setPaymentMethod(blankToNull(request.paymentMethod()));
        contract.setNotes(blankToNull(request.notes()));
        if (request.active() != null) {
            contract.setActive(request.active());
        }
    }

    private void validateStaticFields(ContractRequest request) {
        if (request.clientId() == null) {
            throw new IllegalArgumentException("Cliente e obrigatorio para salvar contrato");
        }
        if (clientRepository.findByIdAndActiveTrue(request.clientId()).isEmpty()) {
            throw new IllegalArgumentException("Cliente vinculado ao contrato nao foi encontrado");
        }
        if (request.startDate() == null || request.endDate() == null) {
            throw new IllegalArgumentException("Informe uma data de inicio e termino validas");
        }
        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("Data final do contrato nao pode ser anterior a data inicial");
        }
        if (request.billingDueDay() != null && (request.billingDueDay() < 1 || request.billingDueDay() > 31)) {
            throw new IllegalArgumentException("Dia de vencimento deve estar entre 1 e 31");
        }
        if (defaultMoney(request.implementationFee()).compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Taxa de implementacao nao pode ser negativa");
        }
        if (defaultMoney(request.discount()).compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Desconto nao pode ser negativo");
        }
    }

    private ContractPricing resolvePricing(ContractRequest request, List<ContractServiceItem> currentItems) {
        List<UUID> serviceIds = normalizedServiceIds(request);
        if (serviceIds.isEmpty()) {
            throw new IllegalArgumentException("Selecione pelo menos um servico ativo para o contrato");
        }

        if (matchesExistingSnapshots(serviceIds, currentItems)) {
            return pricingFromItems(currentItems, request, true);
        }

        List<ContractServiceItem> items = new ArrayList<>();
        for (UUID serviceId : serviceIds) {
            ServiceOffering service = serviceOfferingRepository.findByIdAndActiveTrue(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Servico ativo nao encontrado para o contrato"));
            ContractServiceItem item = new ContractServiceItem();
            item.setServiceId(service.getId());
            item.setServiceNameSnapshot(service.getName());
            item.setServiceValueSnapshot(defaultMoney(service.getBasePrice()));
            item.setBillingTypeSnapshot(service.getBillingType());
            item.setServiceActiveSnapshot(service.isActive());
            item.setQuantity(1);
            item.setActive(true);
            items.add(item);
        }
        return pricingFromItems(items, request, false);
    }

    private ContractPricing pricingFromItems(List<ContractServiceItem> items, ContractRequest request, boolean reusedExistingSnapshots) {
        BigDecimal monthlyValue = BigDecimal.ZERO;
        BigDecimal oneTimeServicesValue = BigDecimal.ZERO;

        for (ContractServiceItem item : items) {
            BigDecimal itemValue = defaultMoney(item.getServiceValueSnapshot())
                    .multiply(BigDecimal.valueOf(item.getQuantity() == null ? 1 : item.getQuantity()));
            if (item.getBillingTypeSnapshot() == ServiceBillingType.UNICO) {
                oneTimeServicesValue = oneTimeServicesValue.add(itemValue);
            } else {
                monthlyValue = monthlyValue.add(itemValue);
            }
        }

        int durationMonths = monthlyValue.compareTo(BigDecimal.ZERO) > 0
                ? recurringDurationMonths(request)
                : 0;
        BigDecimal implementationFee = defaultMoney(request.implementationFee());
        BigDecimal discount = defaultMoney(request.discount());
        BigDecimal grossValue = monthlyValue
                .multiply(BigDecimal.valueOf(durationMonths))
                .add(oneTimeServicesValue)
                .add(implementationFee)
                .setScale(2, RoundingMode.HALF_UP);

        if (discount.compareTo(grossValue) > 0) {
            throw new IllegalArgumentException("Desconto nao pode ser maior que o valor bruto do contrato");
        }

        BigDecimal totalValue = grossValue.subtract(discount).setScale(2, RoundingMode.HALF_UP);
        UUID primaryServiceId = items.isEmpty() ? null : items.get(0).getServiceId();
        return new ContractPricing(
                items,
                primaryServiceId,
                monthlyValue.setScale(2, RoundingMode.HALF_UP),
                oneTimeServicesValue.setScale(2, RoundingMode.HALF_UP),
                grossValue,
                totalValue,
                durationMonths,
                monthlyValue.compareTo(BigDecimal.ZERO) > 0,
                reusedExistingSnapshots
        );
    }

    private List<UUID> normalizedServiceIds(ContractRequest request) {
        Set<UUID> ids = new LinkedHashSet<>();
        if (request.serviceIds() != null) {
            ids.addAll(request.serviceIds().stream().filter(java.util.Objects::nonNull).toList());
        }
        if (ids.isEmpty() && request.serviceId() != null) {
            ids.add(request.serviceId());
        }
        return List.copyOf(ids);
    }

    private boolean matchesExistingSnapshots(List<UUID> serviceIds, List<ContractServiceItem> currentItems) {
        if (currentItems.isEmpty() || serviceIds.size() != currentItems.size()) {
            return false;
        }
        List<UUID> currentServiceIds = currentItems.stream()
                .map(ContractServiceItem::getServiceId)
                .toList();
        return serviceIds.equals(currentServiceIds);
    }

    private List<ContractServiceItem> replaceItems(UUID contractId, List<ContractServiceItem> items) {
        serviceItemRepository.deactivateByContractId(contractId);
        return saveNewItems(contractId, items);
    }

    private List<ContractServiceItem> saveNewItems(UUID contractId, List<ContractServiceItem> items) {
        items.forEach(item -> item.setContractId(contractId));
        return serviceItemRepository.saveAll(items);
    }

    private void auditContractChanges(Contract contract, ContractRequest request, ContractPricing pricing) {
        auditService.logChange("Contrato", contract.getId(), "clientId", contract.getClientId(), request.clientId());
        auditService.logChange("Contrato", contract.getId(), "serviceId", contract.getServiceId(), pricing.primaryServiceId());
        auditService.logChange("Contrato", contract.getId(), "projectId", contract.getProjectId(), request.projectId());
        auditService.logChange("Contrato", contract.getId(), "sellerName", contract.getSellerName(), blankToNull(request.sellerName()));
        auditService.logChange("Contrato", contract.getId(), "plan", contract.getPlan(), request.plan().trim());
        auditService.logChange("Contrato", contract.getId(), "startDate", contract.getStartDate(), request.startDate());
        auditService.logChange("Contrato", contract.getId(), "endDate", contract.getEndDate(), request.endDate());
        auditService.logChange("Contrato", contract.getId(), "status", contract.getStatus(), normalizeStatus(request.status()));
        auditService.logChange("Contrato", contract.getId(), "autoRenew", contract.isAutoRenew(), request.autoRenew());
        auditService.logChange("Contrato", contract.getId(), "monthlyValue", contract.getMonthlyValue(), pricing.monthlyValue());
        auditService.logChange("Contrato", contract.getId(), "implementationFee", contract.getImplementationFee(), defaultMoney(request.implementationFee()));
        auditService.logChange("Contrato", contract.getId(), "discount", contract.getDiscount(), defaultMoney(request.discount()));
        auditService.logChange("Contrato", contract.getId(), "totalValue", contract.getTotalValue(), pricing.totalValue());
        auditService.logChange("Contrato", contract.getId(), "durationMonths", contract.getDurationMonths(), pricing.durationMonths());
        auditService.logChange("Contrato", contract.getId(), "billingDueDay", contract.getBillingDueDay(), request.billingDueDay());
        auditService.logChange("Contrato", contract.getId(), "paymentMethod", contract.getPaymentMethod(), blankToNull(request.paymentMethod()));
        auditService.logChange("Contrato", contract.getId(), "notes", contract.getNotes(), blankToNull(request.notes()));
        auditService.logChange("Contrato", contract.getId(), "active", contract.isActive(), request.active() == null || request.active());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    private void registerMrrLost(Contract contract) {
        contract.setMrrLost(contract.isRecurring() ? defaultMoney(contract.getMonthlyValue()) : BigDecimal.ZERO);
    }

    private void syncOperationalSideEffects(Contract saved) {
        financeEntryService.syncContractRevenue(saved);
        commissionSaleService.syncContractCommission(saved);
        projectService.syncContractProject(saved);
    }

    private LocalDate lifecycleDate(ContractLifecycleRequest request, LocalDate fallback) {
        return request == null || request.date() == null ? fallback : request.date();
    }

    private void appendLifecycleNotes(Contract contract, String notes) {
        String normalizedNotes = blankToNull(notes);
        if (normalizedNotes == null) {
            return;
        }
        String currentNotes = blankToNull(contract.getNotes());
        contract.setNotes(currentNotes == null ? normalizedNotes : currentNotes + "\n\n" + normalizedNotes);
    }

    private String normalizeStatus(String status) {
        return status == null ? "ativo" : status.trim().toLowerCase();
    }

    private BigDecimal percentage(BigDecimal value, BigDecimal total) {
        if (total.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return value.multiply(ONE_HUNDRED).divide(total, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private int recurringDurationMonths(ContractRequest request) {
        long months = ChronoUnit.MONTHS.between(request.startDate(), request.endDate());
        if (months < 1) {
            throw new IllegalArgumentException("Contratos recorrentes precisam ter duracao minima de 1 mes");
        }
        if (months > 600) {
            throw new IllegalArgumentException("Duracao recorrente nao pode ultrapassar 600 meses");
        }
        return (int) months;
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

    private record ContractPricing(
            List<ContractServiceItem> items,
            UUID primaryServiceId,
            BigDecimal monthlyValue,
            BigDecimal oneTimeServicesValue,
            BigDecimal grossValue,
            BigDecimal totalValue,
            int durationMonths,
            boolean recurring,
            boolean reusedExistingSnapshots
    ) {
    }
}
