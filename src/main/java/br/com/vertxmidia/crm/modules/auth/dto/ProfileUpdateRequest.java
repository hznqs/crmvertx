package br.com.vertxmidia.crm.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 120) String position,
        @Size(max = 2000) String photoUrl
) {
}
