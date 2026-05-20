package br.com.vertxmidia.crm.modules.client.dto;

import jakarta.validation.constraints.NotBlank;

public record ClientPhaseUpdateRequest(
        @NotBlank(message = "A nova fase é obrigatória")
        String phase
) {
}
