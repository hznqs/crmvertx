package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.ClientPerformance;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ClientPerformanceRepository extends JpaRepository<ClientPerformance, UUID>, JpaSpecificationExecutor<ClientPerformance> {
    @Query("""
            select coalesce(sum(record.leads), 0)
            from ClientPerformance record
            where record.active = true
              and record.date between :start and :end
            """)
    long sumLeadsBetween(LocalDate start, LocalDate end);

    @Query("""
            select coalesce(sum(record.sales), 0)
            from ClientPerformance record
            where record.active = true
              and record.date between :start and :end
            """)
    long sumSalesBetween(LocalDate start, LocalDate end);

    @Query("""
            select coalesce(sum(record.revenue), 0)
            from ClientPerformance record
            where record.active = true
              and record.date between :start and :end
            """)
    BigDecimal sumRevenueBetween(LocalDate start, LocalDate end);

    @Query("""
            select coalesce(sum(record.investment), 0)
            from ClientPerformance record
            where record.active = true
              and record.date between :start and :end
            """)
    BigDecimal sumInvestmentBetween(LocalDate start, LocalDate end);
}
