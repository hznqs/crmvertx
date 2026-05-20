package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.common.RateLimitExceededException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginAttemptServiceTest {

    private LoginAttemptService service;

    @BeforeEach
    void setUp() {
        service = new LoginAttemptService();
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
