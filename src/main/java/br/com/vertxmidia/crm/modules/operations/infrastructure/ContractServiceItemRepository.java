package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.ContractServiceItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ContractServiceItemRepository extends JpaRepository<ContractServiceItem, UUID> {

    List<ContractServiceItem> findByContractIdAndActiveTrueOrderByCreatedAtAsc(UUID contractId);

    @Modifying
    @Query("update ContractServiceItem item set item.active = false where item.contractId = :contractId and item.active = true")
    void deactivateByContractId(UUID contractId);
}
