package br.com.vertxmidia.crm.modules.organization.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrganizationRequest(
        @NotBlank @Size(max = 180) String name,
        @Email @Size(max = 180) String email,
        @Size(max = 40) String phone,
        @Size(max = 40) String document,
        @Size(max = 200) String website,
        @Size(max = 280) String address
) {
}
