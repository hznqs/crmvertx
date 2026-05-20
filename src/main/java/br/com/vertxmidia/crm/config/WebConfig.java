package br.com.vertxmidia.crm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.PageableHandlerMethodArgumentResolverCustomizer;

@Configuration
public class WebConfig {

    private static final int MAX_PAGE_SIZE = 100;

    @Bean
    PageableHandlerMethodArgumentResolverCustomizer pageableCustomizer() {
        return resolver -> {
            resolver.setMaxPageSize(MAX_PAGE_SIZE);
            resolver.setOneIndexedParameters(false);
        };
    }
}
