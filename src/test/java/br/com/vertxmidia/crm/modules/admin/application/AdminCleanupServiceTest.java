package br.com.vertxmidia.crm.modules.admin.application;

import br.com.vertxmidia.crm.modules.admin.dto.AdminCleanupMode;
import br.com.vertxmidia.crm.modules.admin.dto.AdminCleanupRequest;
import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class AdminCleanupServiceTest {

    @Test
    void rejectsInvalidConfirmation() {
        AdminCleanupService service = newService(new MockEnvironment(), mock(JdbcTemplate.class));

        assertThatThrownBy(() -> service.cleanup(new AdminCleanupRequest(AdminCleanupMode.OPERATIONAL, "limpar")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Confirmacao invalida");
    }

    @Test
    void blocksProductionWithoutExplicitEnableFlag() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("APP_ENV", "production");
        AdminCleanupService service = newService(environment, mock(JdbcTemplate.class));

        assertThatThrownBy(() -> service.cleanup(new AdminCleanupRequest(AdminCleanupMode.OPERATIONAL, AdminCleanupService.REQUIRED_CONFIRMATION)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("bloqueada");
    }

    @Test
    void operationalCleanupRemovesOperationalTablesAndPreservesUsersAndServices() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        AdminCleanupService service = newService(new MockEnvironment(), jdbcTemplate);

        var response = service.cleanup(new AdminCleanupRequest(AdminCleanupMode.OPERATIONAL, AdminCleanupService.REQUIRED_CONFIRMATION));

        assertThat(response.deletedRows()).containsKeys(
                "crm_leads",
                "crm_clients",
                "crm_contracts",
                "crm_contract_service_items",
                "crm_projects",
                "crm_tasks",
                "crm_finance_entries",
                "crm_commission_sales",
                "crm_goals"
        );
        assertThat(response.deletedRows()).doesNotContainKeys("crm_service_offerings", "crm_team_members", "app_users");
        verify(jdbcTemplate).update("delete from crm_tasks");
        verify(jdbcTemplate, never()).update(contains("app_users"));
        verify(jdbcTemplate, never()).update(contains("crm_settings"));
        verify(jdbcTemplate, never()).update(contains("organizations"));
        verify(jdbcTemplate, never()).update(contains("flyway_schema_history"));
    }

    @Test
    void businessCleanupAlsoRemovesServicesTemplatesAndTeamMembers() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        AdminCleanupService service = newService(new MockEnvironment(), jdbcTemplate);

        var response = service.cleanup(new AdminCleanupRequest(AdminCleanupMode.BUSINESS, AdminCleanupService.REQUIRED_CONFIRMATION));

        assertThat(response.deletedRows()).containsKeys(
                "crm_service_task_templates",
                "crm_service_offerings",
                "crm_team_members"
        );
        verify(jdbcTemplate).update("delete from crm_service_task_templates");
        verify(jdbcTemplate).update("delete from crm_service_offerings");
        verify(jdbcTemplate).update("delete from crm_team_members");
    }

    @Test
    void resetDemoIsNotExecutedUntilDemoSeederExists() {
        AdminCleanupService service = newService(new MockEnvironment(), mock(JdbcTemplate.class));

        assertThatThrownBy(() -> service.cleanup(new AdminCleanupRequest(AdminCleanupMode.RESET_DEMO, AdminCleanupService.REQUIRED_CONFIRMATION)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Reset demo");
    }

    private AdminCleanupService newService(MockEnvironment environment, JdbcTemplate jdbcTemplate) {
        return new AdminCleanupService(jdbcTemplate, environment, mock(AuditService.class));
    }
}
