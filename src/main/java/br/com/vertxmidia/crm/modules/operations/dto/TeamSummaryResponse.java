package br.com.vertxmidia.crm.modules.operations.dto;

public record TeamSummaryResponse(
        long total,
        long tasks,
        long completed,
        long productivity,
        long marketing,
        long traffic,
        long sdr,
        long closer,
        long developer
) {
}
