package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Goal;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CommissionSaleRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.GoalRepository;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import br.com.vertxmidia.crm.modules.tasks.infrastructure.TaskRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GoalServiceTest {

    @Test
    void findByIdReturnsCalculatedActualWithoutMutatingEntity() {
        UUID id = UUID.randomUUID();
        Goal goal = new Goal();
        goal.setType("FATURAMENTO");
        goal.setTarget(new BigDecimal("1000.00"));
        goal.setActual(new BigDecimal("100.00"));
        goal.setDate(LocalDate.of(2026, 5, 1));
        goal.setPeriodStart(LocalDate.of(2026, 5, 1));
        goal.setPeriodEnd(LocalDate.of(2026, 5, 31));

        GoalRepository goals = mock(GoalRepository.class);
        FinanceEntryRepository financeEntries = mock(FinanceEntryRepository.class);
        when(goals.findById(id)).thenReturn(Optional.of(goal));
        when(financeEntries.sumByTypeAndStatusAndPeriod("receita", "pago", goal.getPeriodStart(), goal.getPeriodEnd()))
                .thenReturn(new BigDecimal("625.00"));

        GoalService service = new GoalService(
                goals,
                mock(AuditService.class),
                financeEntries,
                mock(LeadRepository.class),
                mock(TaskRepository.class),
                mock(ProjectRepository.class),
                mock(CommissionSaleRepository.class)
        );

        var response = service.findById(id);

        assertThat(response.actual()).isEqualByComparingTo("625.00");
        assertThat(response.progress()).isEqualByComparingTo("62.50");
        assertThat(goal.getActual()).isEqualByComparingTo("100.00");
    }

    @Test
    void projectAndTaskGoalsUseCurrentDomainStatuses() {
        UUID taskGoalId = UUID.randomUUID();
        UUID projectGoalId = UUID.randomUUID();
        Goal taskGoal = goal("TAREFAS");
        Goal projectGoal = goal("PROJETOS");

        GoalRepository goals = mock(GoalRepository.class);
        TaskRepository tasks = mock(TaskRepository.class);
        ProjectRepository projects = mock(ProjectRepository.class);
        when(goals.findById(taskGoalId)).thenReturn(Optional.of(taskGoal));
        when(goals.findById(projectGoalId)).thenReturn(Optional.of(projectGoal));
        when(tasks.countByStatusAndUpdatedAtBetweenAndActiveTrue(
                org.mockito.ArgumentMatchers.eq(TaskStatus.CONCLUIDA),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any()
        )).thenReturn(7L);
        when(projects.countByStatusAndUpdatedAtBetweenAndActiveTrue(
                org.mockito.ArgumentMatchers.eq(ProjectStatus.FINALIZADO),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any()
        )).thenReturn(3L);

        GoalService service = new GoalService(
                goals,
                mock(AuditService.class),
                mock(FinanceEntryRepository.class),
                mock(LeadRepository.class),
                tasks,
                projects,
                mock(CommissionSaleRepository.class)
        );

        assertThat(service.findById(taskGoalId).actual()).isEqualByComparingTo("7");
        assertThat(service.findById(projectGoalId).actual()).isEqualByComparingTo("3");
        verify(tasks).countByStatusAndUpdatedAtBetweenAndActiveTrue(
                org.mockito.ArgumentMatchers.eq(TaskStatus.CONCLUIDA),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any()
        );
        verify(projects).countByStatusAndUpdatedAtBetweenAndActiveTrue(
                org.mockito.ArgumentMatchers.eq(ProjectStatus.FINALIZADO),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any()
        );
    }

    @Test
    void dynamicCalculationFailureFallsBackToPersistedActual() {
        UUID id = UUID.randomUUID();
        Goal goal = goal("FATURAMENTO");
        goal.setActual(new BigDecimal("4.00"));

        GoalRepository goals = mock(GoalRepository.class);
        FinanceEntryRepository financeEntries = mock(FinanceEntryRepository.class);
        when(goals.findById(id)).thenReturn(Optional.of(goal));
        when(financeEntries.sumByTypeAndStatusAndPeriod("receita", "pago", goal.getPeriodStart(), goal.getPeriodEnd()))
                .thenThrow(new RuntimeException("aggregate unavailable"));

        GoalService service = new GoalService(
                goals,
                mock(AuditService.class),
                financeEntries,
                mock(LeadRepository.class),
                mock(TaskRepository.class),
                mock(ProjectRepository.class),
                mock(CommissionSaleRepository.class)
        );

        var response = service.findById(id);

        assertThat(response.actual()).isEqualByComparingTo("4.00");
        assertThat(response.progress()).isEqualByComparingTo("40.00");
    }

    private Goal goal(String type) {
        Goal goal = new Goal();
        goal.setType(type);
        goal.setTarget(new BigDecimal("10.00"));
        goal.setActual(BigDecimal.ZERO);
        goal.setDate(LocalDate.of(2026, 5, 1));
        goal.setPeriodStart(LocalDate.of(2026, 5, 1));
        goal.setPeriodEnd(LocalDate.of(2026, 5, 31));
        return goal;
    }
}
