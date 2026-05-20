package br.com.vertxmidia.crm.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
                message = "A nova senha deve ter 8+ caracteres, letra maiuscula, minuscula e numero"
        )
        String newPassword
) {
}
