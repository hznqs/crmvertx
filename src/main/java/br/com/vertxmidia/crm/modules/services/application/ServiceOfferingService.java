package br.com.vertxmidia.crm.modules.services.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingFilterRequest;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingRequest;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingResponse;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServiceOfferingService {

    private final ServiceOfferingRepository repository;
    private final ServiceOfferingMapper mapper;
    private final AuditService auditService;

    public ServiceOfferingService(ServiceOfferingRepository repository,
                                  ServiceOfferingMapper mapper,
                                  AuditService auditService) {
        this.repository = repository;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ServiceOfferingResponse> search(ServiceOfferingFilterRequest filter, Pageable pageable) {
        return repository.findAll(ServiceOfferingSpecifications.byFilters(filter), pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ServiceOfferingResponse findById(UUID id) {
        return mapper.toResponse(getActiveService(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ServiceOfferingResponse create(ServiceOfferingRequest request) {
        validateNameAvailability(request.name(), null);
        validateBusinessRules(request);

        ServiceOffering service = mapper.toEntity(request);
        service.setCreatedBy(currentUserId());
        service.setUpdatedBy(currentUserId());

        ServiceOffering saved = repository.save(service);
        auditService.log("CREATE", "ServiceOffering", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ServiceOfferingResponse update(UUID id, ServiceOfferingRequest request) {
        ServiceOffering service = getActiveService(id);
        validateNameAvailability(request.name(), id);
        validateBusinessRules(request);
        auditChanges(service, request);

        mapper.updateEntity(request, service);
        service.setUpdatedBy(currentUserId());
        ServiceOffering saved = repository.save(service);
        auditService.log("UPDATE", "ServiceOffering", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        ServiceOffering service = getActiveService(id);
        auditService.logChange("ServiceOffering", service.getId(), "active", service.isActive(), false);
        service.setActive(false);
        service.setUpdatedBy(currentUserId());
        repository.save(service);
        auditService.log("SOFT_DELETE", "ServiceOffering", id);
    }

    private ServiceOffering getActiveService(UUID id) {
        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Servico nao encontrado"));
    }

    private void validateNameAvailability(String name, UUID currentId) {
        String normalizedName = name.trim();
        boolean exists = currentId == null
                ? repository.existsByNameIgnoreCaseAndActiveTrue(normalizedName)
                : repository.existsByNameIgnoreCaseAndActiveTrueAndIdNot(normalizedName, currentId);
        if (exists) {
            throw new IllegalArgumentException("Ja existe um servico ativo com este nome");
        }
    }

    private void validateBusinessRules(ServiceOfferingRequest request) {
        if (request.billingType() != ServiceBillingType.PERSONALIZADO
                && request.basePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Servicos com cobranca definida precisam ter preco maior que zero");
        }
        if (request.grossMarginPercentage().compareTo(BigDecimal.ZERO) > 0
                && request.commissionPercentage().compareTo(request.grossMarginPercentage()) > 0) {
            throw new IllegalArgumentException("A comissao nao pode ser maior que a margem bruta");
        }
    }

    private void auditChanges(ServiceOffering service, ServiceOfferingRequest request) {
        auditService.logChange("ServiceOffering", service.getId(), "name", service.getName(), request.name().trim());
        auditService.logChange("ServiceOffering", service.getId(), "category", service.getCategory(), request.category());
        auditService.logChange("ServiceOffering", service.getId(), "description", service.getDescription(), normalizeNullable(request.description()));
        auditService.logChange("ServiceOffering", service.getId(), "billingType", service.getBillingType(), request.billingType());
        auditService.logChange("ServiceOffering", service.getId(), "basePrice", service.getBasePrice(), request.basePrice());
        auditService.logChange("ServiceOffering", service.getId(), "slaDays", service.getSlaDays(), request.slaDays());
        auditService.logChange("ServiceOffering", service.getId(), "estimatedHours", service.getEstimatedHours(), request.estimatedHours());
        auditService.logChange("ServiceOffering", service.getId(), "defaultChecklist", service.getDefaultChecklist(), normalizeNullable(request.defaultChecklist()));
        auditService.logChange("ServiceOffering", service.getId(), "deliveryStages", service.getDeliveryStages(), normalizeNullable(request.deliveryStages()));
        auditService.logChange("ServiceOffering", service.getId(), "commissionPercentage", service.getCommissionPercentage(), request.commissionPercentage());
        auditService.logChange("ServiceOffering", service.getId(), "grossMarginPercentage", service.getGrossMarginPercentage(), request.grossMarginPercentage());
        auditService.logChange("ServiceOffering", service.getId(), "active", service.isActive(), request.active() == null || request.active());
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

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
