package br.com.vertxmidia.crm.modules.settings.infrastructure;

import br.com.vertxmidia.crm.modules.settings.domain.CrmSettings;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrmSettingsRepository extends JpaRepository<CrmSettings, UUID> {
}
