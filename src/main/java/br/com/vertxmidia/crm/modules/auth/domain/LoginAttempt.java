package br.com.vertxmidia.crm.modules.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "login_attempts")
public class LoginAttempt {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "attempt_key", nullable = false, unique = true, length = 320)
    private String attemptKey;

    @Column(nullable = false)
    private int count;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() {
        return id;
    }

    public String getAttemptKey() {
        return attemptKey;
    }

    public void setAttemptKey(String attemptKey) {
        this.attemptKey = attemptKey;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
