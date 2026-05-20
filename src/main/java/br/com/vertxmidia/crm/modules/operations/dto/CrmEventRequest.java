package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CrmEventRequest(
        UUID clientId,
        @NotBlank @Size(max = 180) String title,
        @NotNull LocalDate date,
        LocalTime time,
        @NotBlank @Size(max = 40) String status,
        boolean sale,
        @DecimalMin("0.00") BigDecimal revenue
) {
}
