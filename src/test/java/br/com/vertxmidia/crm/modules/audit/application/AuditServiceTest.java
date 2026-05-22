package br.com.vertxmidia.crm.modules.audit.application;

import br.com.vertxmidia.crm.modules.audit.domain.AuditLog;
import br.com.vertxmidia.crm.modules.audit.infrastructure.AuditLogRepository;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class AuditServiceTest {

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void logCapturesCurrentUserAndForwardedIp() {
        UUID userId = UUID.randomUUID();
        UUID entityId = UUID.randomUUID();
        AuditLogRepository repository = mock(AuditLogRepository.class);
        AuditService service = new AuditService(repository);

        authenticate(userId);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.10");
        request.addHeader("X-Forwarded-For", "203.0.113.9, 10.0.0.10");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        service.log("CREATE", "Cliente", entityId);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        AuditLog log = captor.getValue();
        assertThat(log.getUserId()).isEqualTo(userId);
        assertThat(log.getAction()).isEqualTo("CREATE");
        assertThat(log.getEntity()).isEqualTo("Cliente");
        assertThat(log.getEntityId()).isEqualTo(entityId);
        assertThat(log.getIpAddress()).isEqualTo("203.0.113.9");
    }

    @Test
    void logChangeIgnoresEquivalentValues() {
        AuditLogRepository repository = mock(AuditLogRepository.class);
        AuditService service = new AuditService(repository);

        service.logChange("Cliente", UUID.randomUUID(), "name", "VertX", "VertX");

        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void logAuthenticationSanitizesEmailMetadata() {
        AuditLogRepository repository = mock(AuditLogRepository.class);
        AuditService service = new AuditService(repository);
        UUID userId = UUID.randomUUID();

        service.logAuthentication("LOGIN_FAILURE", userId, "admin@example.com\r\nX-Injected: true");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        AuditLog log = captor.getValue();
        assertThat(log.getUserId()).isEqualTo(userId);
        assertThat(log.getAction()).isEqualTo("LOGIN_FAILURE");
        assertThat(log.getEntity()).isEqualTo("Authentication");
        assertThat(log.getMetadata()).isEqualTo("email=admin@example.comX-Injected: true");
    }

    private void authenticate(UUID userId) {
        Jwt jwt = new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", userId.toString())
        );
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(jwt, null));
    }
}
