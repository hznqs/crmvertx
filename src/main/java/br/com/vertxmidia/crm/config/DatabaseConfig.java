package br.com.vertxmidia.crm.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class DatabaseConfig {

    @Bean
    DataSource dataSource(Environment environment) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalStateException("Configure DATABASE_URL no .env ou nas variaveis do ambiente.");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(toJdbcUrl(databaseUrl));
        applyCredentials(databaseUrl, config);
        config.setMaximumPoolSize(Integer.parseInt(environment.getProperty("DB_POOL_SIZE", "10")));
        config.setMinimumIdle(Integer.parseInt(environment.getProperty("DB_POOL_MIN_IDLE", "2")));
        config.setInitializationFailTimeout(Long.parseLong(environment.getProperty("DB_POOL_INITIALIZATION_FAIL_TIMEOUT", "1")));
        config.setPoolName("vertx-crm-pool");
        return new HikariDataSource(config);
    }

    private String toJdbcUrl(String databaseUrl) {
        String rawUrl = databaseUrl.replaceFirst("^jdbc:", "");
        URI uri = URI.create(rawUrl);
        int port = uri.getPort();
        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                .append(uri.getHost());

        if (port > 0) {
            jdbcUrl.append(':').append(port);
        }

        jdbcUrl.append(uri.getPath() == null || uri.getPath().isBlank() ? "/postgres" : uri.getPath());

        String query = uri.getQuery();
        if (query == null || query.isBlank()) {
            jdbcUrl.append("?sslmode=require");
        } else {
            jdbcUrl.append('?').append(query);
            if (!query.contains("sslmode=")) {
                jdbcUrl.append("&sslmode=require");
            }
        }

        return jdbcUrl.toString();
    }

    private void applyCredentials(String databaseUrl, HikariConfig config) {
        String rawUrl = databaseUrl.replaceFirst("^jdbc:", "");
        URI uri = URI.create(rawUrl);
        String userInfo = uri.getUserInfo();
        if (userInfo == null || userInfo.isBlank()) {
            return;
        }

        String[] parts = userInfo.split(":", 2);
        config.setUsername(decode(parts[0]));
        if (parts.length > 1) {
            config.setPassword(decode(parts[1]));
        }
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
