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
        settings.setCompanyName(request.companyName().trim());
        settings.setCompanyEmail(blankToNull(request.companyEmail()));
        settings.setCompanyPhone(blankToNull(request.companyPhone()));
        settings.setDefaultRevenueGoal(request.defaultRevenueGoal() == null ? BigDecimal.ZERO : request.defaultRevenueGoal());
        settings.setDefaultProfitMargin(request.defaultProfitMargin() == null ? BigDecimal.ZERO : request.defaultProfitMargin());
        settings.setPreferences(blankToNull(request.preferences()));
        CrmSettings saved = repository.save(settings);
        auditService.log("UPDATE_SETTINGS", "Configuracoes", saved.getId());
        return CrmSettingsResponse.from(saved);
    }

    private CrmSettings current() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            CrmSettings settings = new CrmSettings();
            settings.setCompanyName("VertX Midia");
            return repository.save(settings);
        });
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
