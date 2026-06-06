package br.com.vertxmidia.crm.modules.operations.dto;

import java.math.BigDecimal;
import java.util.List;

public record ContractChurnMetricsResponse(
        BigDecimal customerChurnRate,
        BigDecimal contractChurnRate,
        BigDecimal mrrChurnRate,
        BigDecimal mrrLost,
        long recurringCustomersAtStart,
        long lostRecurringCustomers,
        long recurringContractsAtStart,
        long lostRecurringContracts,
        long nonRenewedContracts,
        List<ChurnReasonResponse> churnReasons
) {
}
