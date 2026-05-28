package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.dto.ContractRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ContractResponse;
import br.com.vertxmidia.crm.modules.operations.dto.ContractSummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.projects.application.ProjectService;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
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

    private final ContractRepository repository;
    private final ClientRepository clientRepository;
    private final FinanceEntryService financeEntryService;
    private final CommissionSaleService commissionSaleService;
    private final ProjectService projectService;
    private final AuditService auditService;

    public ContractService(ContractRepository repository,
                           ClientRepository clientRepository,
                           FinanceEntryService financeEntryService,
                           CommissionSaleService commissionSaleService,
                           ProjectService projectService,
                           AuditService auditService) {
        this.repository = repository;
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
        return repository.findAll(spec, pageable).map(ContractResponse::from);
    }

    @Transactional(readOnly = true)
    public ContractResponse findById(UUID id) {
        return ContractResponse.from(get(id));
    }

    @Transactional(readOnly = true)
    public ContractSummaryResponse summary() {
        LocalDate today = LocalDate.now();
        return new ContractSummaryResponse(
                repository.countByStatusAndActiveTrue("ativo"),
                repository.countByStatusAndEndDateBetweenAndActiveTrue("ativo", today, today.plusDays(30)),
                repository.countByAutoRenewTrueAndActiveTrue(),
                clientRepository.sumContractValueByPhase(ClientPhase.FECHADO)
        );
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse create(ContractRequest request) {
        validate(request);
        Contract contract = new Contract();
        apply(request, contract);
        contract.setCreatedBy(currentUserId());
        contract.setUpdatedBy(currentUserId());
        Contract saved = repository.save(contract);
        financeEntryService.syncContractRevenue(saved);
        commissionSaleService.syncContractCommission(saved);
        projectService.syncContractProject(saved);
        auditService.log("CREATE", "Contrato", saved.getId());
        return ContractResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse update(UUID id, ContractRequest request) {
        validate(request);
        Contract contract = get(id);
        auditContractChanges(contract, request);
        apply(request, contract);
        contract.setUpdatedBy(currentUserId());
        Contract saved = repository.save(contract);
        financeEntryService.syncContractRevenue(saved);
        commissionSaleService.syncContractCommission(saved);
        projectService.syncContractProject(saved);
        auditService.log("UPDATE", "Contrato", saved.getId());
        return ContractResponse.from(saved);
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

    private Contract get(UUID id) {
        return repository.findById(id)
                .filter(Contract::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Contrato nao encontrado"));
    }

    private void apply(ContractRequest request, Contract contract) {
        contract.setClientId(request.clientId());
        contract.setServiceId(request.serviceId());
        contract.setProjectId(request.projectId());
        contract.setPlan(request.plan().trim());
        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setStatus(request.status().trim());
        contract.setAutoRenew(request.autoRenew());
        contract.setDurationMonths(defaultDuration(request));
        contract.setMonthlyValue(defaultMoney(request.monthlyValue()));
        contract.setTotalValue(defaultTotalValue(request));
        contract.setBillingDueDay(request.billingDueDay());
        if (request.active() != null) {
            contract.setActive(request.active());
        }
    }

    private void validate(ContractRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("Data final do contrato nao pode ser anterior a data inicial");
        }
        if (request.billingDueDay() != null && (request.billingDueDay() < 1 || request.billingDueDay() > 31)) {
            throw new IllegalArgumentException("Dia de vencimento deve estar entre 1 e 31");
        }
        if (defaultTotalValue(request).compareTo(BigDecimal.ZERO) > 0
                && defaultMoney(request.monthlyValue()).compareTo(defaultTotalValue(request)) > 0
                && defaultDuration(request) > 1) {
            throw new IllegalArgumentException("Valor mensal nao pode superar o valor total em contratos plurimensais");
        }
    }

    private void auditContractChanges(Contract contract, ContractRequest request) {
        auditService.logChange("Contrato", contract.getId(), "clientId", contract.getClientId(), request.clientId());
        auditService.logChange("Contrato", contract.getId(), "serviceId", contract.getServiceId(), request.serviceId());
        auditService.logChange("Contrato", contract.getId(), "projectId", contract.getProjectId(), request.projectId());
        auditService.logChange("Contrato", contract.getId(), "plan", contract.getPlan(), request.plan().trim());
        auditService.logChange("Contrato", contract.getId(), "startDate", contract.getStartDate(), request.startDate());
        auditService.logChange("Contrato", contract.getId(), "endDate", contract.getEndDate(), request.endDate());
        auditService.logChange("Contrato", contract.getId(), "status", contract.getStatus(), request.status().trim());
        auditService.logChange("Contrato", contract.getId(), "autoRenew", contract.isAutoRenew(), request.autoRenew());
        auditService.logChange("Contrato", contract.getId(), "monthlyValue", contract.getMonthlyValue(), defaultMoney(request.monthlyValue()));
        auditService.logChange("Contrato", contract.getId(), "totalValue", contract.getTotalValue(), defaultTotalValue(request));
        auditService.logChange("Contrato", contract.getId(), "durationMonths", contract.getDurationMonths(), defaultDuration(request));
        auditService.logChange("Contrato", contract.getId(), "billingDueDay", contract.getBillingDueDay(), request.billingDueDay());
        auditService.logChange("Contrato", contract.getId(), "active", contract.isActive(), request.active() == null || request.active());
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal defaultTotalValue(ContractRequest request) {
        if (request.totalValue() != null) {
            return request.totalValue();
        }
        return defaultMoney(request.monthlyValue()).multiply(BigDecimal.valueOf(defaultDuration(request)));
    }

    private int defaultDuration(ContractRequest request) {
        if (request.durationMonths() != null) {
            return request.durationMonths();
        }
        long months = ChronoUnit.MONTHS.between(request.startDate().withDayOfMonth(1), request.endDate().withDayOfMonth(1));
        return Math.max(1, (int) months);
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
