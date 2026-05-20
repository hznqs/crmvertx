package br.com.vertxmidia.crm.modules.settings.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.settings.domain.CrmSettings;
import br.com.vertxmidia.crm.modules.settings.dto.CrmSettingsRequest;
import br.com.vertxmidia.crm.modules.settings.dto.CrmSettingsResponse;
import br.com.vertxmidia.crm.modules.settings.infrastructure.CrmSettingsRepository;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CrmSettingsService {

    private final CrmSettingsRepository repository;
    private final AuditService auditService;

    public CrmSettingsService(CrmSettingsRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional
    public CrmSettingsResponse get() {
        return CrmSettingsResponse.from(current());
    }

    @Transactional
    public CrmSettingsResponse save(CrmSettingsRequest request) {
        CrmSettings settings = current();
        auditSettingsChanges(settings, request);
        settings.setCompanyName(request.companyName().trim());
        settings.setCompanyEmail(blankToNull(request.companyEmail()));
        settings.setCompanyPhone(blankToNull(request.companyPhone()));
        settings.setCompanyDocument(blankToNull(request.companyDocument()));
        settings.setCompanyWebsite(blankToNull(request.companyWebsite()));
        settings.setCompanyAddress(blankToNull(request.companyAddress()));
        settings.setDefaultRevenueGoal(request.defaultRevenueGoal() == null ? BigDecimal.ZERO : request.defaultRevenueGoal());
        settings.setDefaultProfitMargin(request.defaultProfitMargin() == null ? BigDecimal.ZERO : request.defaultProfitMargin());
        settings.setDefaultCurrency(defaultString(request.defaultCurrency(), "BRL"));
        settings.setDefaultTimezone(defaultString(request.defaultTimezone(), "America/Sao_Paulo"));
        settings.setDefaultTaxRate(request.defaultTaxRate() == null ? BigDecimal.ZERO : request.defaultTaxRate());
        settings.setDefaultCommissionRate(request.defaultCommissionRate() == null ? BigDecimal.ZERO : request.defaultCommissionRate());
        settings.setAgencyRevenueGoal(nonNullMoney(request.agencyRevenueGoal()));
        settings.setAgencyNewClientsGoal(nonNullInteger(request.agencyNewClientsGoal()));
        settings.setAgencyAverageTicketGoal(nonNullMoney(request.agencyAverageTicketGoal()));
        settings.setAgencyRetentionGoal(nonNullMoney(request.agencyRetentionGoal()));
        settings.setAgencyProposalsGoal(nonNullInteger(request.agencyProposalsGoal()));
        settings.setAgencyMeetingsGoal(nonNullInteger(request.agencyMeetingsGoal()));
        settings.setPreferences(blankToNull(request.preferences()));
        settings.setCrmRules(blankToNull(request.crmRules()));
        CrmSettings saved = repository.save(settings);
        auditService.log("UPDATE_SETTINGS", "Configuracoes", saved.getId());
        return CrmSettingsResponse.from(saved);
    }

    private CrmSettings current() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            CrmSettings settings = new CrmSettings();
            settings.setCompanyName("VertX Midia");
            settings.setDefaultCurrency("BRL");
            settings.setDefaultTimezone("America/Sao_Paulo");
            return repository.save(settings);
        });
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private BigDecimal nonNullMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Integer nonNullInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private void auditSettingsChanges(CrmSettings settings, CrmSettingsRequest request) {
        auditService.logChange("Configuracoes", settings.getId(), "companyName", settings.getCompanyName(), request.companyName().trim());
        auditService.logChange("Configuracoes", settings.getId(), "companyEmail", settings.getCompanyEmail(), blankToNull(request.companyEmail()));
        auditService.logChange("Configuracoes", settings.getId(), "companyPhone", settings.getCompanyPhone(), blankToNull(request.companyPhone()));
        auditService.logChange("Configuracoes", settings.getId(), "companyDocument", settings.getCompanyDocument(), blankToNull(request.companyDocument()));
        auditService.logChange("Configuracoes", settings.getId(), "companyWebsite", settings.getCompanyWebsite(), blankToNull(request.companyWebsite()));
        auditService.logChange("Configuracoes", settings.getId(), "companyAddress", settings.getCompanyAddress(), blankToNull(request.companyAddress()));
        auditService.logChange("Configuracoes", settings.getId(), "defaultRevenueGoal", settings.getDefaultRevenueGoal(), request.defaultRevenueGoal() == null ? BigDecimal.ZERO : request.defaultRevenueGoal());
        auditService.logChange("Configuracoes", settings.getId(), "defaultProfitMargin", settings.getDefaultProfitMargin(), request.defaultProfitMargin() == null ? BigDecimal.ZERO : request.defaultProfitMargin());
        auditService.logChange("Configuracoes", settings.getId(), "defaultCurrency", settings.getDefaultCurrency(), defaultString(request.defaultCurrency(), "BRL"));
        auditService.logChange("Configuracoes", settings.getId(), "defaultTimezone", settings.getDefaultTimezone(), defaultString(request.defaultTimezone(), "America/Sao_Paulo"));
        auditService.logChange("Configuracoes", settings.getId(), "defaultTaxRate", settings.getDefaultTaxRate(), request.defaultTaxRate() == null ? BigDecimal.ZERO : request.defaultTaxRate());
        auditService.logChange("Configuracoes", settings.getId(), "defaultCommissionRate", settings.getDefaultCommissionRate(), request.defaultCommissionRate() == null ? BigDecimal.ZERO : request.defaultCommissionRate());
        auditService.logChange("Configuracoes", settings.getId(), "agencyRevenueGoal", settings.getAgencyRevenueGoal(), nonNullMoney(request.agencyRevenueGoal()));
        auditService.logChange("Configuracoes", settings.getId(), "agencyNewClientsGoal", settings.getAgencyNewClientsGoal(), nonNullInteger(request.agencyNewClientsGoal()));
        auditService.logChange("Configuracoes", settings.getId(), "agencyAverageTicketGoal", settings.getAgencyAverageTicketGoal(), nonNullMoney(request.agencyAverageTicketGoal()));
        auditService.logChange("Configuracoes", settings.getId(), "agencyRetentionGoal", settings.getAgencyRetentionGoal(), nonNullMoney(request.agencyRetentionGoal()));
        auditService.logChange("Configuracoes", settings.getId(), "agencyProposalsGoal", settings.getAgencyProposalsGoal(), nonNullInteger(request.agencyProposalsGoal()));
        auditService.logChange("Configuracoes", settings.getId(), "agencyMeetingsGoal", settings.getAgencyMeetingsGoal(), nonNullInteger(request.agencyMeetingsGoal()));
        auditService.logChange("Configuracoes", settings.getId(), "preferences", settings.getPreferences(), blankToNull(request.preferences()));
        auditService.logChange("Configuracoes", settings.getId(), "crmRules", settings.getCrmRules(), blankToNull(request.crmRules()));
    }
}
