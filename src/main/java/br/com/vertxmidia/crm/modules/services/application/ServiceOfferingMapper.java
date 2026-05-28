package br.com.vertxmidia.crm.modules.services.application;

import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingRequest;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingResponse;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class ServiceOfferingMapper {

    public ServiceOffering toEntity(ServiceOfferingRequest request) {
        ServiceOffering service = new ServiceOffering();
        updateEntity(request, service);
        service.setActive(request.active() == null || request.active());
        return service;
    }

    public void updateEntity(ServiceOfferingRequest request, ServiceOffering service) {
        service.setName(request.name().trim());
        service.setCategory(request.category());
        service.setDescription(normalizeNullable(request.description()));
        service.setBillingType(request.billingType());
        service.setBasePrice(defaultNumber(request.basePrice()));
        service.setSlaDays(request.slaDays());
        service.setEstimatedHours(defaultNumber(request.estimatedHours()));
        service.setDefaultChecklist(normalizeNullable(request.defaultChecklist()));
        service.setDeliveryStages(normalizeNullable(request.deliveryStages()));
        service.setCommissionPercentage(defaultNumber(request.commissionPercentage()));
        service.setGrossMarginPercentage(defaultNumber(request.grossMarginPercentage()));
        if (request.active() != null) {
            service.setActive(request.active());
        }
    }

    public ServiceOfferingResponse toResponse(ServiceOffering service) {
        return new ServiceOfferingResponse(
                service.getId(),
                service.getName(),
                service.getCategory(),
                service.getDescription(),
                service.getBillingType(),
                service.getBasePrice(),
                service.getSlaDays(),
                service.getEstimatedHours(),
                service.getDefaultChecklist(),
                service.getDeliveryStages(),
                service.getCommissionPercentage(),
                service.getGrossMarginPercentage(),
                service.isActive(),
                service.getCreatedBy(),
                service.getUpdatedBy(),
                service.getCreatedAt(),
                service.getUpdatedAt()
        );
    }

    private BigDecimal defaultNumber(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
