package br.com.vertxmidia.crm.modules.operations.dto;

import java.math.BigDecimal;
import java.util.List;

public record CommissionRankingResponse(
        List<CommissionMemberStatsResponse> ranking,
        String topCloser,
        String topSdr,
        String topTraffic,
        String topMarketing,
        BigDecimal averageGoalProgress
) {
}
