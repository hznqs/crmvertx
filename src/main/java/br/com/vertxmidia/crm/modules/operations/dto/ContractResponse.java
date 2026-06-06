package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.ContractServiceItem;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ContractResponse(
        UUID id,
        UUID clientId,
        List<UUID> serviceIds,
        UUID serviceId,
        UUID projectId,
        List<ContractServiceItemResponse> serviceItems,
        String sellerName,
        String plan,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        boolean autoRenew,
        BigDecimal monthlyValue,
        BigDecimal oneTimeServicesValue,
        BigDecimal implementationFee,
        BigDecimal discount,
        BigDecimal totalValue,
        Integer durationMonths,
        Integer billingDueDay,
        String paymentMethod,
        String notes,
        LocalDate cancelledAt,
        LocalDate endedAt,
        String cancellationReason,
        String churnReason,
        String nonRenewalReason,
        boolean recurring,
        BigDecimal mrrLost,
        UUID renewedFromContractId,
        UUID renewedToContractId,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static ContractResponse from(Contract contract) {
        return from(contract, List.of());
    }

    public static ContractResponse from(Contract contract, List<ContractServiceItem> items) {
        List<ContractServiceItemResponse> serviceItems = items.stream()
                .map(ContractServiceItemResponse::from)
                .toList();
        List<UUID> serviceIds = serviceItems.stream()
                .map(ContractServiceItemResponse::serviceId)
                .filter(java.util.Objects::nonNull)
                .toList();
        return new ContractResponse(
                contract.getId(),
                contract.getClientId(),
                serviceIds.isEmpty() && contract.getServiceId() != null ? List.of(contract.getServiceId()) : serviceIds,
                contract.getServiceId(),
                contract.getProjectId(),
                serviceItems,
                contract.getSellerName(),
                contract.getPlan(),
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getStatus(),
                contract.isAutoRenew(),
                contract.getMonthlyValue(),
                oneTimeServicesValue(items),
                contract.getImplementationFee(),
                contract.getDiscount(),
                contract.getTotalValue(),
                contract.getDurationMonths(),
                contract.getBillingDueDay(),
                contract.getPaymentMethod(),
                contract.getNotes(),
                contract.getCancelledAt(),
                contract.getEndedAt(),
                contract.getCancellationReason(),
                contract.getChurnReason(),
                contract.getNonRenewalReason(),
                contract.isRecurring(),
                contract.getMrrLost(),
                contract.getRenewedFromContractId(),
                contract.getRenewedToContractId(),
                contract.isActive(),
                contract.getCreatedAt(),
                contract.getUpdatedAt()
        );
    }

    private static BigDecimal oneTimeServicesValue(List<ContractServiceItem> items) {
        return items.stream()
                .filter(item -> item.getBillingTypeSnapshot() == br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType.UNICO)
                .map(item -> item.getServiceValueSnapshot().multiply(BigDecimal.valueOf(item.getQuantity() == null ? 1 : item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
