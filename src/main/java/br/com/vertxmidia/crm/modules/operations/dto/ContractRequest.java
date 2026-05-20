package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record ContractRequest(
        UUID clientId,
        @NotBlank @Size(max = 120) String plan,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank
        @Pattern(regexp = "^(ativo|encerrado|pausado|cancelado)$", message = "Status de contrato invalido")
        @Size(max = 40) String status,
        boolean autoRenew
) {
}
