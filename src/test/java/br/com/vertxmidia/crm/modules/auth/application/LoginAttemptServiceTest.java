package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.common.RateLimitExceededException;
import br.com.vertxmidia.crm.modules.auth.domain.LoginAttempt;
import br.com.vertxmidia.crm.modules.auth.infrastructure.LoginAttemptRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoginAttemptServiceTest {

    private LoginAttemptService service;
    private Map<String, LoginAttempt> attempts;

    @BeforeEach
    void setUp() {
        attempts = new HashMap<>();
        LoginAttemptRepository repository = mock(LoginAttemptRepository.class);
        when(repository.findByAttemptKey(anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            return Optional.ofNullable(attempts.get(key));
        });
        when(repository.save(any(LoginAttempt.class))).thenAnswer(invocation -> {
            LoginAttempt attempt = invocation.getArgument(0);
            attempts.put(attempt.getAttemptKey(), attempt);
            return attempt;
        });
        doAnswer(invocation -> {
            String key = invocation.getArgument(0);
            attempts.remove(key);
            return null;
        }).when(repository).deleteByAttemptKey(anyString());
        doAnswer(invocation -> {
            LoginAttempt attempt = invocation.getArgument(0);
            attempts.remove(attempt.getAttemptKey());
            return null;
        }).when(repository).delete(any(LoginAttempt.class));

        service = new LoginAttemptService(repository);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.8");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void blocksAfterMaximumFailuresForSameEmailAndIp() {
        String email = "user@vertxmidia.com";

        for (int i = 0; i < 4; i++) {
            service.recordFailure(email);
        }

        assertThatThrownBy(() -> service.recordFailure(email))
                .isInstanceOf(RateLimitExceededException.class)
                .hasMessageContaining("Muitas tentativas");
    }

    @Test
    void successClearsFailureWindow() {
        String email = "user@vertxmidia.com";

        for (int i = 0; i < 4; i++) {
            service.recordFailure(email);
        }

        service.recordSuccess(email);

        assertThatCode(() -> service.assertAllowed(email)).doesNotThrowAnyException();
    }
}
