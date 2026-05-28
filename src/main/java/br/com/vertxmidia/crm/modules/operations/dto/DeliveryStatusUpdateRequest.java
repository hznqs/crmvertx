package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DeliveryStatusUpdateRequest(
        @NotBlank
        @Pattern(regexp = "^(backlog|planejamento|pendente|producao|revisao|ajustes|aprovado)$", message = "Status de entrega invalido")
        String status
) {
}
