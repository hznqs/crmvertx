package br.com.vertxmidia.crm.modules.admin.dto;

import java.time.Instant;
import java.util.Map;

public record AdminCleanupResponse(
        AdminCleanupMode mode,
        String message,
        Map<String, Integer> deletedRows,
        Instant executedAt
) {
}
