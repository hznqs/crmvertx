package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.modules.auth.infrastructure.LoginAttemptRepository;
import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class LoginAttemptCleanupScheduler {

    private final LoginAttemptRepository attempts;

    public LoginAttemptCleanupScheduler(LoginAttemptRepository attempts) {
        this.attempts = attempts;
    }

    @Scheduled(fixedDelayString = "${crm.security.login-attempt-cleanup-ms:900000}")
    @Transactional
    public void removeExpiredAttempts() {
        attempts.deleteByExpiresAtBefore(Instant.now());
    }
}
