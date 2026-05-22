package br.com.vertxmidia.crm.config;

import br.com.vertxmidia.crm.modules.auth.infrastructure.BlacklistedJwtRepository;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AppProperties appProperties) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);
        http.cors(Customizer.withDefaults());
        http.headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                        "default-src 'self'; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; " +
                        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
                        "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com data:; " +
                        "img-src 'self' data: blob: https:; " +
                        "connect-src " + connectSrc(appProperties) + "; " +
                        "object-src 'none'; " +
                        "base-uri 'self'; " +
                        "frame-ancestors 'none'"
                ))
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .frameOptions(frame -> frame.deny())
                .permissionsPolicy(policy -> policy.policy("camera=(), microphone=(), geolocation=(), payment=()"))
        );

        http.authorizeHttpRequests(auth -> {
            auth.requestMatchers("/", "/index.html", "/login.html", "/app.html", "/assets/**", "/favicon.ico").permitAll();
            auth.requestMatchers("/api/health").permitAll();
            auth.requestMatchers("/api/auth/login").permitAll();
            auth.requestMatchers("/api/auth/refresh").permitAll();
            auth.requestMatchers("/api/**").authenticated();
            auth.anyRequest().permitAll();
        });

        http.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties appProperties) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(appProperties.getSecurity().allowedOriginList());
        configuration.setAllowedOriginPatterns(appProperties.getSecurity().allowedOriginPatternList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L);
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    JwtDecoder jwtDecoder(Environment environment, BlacklistedJwtRepository blacklistedJwts) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwtSecret(environment))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                blacklistValidator(blacklistedJwts)
        ));
        return decoder;
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return authenticationConverter;
    }

    private SecretKeySpec jwtSecret(Environment environment) {
        String secret = environment.getProperty("JWT_SECRET", "");
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET deve ter pelo menos 32 caracteres.");
        }
        return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    private OAuth2TokenValidator<Jwt> blacklistValidator(BlacklistedJwtRepository blacklistedJwts) {
        return jwt -> {
            String jti = jwt.getId();
            if (jti == null || jti.isBlank()) {
                return OAuth2TokenValidatorResult.success();
            }
            boolean blocked = blacklistedJwts.existsByJtiAndExpiresAtAfter(jti, Instant.now());
            if (!blocked) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                    "invalid_token",
                    "Token revogado.",
                    null
            ));
        };
    }

    private String connectSrc(AppProperties appProperties) {
        List<String> sources = appProperties.getSecurity().cspConnectSrcList();
        if (sources.isEmpty()) {
            return "'self'";
        }
        return "'self' " + String.join(" ", sources.stream()
                .filter(this::isSafeCspSource)
                .toList());
    }

    private boolean isSafeCspSource(String source) {
        return source.startsWith("https://")
                || source.startsWith("http://localhost")
                || source.startsWith("http://127.0.0.1");
    }
}
