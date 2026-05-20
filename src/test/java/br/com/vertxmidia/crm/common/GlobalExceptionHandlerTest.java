package br.com.vertxmidia.crm.common;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void rateLimitResponseUsesHttp429AndRetryAfterHeader() {
        ResponseEntity<ApiError> response = handler.handleRateLimit(
                new RateLimitExceededException("Muitas tentativas", 42)
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)).isEqualTo("42");
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().fields()).containsEntry("retryAfterSeconds", "42");
    }
}
