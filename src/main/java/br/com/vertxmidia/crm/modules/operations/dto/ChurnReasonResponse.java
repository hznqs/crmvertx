package br.com.vertxmidia.crm.modules.operations.dto;

public record ChurnReasonResponse(
        String reason,
        long total
) {
}
