package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TeamMemberResponse(
        UUID id,
        UUID userId,
        String name,
        String role,
        String functionName,
        LocalDate joinedAt,
        String email,
        String phone,
        Integer tasks,
        Integer completed,
        Integer performance,
        String notes,
        String taskBreakdown,
        BigDecimal hourlyCost,
        Integer capacityHoursMonth,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static TeamMemberResponse from(TeamMember member) {
        return new TeamMemberResponse(
                member.getId(),
                member.getUserId(),
                member.getName(),
                member.getRole(),
                member.getFunctionName(),
                member.getJoinedAt(),
                member.getEmail(),
                member.getPhone(),
                member.getTasks(),
                member.getCompleted(),
                member.getPerformance(),
                member.getNotes(),
                member.getTaskBreakdown(),
                member.getHourlyCost(),
                member.getCapacityHoursMonth(),
                member.isActive(),
                member.getCreatedAt(),
                member.getUpdatedAt()
        );
    }
}
