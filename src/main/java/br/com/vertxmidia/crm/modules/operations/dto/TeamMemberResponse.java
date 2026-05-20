package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import java.time.Instant;
import java.util.UUID;

public record TeamMemberResponse(
        UUID id,
        String name,
        String role,
        Integer tasks,
        Integer completed,
        Integer performance,
        String notes,
        String taskBreakdown,
        Instant createdAt,
        Instant updatedAt
) {
    public static TeamMemberResponse from(TeamMember member) {
        return new TeamMemberResponse(
                member.getId(),
                member.getName(),
                member.getRole(),
                member.getTasks(),
                member.getCompleted(),
                member.getPerformance(),
                member.getNotes(),
                member.getTaskBreakdown(),
                member.getCreatedAt(),
                member.getUpdatedAt()
        );
    }
}
