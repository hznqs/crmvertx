package br.com.vertxmidia.crm.modules.projects.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.application.DeliveryService;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import br.com.vertxmidia.crm.modules.tasks.application.TaskService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProjectServiceTest {

    @Test
    void syncContractProjectCreatesProjectFromActiveContractAndService() {
        ProjectRepository projects = mock(ProjectRepository.class);
        ServiceOfferingRepository services = mock(ServiceOfferingRepository.class);
        Contract contract = activeContract();
        ServiceOffering serviceOffering = serviceOffering(contract.getServiceId());
        UUID projectId = UUID.randomUUID();

        when(projects.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.empty());
        when(services.findByIdAndActiveTrue(contract.getServiceId())).thenReturn(Optional.of(serviceOffering));
        when(projects.save(any(Project.class))).thenAnswer(invocation -> {
            Project project = invocation.getArgument(0);
            ReflectionTestUtils.setField(project, "id", projectId);
            ReflectionTestUtils.setField(project, "createdAt", Instant.now());
            ReflectionTestUtils.setField(project, "updatedAt", Instant.now());
            return project;
        });

        ProjectService projectService = newProjectService(projects, services);

        var response = projectService.syncContractProject(contract).orElseThrow();

        assertThat(response.id()).isEqualTo(projectId);
        assertThat(response.clientId()).isEqualTo(contract.getClientId());
        assertThat(response.contractId()).isEqualTo(contract.getId());
        assertThat(response.serviceId()).isEqualTo(contract.getServiceId());
        assertThat(response.name()).isEqualTo("CRM Premium - Mensalidade CRM");
        assertThat(response.status()).isEqualTo(ProjectStatus.PLANEJAMENTO);
        assertThat(response.progress()).isZero();
        assertThat(response.slaDueDate()).isEqualTo(LocalDate.of(2026, 5, 15));
        assertThat(response.budget()).isEqualByComparingTo("15000.00");
        assertThat(response.estimatedCost()).isEqualByComparingTo("9000.0000");
        assertThat(response.actualCost()).isEqualByComparingTo("0");
        assertThat(response.description()).contains("Briefing", "Checklist padrao");
        assertThat(response.active()).isTrue();
    }

    @Test
    void syncContractProjectUpdatesExistingProjectWithoutLosingOperationalOwnership() {
        ProjectRepository projects = mock(ProjectRepository.class);
        ServiceOfferingRepository services = mock(ServiceOfferingRepository.class);
        Contract contract = activeContract();
        ServiceOffering serviceOffering = serviceOffering(contract.getServiceId());
        Project currentProject = currentProject(contract);

        when(projects.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.of(currentProject));
        when(services.findByIdAndActiveTrue(contract.getServiceId())).thenReturn(Optional.of(serviceOffering));
        when(projects.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectService projectService = newProjectService(projects, services);

        var response = projectService.syncContractProject(contract).orElseThrow();

        assertThat(response.id()).isEqualTo(currentProject.getId());
        assertThat(response.responsibleUserId()).isEqualTo(currentProject.getResponsibleUserId());
        assertThat(response.teamMemberIds()).isEqualTo(currentProject.getTeamMemberIds());
        assertThat(response.status()).isEqualTo(ProjectStatus.EM_EXECUCAO);
        assertThat(response.progress()).isEqualTo(45);
        assertThat(response.actualCost()).isEqualByComparingTo("700.00");
        assertThat(response.budget()).isEqualByComparingTo("15000.00");
        verify(projects).save(currentProject);
    }

    @Test
    void syncContractProjectCancelsProjectWhenContractStopsGeneratingProjects() {
        ProjectRepository projects = mock(ProjectRepository.class);
        Contract contract = activeContract();
        contract.setStatus("cancelado");
        Project currentProject = currentProject(contract);

        when(projects.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.of(currentProject));
        when(projects.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectService projectService = newProjectService(projects, mock(ServiceOfferingRepository.class));

        var response = projectService.syncContractProject(contract);

        assertThat(response).isEmpty();
        assertThat(currentProject.getStatus()).isEqualTo(ProjectStatus.CANCELADO);
        assertThat(currentProject.isActive()).isFalse();
        verify(projects).save(currentProject);
    }

    private ProjectService newProjectService(ProjectRepository projects, ServiceOfferingRepository services) {
        return new ProjectService(
                projects,
                mock(ClientRepository.class),
                mock(ContractRepository.class),
                services,
                mock(DeliveryService.class),
                mock(TaskService.class),
                new ProjectMapper(),
                mock(AuditService.class)
        );
    }

    private Contract activeContract() {
        Contract contract = new Contract();
        ReflectionTestUtils.setField(contract, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(contract, "createdAt", Instant.now());
        ReflectionTestUtils.setField(contract, "updatedAt", Instant.now());
        contract.setClientId(UUID.randomUUID());
        contract.setServiceId(UUID.randomUUID());
        contract.setPlan("Mensalidade CRM");
        contract.setStartDate(LocalDate.of(2026, 5, 1));
        contract.setEndDate(LocalDate.of(2026, 11, 1));
        contract.setStatus("ativo");
        contract.setAutoRenew(true);
        contract.setMonthlyValue(new BigDecimal("2500.00"));
        contract.setTotalValue(new BigDecimal("15000.00"));
        contract.setDurationMonths(6);
        contract.setBillingDueDay(10);
        contract.setActive(true);
        return contract;
    }

    private ServiceOffering serviceOffering(UUID id) {
        ServiceOffering serviceOffering = new ServiceOffering();
        ReflectionTestUtils.setField(serviceOffering, "id", id);
        ReflectionTestUtils.setField(serviceOffering, "createdAt", Instant.now());
        ReflectionTestUtils.setField(serviceOffering, "updatedAt", Instant.now());
        serviceOffering.setName("CRM Premium");
        serviceOffering.setDescription("Implantacao completa do CRM operacional.");
        serviceOffering.setSlaDays(14);
        serviceOffering.setBasePrice(new BigDecimal("12000.00"));
        serviceOffering.setGrossMarginPercentage(new BigDecimal("40.00"));
        serviceOffering.setDeliveryStages("Briefing\nPlanejamento\nEntrega");
        serviceOffering.setDefaultChecklist("Configurar pipeline\nValidar dashboard");
        serviceOffering.setActive(true);
        return serviceOffering;
    }

    private Project currentProject(Contract contract) {
        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(project, "createdAt", Instant.now());
        ReflectionTestUtils.setField(project, "updatedAt", Instant.now());
        project.setClientId(contract.getClientId());
        project.setContractId(contract.getId());
        project.setServiceId(contract.getServiceId());
        project.setName("Projeto antigo");
        project.setDescription("Descricao antiga");
        project.setStatus(ProjectStatus.EM_EXECUCAO);
        project.setResponsibleUserId(UUID.randomUUID());
        project.setTeamMemberIds(UUID.randomUUID() + "," + UUID.randomUUID());
        project.setProgress(45);
        project.setSlaDueDate(LocalDate.of(2026, 5, 20));
        project.setBudget(new BigDecimal("8000.00"));
        project.setEstimatedCost(new BigDecimal("4000.00"));
        project.setActualCost(new BigDecimal("700.00"));
        project.setActive(true);
        return project;
    }
}
