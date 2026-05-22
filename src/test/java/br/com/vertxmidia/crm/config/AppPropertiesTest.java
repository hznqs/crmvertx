package br.com.vertxmidia.crm.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AppPropertiesTest {

    @Test
    void separatesExactCorsOriginsFromWildcardPatterns() {
        AppProperties properties = new AppProperties();
        properties.getSecurity().setAllowedOrigins("http://localhost:8080, https://*.up.railway.app, https://crm.example.com");

        assertThat(properties.getSecurity().allowedOriginList())
                .containsExactly("http://localhost:8080", "https://crm.example.com");
        assertThat(properties.getSecurity().allowedOriginPatternList())
                .containsExactly("https://*.up.railway.app");
    }

    @Test
    void filtersUnsafeCspConnectSourcesFromEmptyTokens() {
        AppProperties properties = new AppProperties();
        properties.getSecurity().setCspConnectSrc("https://api.example.com, , http://localhost:8080");

        assertThat(properties.getSecurity().cspConnectSrcList())
                .containsExactly("https://api.example.com", "http://localhost:8080");
    }
}
