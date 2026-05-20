package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID>, JpaSpecificationExecutor<TeamMember> {
}
