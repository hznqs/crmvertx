package br.com.vertxmidia.crm.modules.operations.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CommissionMemberStatsResponse(
        UUID memberId,
        String name,
        String role,
        long sales,
        BigDecimal revenue,
        BigDecimal commission,
        int goal,
        BigDecimal goalProgress,
        long xp,
        long level,
        String badge,
        int productivity
) {
}
