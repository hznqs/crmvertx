package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CommissionSaleRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.TeamMemberRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CommissionSaleServiceTest {

    @Test
    void metricsUsesRepositoryAggregates() {
        CommissionSaleRepository sales = mock(CommissionSaleRepository.class);
        TeamMemberRepository members = mock(TeamMemberRepository.class);
        UUID memberId = UUID.randomUUID();

        when(sales.countByMemberFilter(memberId)).thenReturn(4L);
        when(sales.totalRevenue(memberId)).thenReturn(new BigDecimal("12000.00"));
        when(sales.totalCommission(memberId)).thenReturn(new BigDecimal("1800.00"));

        CommissionSaleService service = new CommissionSaleService(sales, members, mock(AuditService.class));

        var metrics = service.metrics(memberId);

        assertThat(metrics.totalSales()).isEqualTo(4);
        assertThat(metrics.totalRevenue()).isEqualByComparingTo("12000.00");
        assertThat(metrics.totalCommission()).isEqualByComparingTo("1800.00");
    }

    @Test
    void rankingCombinesTeamProductivityWithCommissionAggregates() {
        CommissionSaleRepository sales = mock(CommissionSaleRepository.class);
        TeamMemberRepository members = mock(TeamMemberRepository.class);
        UUID closerId = UUID.randomUUID();
        UUID sdrId = UUID.randomUUID();
        UUID marketingId = UUID.randomUUID();

        TeamMember closer = member(closerId, "Ana Closer", "closer", 20, 15, 90);
        TeamMember sdr = member(sdrId, "Bia SDR", "sdr", 10, 4, 50);
        TeamMember marketing = member(marketingId, "Caio Marketing", "marketing", 8, 8, 75);

        when(members.findAll(any(Sort.class))).thenReturn(List.of(marketing, sdr, closer));
        when(sales.memberStats()).thenReturn(List.of(
                new Object[] { closerId, 8L, new BigDecimal("40000.00"), new BigDecimal("6000.00"), 10 },
                new Object[] { sdrId, 2L, new BigDecimal("5000.00"), new BigDecimal("500.00"), 5 }
        ));

        CommissionSaleService service = new CommissionSaleService(sales, members, mock(AuditService.class));

        var ranking = service.ranking();

        assertThat(ranking.topCloser()).isEqualTo("Ana Closer");
        assertThat(ranking.topSdr()).isEqualTo("Bia SDR");
        assertThat(ranking.topMarketing()).isEqualTo("Caio Marketing");
        assertThat(ranking.averageGoalProgress()).isEqualByComparingTo("60");
        assertThat(ranking.ranking()).extracting("name")
                .containsExactly("Ana Closer", "Caio Marketing", "Bia SDR");

        var closerStats = ranking.ranking().getFirst();
        assertThat(closerStats.sales()).isEqualTo(8);
        assertThat(closerStats.revenue()).isEqualByComparingTo("40000.00");
        assertThat(closerStats.commission()).isEqualByComparingTo("6000.00");
        assertThat(closerStats.goalProgress()).isEqualByComparingTo("80.00");
        assertThat(closerStats.xp()).isEqualTo(5000);
        assertThat(closerStats.level()).isEqualTo(11);
        assertThat(closerStats.badge()).isEqualTo("Elite");
        assertThat(closerStats.productivity()).isEqualTo(75);
    }

    private TeamMember member(UUID id, String name, String role, int tasks, int completed, int performance) {
        TeamMember member = new TeamMember();
        ReflectionTestUtils.setField(member, "id", id);
        member.setName(name);
        member.setRole(role);
        member.setTasks(tasks);
        member.setCompleted(completed);
        member.setPerformance(performance);
        return member;
    }
}
