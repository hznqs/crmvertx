package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.ContractServiceItem;
import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import java.math.BigDecimal;
import java.util.UUID;

public record ContractServiceItemResponse(
        UUID id,
        UUID serviceId,
        String serviceName,
        BigDecimal serviceValue,
        ServiceBillingType billingType,
        Boolean serviceActiveSnapshot,
        Integer quantity
) {
    public static ContractServiceItemResponse from(ContractServiceItem item) {
        return new ContractServiceItemResponse(
                item.getId(),
                item.getServiceId(),
                item.getServiceNameSnapshot(),
                item.getServiceValueSnapshot(),
                item.getBillingTypeSnapshot(),
                item.isServiceActiveSnapshot(),
                item.getQuantity()
        );
    }
}
