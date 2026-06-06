package br.com.vertxmidia.crm.modules.operations.dto;

import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CrmEventResponse(
        UUID id,
        UUID clientId,
        UUID leadId,
        UUID projectId,
        UUID contractId,
        UUID taskId,
        String type,
        String title,
        LocalDate date,
        LocalDate endDate,
        LocalTime time,
        LocalTime startTime,
        LocalTime endTime,
        boolean allDay,
        String status,
        String responsible,
        String meetingLink,
        String meetingUrl,
        String location,
        String priority,
        String color,
        String recurrenceRule,
        UUID recurrenceGroupId,
        String participants,
        Integer reminderMinutesBefore,
        boolean sale,
        BigDecimal revenue,
        String description,
        String notes,
        boolean active,
        Instant cancelledAt,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static CrmEventResponse from(CrmEvent event) {
        return new CrmEventResponse(
                event.getId(),
                event.getClientId(),
                event.getLeadId(),
                event.getProjectId(),
                event.getContractId(),
                event.getTaskId(),
                event.getType(),
                event.getTitle(),
                event.getDate(),
                event.getEndDate(),
                event.getTime(),
                event.getTime(),
                event.getEndTime(),
                event.isAllDay(),
                event.getStatus(),
                event.getResponsible(),
                event.getMeetingLink(),
                event.getMeetingUrl(),
                event.getLocation(),
                event.getPriority(),
                event.getColor(),
                event.getRecurrenceRule(),
                event.getRecurrenceGroupId(),
                event.getParticipants(),
                event.getReminderMinutesBefore(),
                event.isSale(),
                event.getRevenue(),
                event.getDescription(),
                event.getNotes(),
                event.isActive(),
                event.getCancelledAt(),
                event.getCompletedAt(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
