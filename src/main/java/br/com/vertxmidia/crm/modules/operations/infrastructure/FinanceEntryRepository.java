package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface FinanceEntryRepository extends JpaRepository<FinanceEntry, UUID>, JpaSpecificationExecutor<FinanceEntry> {
    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.status = :status
              and entry.due between :start and :end
            """)
    BigDecimal sumByTypeAndStatusAndDueBetween(String type, String status, LocalDate start, LocalDate end);

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.status = :status
              and entry.recurring = true
            """)
    BigDecimal sumRecurringByTypeAndStatus(String type, String status);
}
