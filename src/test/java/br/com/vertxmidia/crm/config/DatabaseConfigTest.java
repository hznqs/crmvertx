package br.com.vertxmidia.crm.config;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DatabaseConfigTest {

    @Test
    void createsJdbcUrlFromRailwayStyleDatabaseUrlWithSsl() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("DATABASE_URL", "postgresql://crm_user:p%40ssword@railway.internal:5432/railway")
                .withProperty("DB_POOL_INITIALIZATION_FAIL_TIMEOUT", "-1");

        DataSource dataSource = new DatabaseConfig().dataSource(environment);

        HikariDataSource hikari = (HikariDataSource) dataSource;
        assertThat(hikari.getJdbcUrl()).isEqualTo("jdbc:postgresql://railway.internal:5432/railway?sslmode=require");
        assertThat(hikari.getUsername()).isEqualTo("crm_user");
        assertThat(hikari.getPassword()).isEqualTo("p@ssword");
        hikari.close();
    }

    @Test
    void preservesExplicitQueryParametersAndAddsSslWhenMissing() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("DATABASE_URL", "postgresql://user:secret@host:5432/postgres?connectTimeout=10")
                .withProperty("DB_POOL_INITIALIZATION_FAIL_TIMEOUT", "-1");

        HikariDataSource dataSource = (HikariDataSource) new DatabaseConfig().dataSource(environment);

        assertThat(dataSource.getJdbcUrl()).isEqualTo("jdbc:postgresql://host:5432/postgres?connectTimeout=10&sslmode=require");
        dataSource.close();
    }

    @Test
    void failsFastWithoutDatabaseUrl() {
        assertThatThrownBy(() -> new DatabaseConfig().dataSource(new MockEnvironment()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("DATABASE_URL");
    }
}
