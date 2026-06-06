package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

public interface FinanceEntryRepository extends JpaRepository<FinanceEntry, UUID>, JpaSpecificationExecutor<FinanceEntry> {

    Optional<FinanceEntry> findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(UUID contractId, String type);

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.status = :status
              and entry.active = true
              and entry.due between :start and :end
            """)
    BigDecimal sumByTypeAndStatusAndDueBetween(
            @Param("type") String type,
            @Param("status") String status,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.active = true
              and entry.due between :from and :to
            """)
    BigDecimal sumByTypeAndPeriod(
            @Param("type") String type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.status = :status
              and entry.active = true
              and entry.due between :from and :to
            """)
    BigDecimal sumByStatusAndPeriod(
            @Param("status") String status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.status = :status
              and entry.active = true
              and entry.due between :from and :to
            """)
    BigDecimal sumByTypeAndStatusAndPeriod(
            @Param("type") String type,
            @Param("status") String status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.recurring = true
              and entry.active = true
              and entry.due between :from and :to
            """)
    BigDecimal sumRecurringByTypeAndPeriod(
            @Param("type") String type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            select count(entry)
            from FinanceEntry entry
            where entry.autoBilling = true
              and entry.active = true
              and entry.due between :from and :to
            """)
    long countAutoBillingByPeriod(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.status = :status
              and entry.recurring = true
              and entry.active = true
            """)
    BigDecimal sumRecurringByTypeAndStatus(@Param("type") String type, @Param("status") String status);

    @Query("""
            select coalesce(sum(entry.value), 0)
            from FinanceEntry entry
            where entry.type = :type
              and entry.status = :status
              and entry.active = true
              and entry.due = :date
            """)
    BigDecimal sumByTypeAndStatusAndDue(
            @Param("type") String type,
            @Param("status") String status,
            @Param("date") LocalDate date
    );

    @Query("""
            select entry.due as entryDate, coalesce(sum(entry.value), 0) as total
            from FinanceEntry entry
            where entry.type = :type
              and entry.status = :status
              and entry.active = true
              and entry.due between :start and :end
            group by entry.due
            order by entry.due
            """)
    List<Object[]> revenueByDay(
            @Param("type") String type,
            @Param("status") String status,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}
