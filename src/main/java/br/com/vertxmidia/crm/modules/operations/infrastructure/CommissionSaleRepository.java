package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CommissionSaleRepository extends JpaRepository<CommissionSale, UUID>, JpaSpecificationExecutor<CommissionSale> {

    Optional<CommissionSale> findFirstByContractIdAndActiveTrue(UUID contractId);

    @Query("""
            select coalesce(sum(s.value), 0)
            from CommissionSale s
            where s.active = true
              and (:memberId is null or s.memberId = :memberId)
            """)
    BigDecimal totalRevenue(UUID memberId);

    @Query("""
            select coalesce(sum(
                case
                    when upper(s.calculationType) = 'FIXA' then s.fixedValue
                    else s.value * s.percent / 100
                end
            ), 0)
            from CommissionSale s
            where s.active = true
              and (:memberId is null or s.memberId = :memberId)
            """)
    BigDecimal totalCommission(UUID memberId);

    @Query("""
            select count(s)
            from CommissionSale s
            where s.active = true
              and (:memberId is null or s.memberId = :memberId)
            """)
    long countByMemberFilter(UUID memberId);

    @Query("""
            select s.memberId,
                   count(s),
                   coalesce(sum(s.value), 0),
                   coalesce(sum(
                       case
                           when upper(s.calculationType) = 'FIXA' then s.fixedValue
                           else s.value * s.percent / 100
                       end
                   ), 0),
                   coalesce(max(s.goal), 0)
            from CommissionSale s
            where s.active = true
            group by s.memberId
            """)
    List<Object[]> memberStats();

    @Query("""
            select coalesce(sum(
                case
                    when upper(c.calculationType) = 'FIXA' then c.fixedValue
                    else c.value * c.percent / 100
                end
            ), 0)
            from CommissionSale c
            where c.active = true
              and c.status = 'PAGA'
              and c.paidAt >= :start
              and c.paidAt <= :end
            """)
    BigDecimal sumPaidCommissionsBetween(java.time.Instant start, java.time.Instant end);
}
