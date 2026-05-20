package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.dto.ContractRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ContractResponse;
import br.com.vertxmidia.crm.modules.operations.dto.ContractSummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
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
public class ContractService {

    private final ContractRepository repository;
    private final ClientRepository clientRepository;
    private final AuditService auditService;

    public ContractService(ContractRepository repository, ClientRepository clientRepository, AuditService auditService) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> search(String status, UUID clientId, Pageable pageable) {
        Specification<Contract> spec = Specification
                .where(OperationSpecifications.<Contract>equalsText("status", status))
                .and(OperationSpecifications.equalsUuid("clientId", clientId));
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
                repository.countByStatus("ativo"),
                repository.countByStatusAndEndDateBetween("ativo", today, today.plusDays(30)),
                repository.countByAutoRenewTrue(),
                clientRepository.sumContractValueByPhase(ClientPhase.FECHADO)
        );
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ContractResponse create(ContractRequest request) {
        validate(request);
        Contract contract = new Contract();
        apply(request, contract);
        Contract saved = repository.save(contract);
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
        Contract saved = repository.save(contract);
        auditService.log("UPDATE", "Contrato", saved.getId());
        return ContractResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Contrato nao encontrado");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Contrato", id);
    }

    private Contract get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contrato nao encontrado"));
    }

    private void apply(ContractRequest request, Contract contract) {
        contract.setClientId(request.clientId());
        contract.setPlan(request.plan().trim());
        contract.setStartDate(request.startDate());
        contract.setEndDate(request.endDate());
        contract.setStatus(request.status().trim());
        contract.setAutoRenew(request.autoRenew());
    }

    private void validate(ContractRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("Data final do contrato nao pode ser anterior a data inicial");
        }
    }

    private void auditContractChanges(Contract contract, ContractRequest request) {
        auditService.logChange("Contrato", contract.getId(), "clientId", contract.getClientId(), request.clientId());
        auditService.logChange("Contrato", contract.getId(), "plan", contract.getPlan(), request.plan().trim());
        auditService.logChange("Contrato", contract.getId(), "startDate", contract.getStartDate(), request.startDate());
        auditService.logChange("Contrato", contract.getId(), "endDate", contract.getEndDate(), request.endDate());
        auditService.logChange("Contrato", contract.getId(), "status", contract.getStatus(), request.status().trim());
        auditService.logChange("Contrato", contract.getId(), "autoRenew", contract.isAutoRenew(), request.autoRenew());
    }
}
