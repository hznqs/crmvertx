package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ContractLifecycleRequest(
        LocalDate date,
        @Size(max = 500, message = "Motivo deve ter no maximo 500 caracteres")
        String reason,
        @Size(max = 2000, message = "Observacoes devem ter no maximo 2000 caracteres")
        String notes
) {
}
