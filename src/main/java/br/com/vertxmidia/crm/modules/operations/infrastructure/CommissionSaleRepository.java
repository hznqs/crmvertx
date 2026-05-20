package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CommissionSaleRepository extends JpaRepository<CommissionSale, UUID>, JpaSpecificationExecutor<CommissionSale> {
    @Query("""
            select coalesce(sum(s.value), 0)
            from CommissionSale s
            where :memberId is null or s.memberId = :memberId
            """)
    BigDecimal totalRevenue(UUID memberId);

    @Query("""
            select coalesce(sum(s.value * s.percent / 100), 0)
            from CommissionSale s
            where :memberId is null or s.memberId = :memberId
            """)
    BigDecimal totalCommission(UUID memberId);

    @Query("""
            select count(s)
            from CommissionSale s
            where :memberId is null or s.memberId = :memberId
            """)
    long countByMemberFilter(UUID memberId);

    @Query("""
            select s.memberId,
                   count(s),
                   coalesce(sum(s.value), 0),
                   coalesce(sum(s.value * s.percent / 100), 0),
                   coalesce(max(s.goal), 0)
            from CommissionSale s
            group by s.memberId
            """)
    List<Object[]> memberStats();
}
