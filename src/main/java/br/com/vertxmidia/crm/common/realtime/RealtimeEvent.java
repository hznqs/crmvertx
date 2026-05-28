package br.com.vertxmidia.crm.common.realtime;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record RealtimeEvent(
        UUID id,
        String type,
        String channel,
        UUID userId,
        UUID tenantId,
        String entity,
        UUID entityId,
        String action,
        Map<String, Object> payload,
        Instant occurredAt
) {
    public static RealtimeEvent of(
            String type,
            String channel,
            UUID userId,
            String entity,
            UUID entityId,
            String action,
            Map<String, Object> payload
    ) {
        return new RealtimeEvent(
                UUID.randomUUID(),
                type,
                channel,
                userId,
                null,
                entity,
                entityId,
                action,
                payload == null ? Map.of() : Map.copyOf(payload),
                Instant.now()
        );
    }
}
