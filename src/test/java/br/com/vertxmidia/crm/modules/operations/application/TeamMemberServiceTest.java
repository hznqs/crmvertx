package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.infrastructure.TeamMemberRepository;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TeamMemberServiceTest {

    @Test
    void summaryCalculatesProductivityAndRoleCounts() {
        TeamMemberRepository repository = mock(TeamMemberRepository.class);
        when(repository.countByFilters("dev", "ana")).thenReturn(3L);
        when(repository.sumTasksByFilters("dev", "ana")).thenReturn(40L);
        when(repository.sumCompletedByFilters("dev", "ana")).thenReturn(30L);
        when(repository.countByRoleAndActiveTrue("marketing")).thenReturn(2L);
        when(repository.countByRoleAndActiveTrue("trafego")).thenReturn(4L);
        when(repository.countByRoleAndActiveTrue("sdr")).thenReturn(5L);
        when(repository.countByRoleAndActiveTrue("closer")).thenReturn(6L);
        when(repository.countByRoleAndActiveTrue("dev")).thenReturn(7L);

        TeamMemberService service = new TeamMemberService(repository, mock(AuditService.class));

        var summary = service.summary(" dev ", " ana ");

        assertThat(summary.total()).isEqualTo(3);
        assertThat(summary.tasks()).isEqualTo(40);
        assertThat(summary.completed()).isEqualTo(30);
        assertThat(summary.productivity()).isEqualTo(75);
        assertThat(summary.marketing()).isEqualTo(2);
        assertThat(summary.traffic()).isEqualTo(4);
        assertThat(summary.sdr()).isEqualTo(5);
        assertThat(summary.closer()).isEqualTo(6);
        assertThat(summary.developer()).isEqualTo(7);
    }
}
