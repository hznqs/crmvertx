package br.com.vertxmidia.crm.modules.organization.infrastructure;

import br.com.vertxmidia.crm.modules.organization.domain.Organization;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
}
