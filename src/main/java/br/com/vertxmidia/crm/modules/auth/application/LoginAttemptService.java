package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.common.RateLimitExceededException;
import br.com.vertxmidia.crm.modules.auth.domain.LoginAttempt;
import br.com.vertxmidia.crm.modules.auth.infrastructure.LoginAttemptRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class LoginAttemptService {

    private static final int MAX_EMAIL_IP_ATTEMPTS = 5;
    private static final int MAX_IP_ATTEMPTS = 25;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final LoginAttemptRepository attempts;

    public LoginAttemptService(LoginAttemptRepository attempts) {
        this.attempts = attempts;
    }

    @Transactional
    public void assertAllowed(String email) {
        assertKeyAllowed(emailIpKey(email), MAX_EMAIL_IP_ATTEMPTS);
        assertKeyAllowed(ipKey(), MAX_IP_ATTEMPTS);
    }

    @Transactional
    public void recordFailure(String email) {
        recordFailure(emailIpKey(email), MAX_EMAIL_IP_ATTEMPTS);
        recordFailure(ipKey(), MAX_IP_ATTEMPTS);
    }

    @Transactional
    public void recordSuccess(String email) {
        attempts.deleteByAttemptKey(emailIpKey(email));
        attempts.deleteByAttemptKey(ipKey());
    }

    private void assertKeyAllowed(String key, int maxAttempts) {
        LoginAttempt attempt = attempts.findByAttemptKey(key).orElse(null);
        if (attempt == null) {
            return;
        }

        if (attempt.getExpiresAt().isBefore(Instant.now())) {
            attempts.delete(attempt);
            return;
        }

        if (attempt.getCount() >= maxAttempts) {
            throw blocked(attempt);
        }
    }

    private void recordFailure(String key, int maxAttempts) {
        Instant now = Instant.now();
        LoginAttempt attempt = attempts.findByAttemptKey(key).orElseGet(() -> {
            LoginAttempt fresh = new LoginAttempt();
            fresh.setAttemptKey(key);
            return fresh;
        });

        int nextCount = attempt.getExpiresAt() == null || attempt.getExpiresAt().isBefore(now)
                ? 1
                : attempt.getCount() + 1;

        attempt.setCount(nextCount);
        attempt.setExpiresAt(now.plus(WINDOW));
        attempt.setUpdatedAt(now);
        LoginAttempt saved = attempts.save(attempt);

        if (saved.getCount() >= maxAttempts) {
            throw blocked(attempt);
        }
    }

    private RateLimitExceededException blocked(LoginAttempt attempt) {
        long retryAfter = Duration.between(Instant.now(), attempt.getExpiresAt()).toSeconds();
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
}
