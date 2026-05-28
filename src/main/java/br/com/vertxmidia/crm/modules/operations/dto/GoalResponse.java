package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Goal;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        String type,
        BigDecimal target,
        BigDecimal actual,
        BigDecimal progress,
        LocalDate date,
        LocalDate periodStart,
        LocalDate periodEnd,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static GoalResponse from(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getType(),
                goal.getTarget(),
                goal.getActual(),
                progress(goal),
                goal.getDate(),
                goal.getPeriodStart(),
                goal.getPeriodEnd(),
                goal.isActive(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }

    private static BigDecimal progress(Goal goal) {
        if (goal.getTarget() == null || goal.getTarget().compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return goal.getActual()
                .multiply(BigDecimal.valueOf(100))
                .divide(goal.getTarget(), 2, RoundingMode.HALF_UP)
                .min(BigDecimal.valueOf(100));
    }
}
