package br.com.vertxmidia.crm.common.realtime;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class RealtimeEventHub {

    private static final long STREAM_TIMEOUT_MS = 30L * 60L * 1000L;
    private static final int RECENT_EVENT_LIMIT = 100;
    private final CopyOnWriteArrayList<ClientConnection> clients = new CopyOnWriteArrayList<>();
    private final Deque<RealtimeEvent> recentEvents = new ArrayDeque<>();

    public SseEmitter subscribe(UUID userId) {
        SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT_MS);
        ClientConnection connection = new ClientConnection(UUID.randomUUID(), userId, emitter);
        clients.add(connection);

        emitter.onCompletion(() -> disconnect(connection));
        emitter.onTimeout(() -> disconnect(connection));
        emitter.onError(error -> disconnect(connection));

        send(connection, RealtimeEvent.of(
                "presence.connected",
                "presence",
                userId,
                "Presence",
                connection.id(),
                "CONNECTED",
                Map.of("onlineUsers", onlineUsers(), "connectedAt", Instant.now().toString())
        ));

        for (RealtimeEvent event : recentSnapshot()) {
            send(connection, event);
        }

        publish(RealtimeEvent.of(
                "presence.updated",
                "presence",
                userId,
                "Presence",
                connection.id(),
                "ONLINE",
                Map.of("onlineUsers", onlineUsers())
        ));

        return emitter;
    }

    public void publish(RealtimeEvent event) {
        remember(event);
        for (ClientConnection client : clients) {
            send(client, event);
        }
    }

    public int onlineUsers() {
        return (int) clients.stream()
                .map(ClientConnection::userId)
                .distinct()
                .count();
    }

    private void disconnect(ClientConnection connection) {
        if (!clients.remove(connection)) {
            return;
        }

        publish(RealtimeEvent.of(
                "presence.updated",
                "presence",
                connection.userId(),
                "Presence",
                connection.id(),
                "OFFLINE",
                Map.of("onlineUsers", onlineUsers())
        ));
    }

    private void send(ClientConnection connection, RealtimeEvent event) {
        try {
            connection.emitter().send(SseEmitter.event()
                    .id(event.id().toString())
                    .name("realtime.event")
                    .data(event));
        } catch (IOException | IllegalStateException ex) {
            clients.remove(connection);
        }
    }

    private synchronized void remember(RealtimeEvent event) {
        recentEvents.addFirst(event);
        while (recentEvents.size() > RECENT_EVENT_LIMIT) {
            recentEvents.removeLast();
        }
    }

    private synchronized List<RealtimeEvent> recentSnapshot() {
        return new ArrayList<>(recentEvents);
    }

    private record ClientConnection(UUID id, UUID userId, SseEmitter emitter) {
    }
}
