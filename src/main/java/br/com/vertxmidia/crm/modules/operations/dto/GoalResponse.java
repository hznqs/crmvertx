package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.Goal;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        BigDecimal target,
        LocalDate date,
        Instant createdAt,
        Instant updatedAt
) {
    public static GoalResponse from(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getTarget(),
                goal.getDate(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
