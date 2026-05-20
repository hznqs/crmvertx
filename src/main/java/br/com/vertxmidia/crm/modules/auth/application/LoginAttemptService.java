package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.common.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class LoginAttemptService {

    private static final int MAX_EMAIL_IP_ATTEMPTS = 5;
    private static final int MAX_IP_ATTEMPTS = 25;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void assertAllowed(String email) {
        assertKeyAllowed(emailIpKey(email), MAX_EMAIL_IP_ATTEMPTS);
        assertKeyAllowed(ipKey(), MAX_IP_ATTEMPTS);
    }

    public void recordFailure(String email) {
        recordFailure(emailIpKey(email), MAX_EMAIL_IP_ATTEMPTS);
        recordFailure(ipKey(), MAX_IP_ATTEMPTS);
    }

    public void recordSuccess(String email) {
        attempts.remove(emailIpKey(email));
        attempts.remove(ipKey());
    }

    private void assertKeyAllowed(String key, int maxAttempts) {
        Attempt attempt = attempts.get(key);
        if (attempt == null) {
            return;
        }

        if (attempt.expiresAt().isBefore(Instant.now())) {
            attempts.remove(key);
            return;
        }

        if (attempt.count() >= maxAttempts) {
            throw blocked(attempt);
        }
    }

    private void recordFailure(String key, int maxAttempts) {
        Attempt attempt = attempts.compute(key, (ignored, current) -> {
            Instant now = Instant.now();
            if (current == null || current.expiresAt().isBefore(now)) {
                return new Attempt(1, now.plus(WINDOW));
            }
            return new Attempt(current.count() + 1, now.plus(WINDOW));
        });

        if (attempt.count() >= maxAttempts) {
            throw blocked(attempt);
        }
    }

    private RateLimitExceededException blocked(Attempt attempt) {
        long retryAfter = Duration.between(Instant.now(), attempt.expiresAt()).toSeconds();
        return new RateLimitExceededException(
                "Muitas tentativas de login. Tente novamente em alguns minutos.",
                retryAfter
        );
    }

    private String emailIpKey(String email) {
        return "email-ip:" + normalize(email) + ":" + currentIpAddress();
    }

    private String ipKey() {
        return "ip:" + currentIpAddress();
    }

    private String normalize(String email) {
        return String.valueOf(email).trim().toLowerCase(Locale.ROOT);
    }

    private String currentIpAddress() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return "unknown";
        }

        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record Attempt(int count, Instant expiresAt) {
    }
}
