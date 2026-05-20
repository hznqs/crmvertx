package br.com.vertxmidia.crm.modules.client.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ClientRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 40) String phase,
        @NotNull @DecimalMin("0.00") BigDecimal value,
        @NotNull @Min(1) Integer months,
        @NotBlank @Size(max = 160) String contact,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(max = 40) String phone,
        @Size(max = 5000) String notes
) {
}
