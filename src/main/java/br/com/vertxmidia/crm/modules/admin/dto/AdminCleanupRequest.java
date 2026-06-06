package br.com.vertxmidia.crm.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminCleanupRequest(
        @NotNull(message = "Modo de limpeza obrigatorio")
        AdminCleanupMode mode,

        @NotBlank(message = "Confirmacao obrigatoria")
        String confirmation
) {
}
