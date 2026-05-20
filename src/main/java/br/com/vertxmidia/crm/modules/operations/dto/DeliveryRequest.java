package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record DeliveryRequest(
        UUID clientId,
        @NotBlank @Size(max = 80) String type,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 160) String owner,
        @NotNull LocalDate deadline,
        @NotBlank @Size(max = 40) String status
) {
}
