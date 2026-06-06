package br.com.vertxmidia.crm.modules.operations.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @Size(max = 160) String name,
        @Pattern(regexp = "^(FATURAMENTO|VENDAS|CLIENTES|REUNIOES|ENTREGAS|LUCRO|LEADS|TAREFAS|PROJETOS|COMISSAO)$", message = "Tipo de meta invalido")
        String type,
        @DecimalMin("0.00") BigDecimal target,
        @DecimalMin("0.00") BigDecimal actual,
        @NotNull LocalDate date,
        LocalDate periodStart,
        LocalDate periodEnd,
        @Size(max = 160) String responsible,
        @Pattern(regexp = "^(EM_ANDAMENTO|ATINGIDA|ATRASADA|CANCELADA)$", message = "Status de meta invalido")
        String status,
        Boolean active
) {
}
