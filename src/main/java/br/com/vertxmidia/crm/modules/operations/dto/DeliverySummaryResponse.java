package br.com.vertxmidia.crm.modules.operations.dto;

public record DeliverySummaryResponse(
        long pending,
        long production,
        long review,
        long approved,
        long late
) {
}
