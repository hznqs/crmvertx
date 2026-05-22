package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.auth.domain.AppUser;
import br.com.vertxmidia.crm.modules.auth.domain.BlacklistedJwt;
import br.com.vertxmidia.crm.modules.auth.domain.RefreshToken;
import br.com.vertxmidia.crm.modules.auth.domain.UserRole;
import br.com.vertxmidia.crm.modules.auth.dto.LogoutRequest;
import br.com.vertxmidia.crm.modules.auth.dto.RefreshTokenRequest;
import br.com.vertxmidia.crm.modules.auth.infrastructure.AppUserRepository;
import br.com.vertxmidia.crm.modules.auth.infrastructure.BlacklistedJwtRepository;
import br.com.vertxmidia.crm.modules.auth.infrastructure.RefreshTokenRepository;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private static final String JWT_SECRET = "0123456789abcdef0123456789abcdef";

    @Test
    void refreshRotatesRefreshTokenAndIssuesNewSession() {
        RefreshTokenRepository refreshTokens = mock(RefreshTokenRepository.class);
        BlacklistedJwtRepository blacklistedJwts = mock(BlacklistedJwtRepository.class);
        AuditService audit = mock(AuditService.class);
        AppUser user = user(UUID.randomUUID());
        RefreshToken current = activeRefreshToken(user);

        when(refreshTokens.findByTokenHash(anyString())).thenReturn(Optional.of(current));

        AuthService service = service(refreshTokens, blacklistedJwts, audit);

        var response = service.refresh(new RefreshTokenRequest("refresh-token"));

        assertThat(current.getRevokedAt()).isNotNull();
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.expiresIn()).isEqualTo(28800);
        assertThat(response.user().email()).isEqualTo(user.getEmail());
        verify(audit).logAuthentication("TOKEN_REFRESH", user.getId(), user.getEmail());
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokens, times(2)).save(captor.capture());
        assertThat(captor.getAllValues().get(0)).isSameAs(current);
        assertThat(captor.getAllValues().get(1).getUser()).isSameAs(user);
    }

    @Test
    void refreshRejectsExpiredOrRevokedToken() {
        RefreshTokenRepository refreshTokens = mock(RefreshTokenRepository.class);
        AppUser user = user(UUID.randomUUID());
        RefreshToken expired = activeRefreshToken(user);
        expired.setExpiresAt(Instant.now().minusSeconds(60));

        when(refreshTokens.findByTokenHash(anyString())).thenReturn(Optional.of(expired));

        AuthService service = service(refreshTokens, mock(BlacklistedJwtRepository.class), mock(AuditService.class));

        assertThatThrownBy(() -> service.refresh(new RefreshTokenRequest("expired-refresh-token")))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Refresh token");
    }

    @Test
    void logoutBlacklistsJwtAndRevokesAllSessionsWhenRequested() {
        RefreshTokenRepository refreshTokens = mock(RefreshTokenRepository.class);
        BlacklistedJwtRepository blacklistedJwts = mock(BlacklistedJwtRepository.class);
        AuditService audit = mock(AuditService.class);
        UUID userId = UUID.randomUUID();
        Jwt jwt = jwt(userId, "logout-jti");

        when(blacklistedJwts.existsByJtiAndExpiresAtAfter(eq("logout-jti"), any(Instant.class))).thenReturn(false);

        AuthService service = service(refreshTokens, blacklistedJwts, audit);
        service.logout(jwt, new LogoutRequest(null, true));

        ArgumentCaptor<BlacklistedJwt> captor = ArgumentCaptor.forClass(BlacklistedJwt.class);
        verify(blacklistedJwts).deleteExpired(any(Instant.class));
        verify(blacklistedJwts).save(captor.capture());
        assertThat(captor.getValue().getJti()).isEqualTo("logout-jti");
        verify(refreshTokens).revokeAllActiveByUserId(eq(userId), any(Instant.class));
        verify(audit).logAuthentication("LOGOUT", userId, "admin@vertx.com");
    }

    private AuthService service(
            RefreshTokenRepository refreshTokens,
            BlacklistedJwtRepository blacklistedJwts,
            AuditService audit
    ) {
        return new AuthService(
                mock(AppUserRepository.class),
                refreshTokens,
                blacklistedJwts,
                mock(LoginAttemptService.class),
                audit,
                mock(PasswordEncoder.class),
                new MockEnvironment().withProperty("JWT_SECRET", JWT_SECRET)
        );
    }

    private RefreshToken activeRefreshToken(AppUser user) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash("hash");
        token.setExpiresAt(Instant.now().plusSeconds(3600));
        return token;
    }

    private AppUser user(UUID id) {
        AppUser user = new AppUser();
        ReflectionTestUtils.setField(user, "id", id);
        user.setName("Admin VertX");
        user.setEmail("admin@vertx.com");
        user.setRole(UserRole.ADMIN);
        user.setEnabled(true);
        user.setPasswordHash("encoded");
        return user;
    }

    private Jwt jwt(UUID userId, String jti) {
        Instant now = Instant.now();
        return new Jwt(
                "token",
                now,
                now.plusSeconds(3600),
                Map.of("alg", "HS256"),
                Map.of("sub", userId.toString(), "jti", jti, "email", "admin@vertx.com")
        );
    }
}
