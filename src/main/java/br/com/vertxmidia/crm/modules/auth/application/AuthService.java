package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.common.RateLimitExceededException;
import br.com.vertxmidia.crm.modules.auth.domain.AppUser;
import br.com.vertxmidia.crm.modules.auth.domain.BlacklistedJwt;
import br.com.vertxmidia.crm.modules.auth.domain.RefreshToken;
import br.com.vertxmidia.crm.modules.auth.dto.AuthUserResponse;
import br.com.vertxmidia.crm.modules.auth.dto.LoginRequest;
import br.com.vertxmidia.crm.modules.auth.dto.LoginResponse;
import br.com.vertxmidia.crm.modules.auth.dto.LogoutRequest;
import br.com.vertxmidia.crm.modules.auth.dto.RefreshTokenRequest;
import br.com.vertxmidia.crm.modules.auth.infrastructure.AppUserRepository;
import br.com.vertxmidia.crm.modules.auth.infrastructure.BlacklistedJwtRepository;
import br.com.vertxmidia.crm.modules.auth.infrastructure.RefreshTokenRepository;
import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Duration TOKEN_TTL = Duration.ofHours(8);
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(30);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AppUserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final BlacklistedJwtRepository blacklistedJwts;
    private final LoginAttemptService loginAttempts;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public AuthService(
            AppUserRepository users,
            RefreshTokenRepository refreshTokens,
            BlacklistedJwtRepository blacklistedJwts,
            LoginAttemptService loginAttempts,
            AuditService auditService,
            PasswordEncoder passwordEncoder,
            Environment environment
    ) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.blacklistedJwts = blacklistedJwts;
        this.loginAttempts = loginAttempts;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        assertLoginAllowed(email);

        Optional<AppUser> candidate = users.findByEmail(email).filter(AppUser::isEnabled);
        if (candidate.isEmpty()) {
            registerLoginFailure(email, null);
            throw new BadCredentialsException("Credenciais invalidas");
        }

        AppUser user = candidate.get();
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            registerLoginFailure(email, user.getId());
            throw new BadCredentialsException("Credenciais invalidas");
        }

        loginAttempts.recordSuccess(email);
        auditService.logAuthentication("LOGIN_SUCCESS", user.getId(), email);
        return issueSession(user);
    }

    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.refreshToken());
        RefreshToken current = refreshTokens.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token invalido"));

        Instant now = Instant.now();
        if (!current.isActive(now)) {
            throw new BadCredentialsException("Refresh token expirado ou revogado");
        }

        current.setRevokedAt(now);
        refreshTokens.save(current);
        auditService.logAuthentication("TOKEN_REFRESH", current.getUser().getId(), current.getUser().getEmail());
        return issueSession(current.getUser());
    }

    @Transactional
    public void logout(Jwt jwt, LogoutRequest request) {
        Instant now = Instant.now();
        blacklist(jwt, now);

        if (request != null && request.revokeAllSessions()) {
            refreshTokens.revokeAllActiveByUserId(UUID.fromString(jwt.getSubject()), now);
        } else if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            refreshTokens.findByTokenHash(hashToken(request.refreshToken()))
                    .ifPresent(token -> {
                        token.setRevokedAt(now);
                        refreshTokens.save(token);
                    });
        }

        auditService.logAuthentication("LOGOUT", UUID.fromString(jwt.getSubject()), jwt.getClaimAsString("email"));
    }

    private LoginResponse issueSession(AppUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(TOKEN_TTL);
        String accessToken = createToken(user, now, expiresAt);
        String refreshToken = createRefreshToken(user, now);
        return new LoginResponse("Bearer", accessToken, refreshToken, TOKEN_TTL.toSeconds(), AuthUserResponse.from(user));
    }

    private String createRefreshToken(AppUser user, Instant now) {
        byte[] tokenBytes = new byte[48];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(token));
        refreshToken.setExpiresAt(now.plus(REFRESH_TOKEN_TTL));
        refreshTokens.save(refreshToken);
        return token;
    }

    private void blacklist(Jwt jwt, Instant now) {
        String jti = jwt.getId();
        if (jti == null || jti.isBlank()) {
            return;
        }

        blacklistedJwts.deleteExpired(now);
        if (blacklistedJwts.existsByJtiAndExpiresAtAfter(jti, now)) {
            return;
        }

        BlacklistedJwt token = new BlacklistedJwt();
        token.setJti(jti);
        token.setExpiresAt(jwt.getExpiresAt() == null ? now.plus(TOKEN_TTL) : jwt.getExpiresAt());
        blacklistedJwts.save(token);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(String.valueOf(token).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponivel no runtime.", ex);
        }
    }

    private void assertLoginAllowed(String email) {
        try {
            loginAttempts.assertAllowed(email);
        } catch (RateLimitExceededException ex) {
            auditService.logAuthentication("LOGIN_BLOCKED", null, email);
            throw ex;
        }
    }

    private void registerLoginFailure(String email, UUID userId) {
        auditService.logAuthentication("LOGIN_FAILURE", userId, email);
        try {
            loginAttempts.recordFailure(email);
        } catch (RateLimitExceededException ex) {
            auditService.logAuthentication("LOGIN_BLOCKED", userId, email);
            throw ex;
        }
    }

    private String createToken(AppUser user, Instant issuedAt, Instant expiresAt) {
        String secret = environment.getProperty("JWT_SECRET", "");
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET deve ter pelo menos 32 caracteres.");
        }

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("vertx-crm")
                .issueTime(Date.from(issuedAt))
                .expirationTime(Date.from(expiresAt))
                .jwtID(UUID.randomUUID().toString())
                .subject(user.getId().toString())
                .claim("name", user.getName())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("scope", "crm")
                .build();

        SignedJWT jwt = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(),
                claims
        );

        try {
            jwt.sign(new MACSigner(secretBytes));
            return jwt.serialize();
        } catch (JOSEException ex) {
            throw new IllegalStateException("Nao foi possivel gerar o token de acesso.", ex);
        }
    }
}
