package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Goal;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        String name,
        String type,
        BigDecimal target,
        BigDecimal actual,
        BigDecimal progress,
        LocalDate date,
        LocalDate periodStart,
        LocalDate periodEnd,
        String responsible,
        String status,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static GoalResponse from(Goal goal) {
        return from(goal, goal.getActual());
    }

    public static GoalResponse from(Goal goal, BigDecimal calculatedActual) {
        BigDecimal actual = calculatedActual == null ? BigDecimal.ZERO : calculatedActual;
        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getType(),
                goal.getTarget(),
                actual,
                progress(goal.getTarget(), actual),
                goal.getDate(),
                goal.getPeriodStart(),
                goal.getPeriodEnd(),
                goal.getResponsible(),
                goal.getStatus(),
                goal.isActive(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }

    private static BigDecimal progress(BigDecimal target, BigDecimal actual) {
        if (target == null || target.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return actual
                .multiply(BigDecimal.valueOf(100))
                .divide(target, 2, RoundingMode.HALF_UP)
                .min(BigDecimal.valueOf(100));
    }
}
