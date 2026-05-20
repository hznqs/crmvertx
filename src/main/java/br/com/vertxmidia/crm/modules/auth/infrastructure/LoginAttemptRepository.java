package br.com.vertxmidia.crm.modules.auth.infrastructure;

import br.com.vertxmidia.crm.modules.auth.domain.LoginAttempt;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<LoginAttempt> findByAttemptKey(String attemptKey);

    void deleteByAttemptKey(String attemptKey);

    @Modifying
    long deleteByExpiresAtBefore(Instant expiresAt);
}
