package br.com.vertxmidia.crm.modules.admin.application;

import br.com.vertxmidia.crm.modules.admin.dto.AdminCleanupMode;
import br.com.vertxmidia.crm.modules.admin.dto.AdminCleanupRequest;
import br.com.vertxmidia.crm.modules.admin.dto.AdminCleanupResponse;
import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCleanupService {

    public static final String REQUIRED_CONFIRMATION = "LIMPAR_DADOS_DO_CRM";

    private static final List<String> OPERATIONAL_TABLES = List.of(
            "crm_tasks",
            "crm_events",
            "crm_commission_sales",
            "crm_finance_entries",
            "crm_contract_service_items",
            "crm_deliveries",
            "crm_projects",
            "crm_client_dashboards",
            "crm_client_performance",
            "crm_contracts",
            "crm_lead_stage_history",
            "crm_clients",
            "crm_leads",
            "crm_goals",
            "uploaded_documents",
            "audit_logs"
    );

    private static final List<String> BUSINESS_TABLES = List.of(
            "crm_service_task_templates",
            "crm_service_offerings",
            "crm_team_members"
    );

    private final JdbcTemplate jdbcTemplate;
    private final Environment environment;
    private final AuditService auditService;

    public AdminCleanupService(JdbcTemplate jdbcTemplate, Environment environment, AuditService auditService) {
        this.jdbcTemplate = jdbcTemplate;
        this.environment = environment;
        this.auditService = auditService;
    }

    @Transactional
    public AdminCleanupResponse cleanup(AdminCleanupRequest request) {
        validateConfirmation(request.confirmation());
        validateMode(request.mode());
        validateEnvironment();

        Map<String, Integer> deletedRows = new LinkedHashMap<>();
        OPERATIONAL_TABLES.forEach(table -> deleteFrom(table, deletedRows));

        if (request.mode() == AdminCleanupMode.BUSINESS) {
            BUSINESS_TABLES.forEach(table -> deleteFrom(table, deletedRows));
        }

        auditService.log("ADMIN_CLEANUP_" + request.mode().name(), "AdminCleanup", null);

        return new AdminCleanupResponse(
                request.mode(),
                "Limpeza concluida com sucesso. Usuario admin, permissoes, configuracoes essenciais e estrutura do banco foram preservados.",
                deletedRows,
                Instant.now()
        );
    }

    private void validateConfirmation(String confirmation) {
        if (!REQUIRED_CONFIRMATION.equals(String.valueOf(confirmation).trim())) {
            throw new IllegalArgumentException("Confirmacao invalida. Digite LIMPAR_DADOS_DO_CRM para executar a limpeza.");
        }
    }

    private void validateMode(AdminCleanupMode mode) {
        if (mode == AdminCleanupMode.RESET_DEMO) {
            throw new IllegalArgumentException("Reset demo ainda nao esta habilitado. Use limpeza operacional ou limpeza de negocio.");
        }
    }

    private void validateEnvironment() {
        if (!isProductionLike()) {
            return;
        }

        boolean enabled = booleanProperty("ENABLE_ADMIN_CLEANUP")
                || booleanProperty("crm.admin.cleanup.enabled");

        if (!enabled) {
            throw new IllegalStateException("Acao bloqueada em ambiente de producao. Configure ENABLE_ADMIN_CLEANUP=true apenas apos backup confirmado.");
        }
    }

    private boolean isProductionLike() {
        String appEnv = String.valueOf(environment.getProperty("APP_ENV", "")).trim().toLowerCase(Locale.ROOT);
        String springEnv = String.valueOf(environment.getProperty("spring.profiles.active", "")).trim().toLowerCase(Locale.ROOT);
        boolean activeProfileProduction = Arrays.stream(environment.getActiveProfiles())
                .map(profile -> profile.toLowerCase(Locale.ROOT))
                .anyMatch(profile -> profile.equals("prod") || profile.equals("production"));

        return activeProfileProduction
                || appEnv.equals("prod")
                || appEnv.equals("production")
                || springEnv.contains("prod")
                || springEnv.contains("production");
    }

    private boolean booleanProperty(String name) {
        return Boolean.parseBoolean(String.valueOf(environment.getProperty(name, "false")));
    }

    private void deleteFrom(String table, Map<String, Integer> deletedRows) {
        deletedRows.put(table, jdbcTemplate.update("delete from " + table));
    }
}
