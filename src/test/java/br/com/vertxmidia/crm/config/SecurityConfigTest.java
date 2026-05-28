package br.com.vertxmidia.crm.config;

import br.com.vertxmidia.crm.modules.auth.infrastructure.BlacklistedJwtRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    @Test
    void corsUsesExactOriginsAndWildcardPatterns() {
        AppProperties properties = new AppProperties();
        properties.getSecurity().setAllowedOrigins("http://localhost:8080,https://*.up.railway.app,https://crm.example.com");
        SecurityConfig config = new SecurityConfig();

        CorsConfigurationSource source = config.corsConfigurationSource(properties);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/clients");
        CorsConfiguration cors = source.getCorsConfiguration(request);

        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOrigins()).containsExactly("http://localhost:8080", "https://crm.example.com");
        assertThat(cors.getAllowedOriginPatterns()).containsExactly("https://*.up.railway.app");
        assertThat(cors.getAllowedMethods()).contains("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        assertThat(cors.getAllowedHeaders()).containsExactly("Authorization", "Content-Type", "X-Correlation-Id");
        assertThat(cors.getExposedHeaders()).containsExactly("X-Correlation-Id");
    }

    @Test
    void cspConnectSrcKeepsOnlySafeSources() {
        AppProperties properties = new AppProperties();
        properties.getSecurity().setCspConnectSrc("https://api.example.com,http://localhost:5173,http://evil.example.com,ftp://bad.example.com");
        SecurityConfig config = new SecurityConfig();

        String connectSrc = ReflectionTestUtils.invokeMethod(config, "connectSrc", properties);

        assertThat(connectSrc).isEqualTo("'self' https://api.example.com http://localhost:5173");
    }

    @Test
    void jwtSecretRejectsShortSecrets() {
        SecurityConfig config = new SecurityConfig();

        org.springframework.mock.env.MockEnvironment environment = new org.springframework.mock.env.MockEnvironment()
                .withProperty("JWT_SECRET", "curto");

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> config.jwtDecoder(environment, mock(BlacklistedJwtRepository.class)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }
}
