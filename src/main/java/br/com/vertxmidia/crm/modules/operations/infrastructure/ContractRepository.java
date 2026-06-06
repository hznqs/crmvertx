package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.dto.ChurnReasonResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ContractRepository extends JpaRepository<Contract, UUID>, JpaSpecificationExecutor<Contract> {
    long countByStatus(String status);

    long countByStatusAndActiveTrue(String status);

    long countByStatusAndEndDateBetween(String status, LocalDate start, LocalDate end);

    long countByStatusAndEndDateBetweenAndActiveTrue(String status, LocalDate start, LocalDate end);

    long countByAutoRenewTrue();

    long countByAutoRenewTrueAndActiveTrue();

    java.util.List<Contract> findByStatusAndActiveTrue(String status);

    boolean existsByClientIdAndActiveTrueAndStatusIn(UUID clientId, Collection<String> statuses);

    boolean existsByClientIdAndActiveTrue(UUID clientId);

    @Query("select coalesce(sum(c.monthlyValue), 0) from Contract c where c.status = :status and c.active = true")
    BigDecimal sumMonthlyValueByStatusAndActiveTrue(String status);

    @Query("select coalesce(sum(c.monthlyValue), 0) from Contract c where c.active = true and c.recurring = true and c.status in :statuses and c.startDate <= :date and c.endDate >= :date")
    BigDecimal sumRecurringMrrActiveAt(Collection<String> statuses, LocalDate date);

    @Query("select coalesce(sum(c.monthlyValue), 0) from Contract c where c.clientId = :clientId and c.active = true and c.recurring = true and c.status in :statuses and c.startDate <= :date and c.endDate >= :date")
    BigDecimal sumRecurringMrrByClientActiveAt(UUID clientId, Collection<String> statuses, LocalDate date);

    @Query("select count(c) from Contract c where c.active = true and c.recurring = true and c.status in :statuses and c.startDate <= :date and c.endDate >= :date")
    long countRecurringContractsActiveAt(Collection<String> statuses, LocalDate date);

    @Query("select count(distinct c.clientId) from Contract c where c.active = true and c.recurring = true and c.status in :statuses and c.startDate <= :date and c.endDate >= :date and c.clientId is not null")
    long countRecurringCustomersActiveAt(Collection<String> statuses, LocalDate date);

    @Query("""
            select count(c) from Contract c
            where c.active = true
              and c.recurring = true
              and c.status in :lostStatuses
              and coalesce(c.cancelledAt, c.endedAt) between :start and :end
            """)
    long countLostRecurringContractsBetween(Collection<String> lostStatuses, LocalDate start, LocalDate end);

    @Query("""
            select count(c) from Contract c
            where c.active = true
              and c.recurring = true
              and c.status = 'nao_renovado'
              and coalesce(c.endedAt, c.endDate) between :start and :end
            """)
    long countNonRenewedRecurringContractsBetween(LocalDate start, LocalDate end);

    @Query("""
            select count(distinct c.clientId) from Contract c
            where c.active = true
              and c.recurring = true
              and c.clientId is not null
              and c.status in :lostStatuses
              and coalesce(c.cancelledAt, c.endedAt) between :start and :end
              and not exists (
                    select 1 from Contract activeContract
                    where activeContract.clientId = c.clientId
                      and activeContract.active = true
                      and activeContract.recurring = true
                      and activeContract.status in :activeStatuses
                      and activeContract.startDate <= :end
                      and activeContract.endDate >= :end
              )
            """)
    long countLostRecurringCustomersBetween(Collection<String> lostStatuses, Collection<String> activeStatuses, LocalDate start, LocalDate end);

    @Query("""
            select coalesce(sum(c.mrrLost), 0) from Contract c
            where c.active = true
              and c.recurring = true
              and c.status in :lostStatuses
              and coalesce(c.cancelledAt, c.endedAt) between :start and :end
            """)
    BigDecimal sumMrrLostBetween(Collection<String> lostStatuses, LocalDate start, LocalDate end);

    @Query("""
            select new br.com.vertxmidia.crm.modules.operations.dto.ChurnReasonResponse(coalesce(c.churnReason, c.cancellationReason, c.nonRenewalReason, 'Sem motivo informado'), count(c))
            from Contract c
            where c.active = true
              and c.recurring = true
              and c.status in :lostStatuses
              and coalesce(c.cancelledAt, c.endedAt) between :start and :end
            group by coalesce(c.churnReason, c.cancellationReason, c.nonRenewalReason, 'Sem motivo informado')
            order by count(c) desc
            """)
    List<ChurnReasonResponse> countChurnReasonsBetween(Collection<String> lostStatuses, LocalDate start, LocalDate end);

    @Query("select new br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString(c.plan, count(c)) from Contract c where c.active = true and c.startDate >= :start and c.startDate <= :end group by c.plan order by count(c) desc")
    java.util.List<br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString> countTopPlansBetween(LocalDate start, LocalDate end);

    @Query("select new br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString(item.serviceNameSnapshot, count(item)) from ContractServiceItem item join Contract c on c.id = item.contractId where item.active = true and c.active = true and c.startDate >= :start and c.startDate <= :end group by item.serviceNameSnapshot order by count(item) desc")
    java.util.List<br.com.vertxmidia.crm.modules.dashboard.dto.ChartPointString> countTopServicesBetween(LocalDate start, LocalDate end);
}
