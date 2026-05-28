package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
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
        @Pattern(regexp = "^(REUNIAO|FOLLOW_UP|LIGACAO|ENTREGA|COBRANCA|INTERNO)$", message = "Tipo de agenda invalido")
        String type,
        @NotBlank @Size(max = 180) String title,
        @NotNull LocalDate date,
        LocalTime time,
        @NotBlank
        @Pattern(regexp = "^(agendada|executada|cancelada)$", message = "Status de evento invalido")
        @Size(max = 40) String status,
        boolean sale,
        @DecimalMin("0.00") BigDecimal revenue,
        @Size(max = 10000) String notes,
        Boolean active
) {
}
