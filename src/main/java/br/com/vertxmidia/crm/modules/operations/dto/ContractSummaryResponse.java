package br.com.vertxmidia.crm.modules.operations.dto;

import java.math.BigDecimal;

public record ContractSummaryResponse(
        long active,
        long expiringSoon,
        long autoRenew,
        BigDecimal mrr
) {
}
