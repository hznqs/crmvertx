package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.ClientPerformance;
import br.com.vertxmidia.crm.modules.operations.dto.ClientPerformanceRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ClientPerformanceResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ClientPerformanceRepository;
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
public class ClientPerformanceService {

    private final ClientPerformanceRepository repository;
    private final AuditService auditService;

    public ClientPerformanceService(ClientPerformanceRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ClientPerformanceResponse> search(UUID clientId, LocalDate from, LocalDate to, Pageable pageable) {
        Specification<ClientPerformance> spec = Specification
                .where(OperationSpecifications.<ClientPerformance>equalsUuid("clientId", clientId))
                .and(OperationSpecifications.dateFrom("date", from))
                .and(OperationSpecifications.dateTo("date", to));
        return repository.findAll(spec, pageable).map(ClientPerformanceResponse::from);
    }

    @Transactional(readOnly = true)
    public ClientPerformanceResponse findById(UUID id) {
        return ClientPerformanceResponse.from(get(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ClientPerformanceResponse create(ClientPerformanceRequest request) {
        ClientPerformance record = new ClientPerformance();
        apply(request, record);
        ClientPerformance saved = repository.save(record);
        auditService.log("CREATE", "Performance", saved.getId());
        return ClientPerformanceResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ClientPerformanceResponse update(UUID id, ClientPerformanceRequest request) {
        ClientPerformance record = get(id);
        auditPerformanceChanges(record, request);
        apply(request, record);
        ClientPerformance saved = repository.save(record);
        auditService.log("UPDATE", "Performance", saved.getId());
        return ClientPerformanceResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Performance nao encontrada");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Performance", id);
    }

    private ClientPerformance get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Performance nao encontrada"));
    }

    private void apply(ClientPerformanceRequest request, ClientPerformance record) {
        record.setClientId(request.clientId());
        record.setDate(request.date());
        record.setLeads(request.leads() == null ? 0 : request.leads());
        record.setSales(request.sales() == null ? 0 : request.sales());
        record.setRevenue(request.revenue() == null ? BigDecimal.ZERO : request.revenue());
        record.setInvestment(request.investment() == null ? BigDecimal.ZERO : request.investment());
    }

    private void auditPerformanceChanges(ClientPerformance record, ClientPerformanceRequest request) {
        auditService.logChange("Performance", record.getId(), "clientId", record.getClientId(), request.clientId());
        auditService.logChange("Performance", record.getId(), "date", record.getDate(), request.date());
        auditService.logChange("Performance", record.getId(), "leads", record.getLeads(), request.leads() == null ? 0 : request.leads());
        auditService.logChange("Performance", record.getId(), "sales", record.getSales(), request.sales() == null ? 0 : request.sales());
        auditService.logChange("Performance", record.getId(), "revenue", record.getRevenue(), request.revenue() == null ? BigDecimal.ZERO : request.revenue());
        auditService.logChange("Performance", record.getId(), "investment", record.getInvestment(), request.investment() == null ? BigDecimal.ZERO : request.investment());
    }
}
