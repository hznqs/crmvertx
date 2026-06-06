package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CrmEventRequest(
        UUID clientId,
        UUID leadId,
        UUID projectId,
        UUID contractId,
        UUID taskId,
        @Pattern(regexp = "^(REUNIAO|FOLLOW_UP|LIGACAO|ENTREGA|COBRANCA|INTERNO|CHAMADA|PRESENCIAL|ONLINE|APRESENTACAO|ALINHAMENTO|FECHAMENTO)$", message = "Tipo de agenda invalido")
        String type,
        @NotBlank @Size(max = 180) String title,
        @NotNull LocalDate date,
        LocalDate endDate,
        LocalTime time,
        LocalTime startTime,
        LocalTime endTime,
        Boolean allDay,
        @NotBlank
        @Pattern(regexp = "^(agendada|executada|realizada|cancelada|remarcada)$", message = "Status de evento invalido")
        @Size(max = 40) String status,
        @Size(max = 180) String responsible,
        @Size(max = 500) String meetingLink,
        @Size(max = 500) String meetingUrl,
        @Size(max = 240) String location,
        @Pattern(regexp = "^(baixa|media|alta|critica)$", message = "Prioridade de evento invalida")
        String priority,
        @Size(max = 24) String color,
        @Pattern(regexp = "^(NONE|DAILY|WEEKLY|MONTHLY|YEARLY)?$", message = "Recorrencia de evento invalida")
        String recurrenceRule,
        UUID recurrenceGroupId,
        @Size(max = 10000) String participants,
        @Min(0) Integer reminderMinutesBefore,
        boolean sale,
        @DecimalMin("0.00") BigDecimal revenue,
        @Size(max = 10000) String description,
        @Size(max = 10000) String notes,
        Boolean active
) {
}
