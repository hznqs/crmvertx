package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record DeliveryRequest(
        UUID clientId,
        UUID projectId,
        UUID contractId,
        UUID serviceId,
        @NotBlank @Size(max = 80) String type,
        @NotBlank @Size(max = 180) String title,
        @Size(max = 10000) String description,
        @NotBlank @Size(max = 160) String owner,
        @NotNull LocalDate deadline,
        @NotBlank
        @Pattern(regexp = "^(backlog|planejamento|pendente|producao|revisao|ajustes|aprovado)$", message = "Status de entrega invalido")
        @Size(max = 40) String status,
        Boolean active
) {
}
