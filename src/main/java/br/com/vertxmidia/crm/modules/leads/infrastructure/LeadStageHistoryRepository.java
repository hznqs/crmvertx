package br.com.vertxmidia.crm.modules.leads.infrastructure;

import br.com.vertxmidia.crm.modules.leads.domain.LeadStageHistory;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeadStageHistoryRepository extends JpaRepository<LeadStageHistory, UUID> {

    List<LeadStageHistory> findTop50ByLeadIdOrderByCreatedAtDesc(UUID leadId);
}
