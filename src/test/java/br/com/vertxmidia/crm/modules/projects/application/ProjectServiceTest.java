package br.com.vertxmidia.crm.modules.projects.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.application.DeliveryService;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.ContractServiceItem;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractServiceItemRepository;
import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import br.com.vertxmidia.crm.modules.tasks.application.TaskService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProjectServiceTest {

    @Test
    void syncContractProjectDoesNotCreateMissingProjectAutomatically() {
        ProjectRepository projects = mock(ProjectRepository.class);
        Contract contract = activeContract();
        when(projects.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.empty());

        ProjectService projectService = newProjectService(projects, mock(ServiceOfferingRepository.class), mock(ContractServiceItemRepository.class), mock(TaskService.class));

        var response = projectService.syncContractProject(contract);

        assertThat(response).isEmpty();
        verify(projects, never()).save(any(Project.class));
    }

    @Test
    void generateProjectFromContractCreatesProjectAndTasksExplicitly() {
        ProjectRepository projects = mock(ProjectRepository.class);
        ServiceOfferingRepository services = mock(ServiceOfferingRepository.class);
        ContractServiceItemRepository items = mock(ContractServiceItemRepository.class);
        TaskService tasks = mock(TaskService.class);
        Contract contract = activeContract();
        ContractServiceItem item = contractItem(contract);
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

        ProjectService projectService = newProjectService(projects, services, items, tasks);

        var response = projectService.generateProjectFromContract(contract, List.of(item));

        assertThat(response.id()).isEqualTo(projectId);
        assertThat(response.clientId()).isEqualTo(contract.getClientId());
        assertThat(response.contractId()).isEqualTo(contract.getId());
        assertThat(response.serviceId()).isEqualTo(contract.getServiceId());
        assertThat(response.name()).contains("Cliente VX", "CRM Premium");
        assertThat(response.status()).isEqualTo(ProjectStatus.PLANEJAMENTO);
        assertThat(response.progress()).isZero();
        assertThat(response.slaDueDate()).isEqualTo(LocalDate.of(2026, 5, 15));
        assertThat(response.budget()).isEqualByComparingTo("15000.00");
        assertThat(response.estimatedCost()).isEqualByComparingTo("9000.0000");
        assertThat(response.description()).contains("Servicos contratados", "CRM Premium");
        verify(tasks).createContractProjectTasks(any(Project.class), any(Contract.class), any());
    }

    @Test
    void generateProjectFromContractReturnsExistingProjectWithoutDuplicating() {
        ProjectRepository projects = mock(ProjectRepository.class);
        Contract contract = activeContract();
        Project currentProject = currentProject(contract);
        when(projects.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.of(currentProject));

        ProjectService projectService = newProjectService(projects, mock(ServiceOfferingRepository.class), mock(ContractServiceItemRepository.class), mock(TaskService.class));

        var response = projectService.generateProjectFromContract(contract, List.of(contractItem(contract)));

        assertThat(response.id()).isEqualTo(currentProject.getId());
        verify(projects, never()).save(any(Project.class));
    }

    @Test
    void generateProjectFromContractRejectsInactiveContract() {
        Contract contract = activeContract();
        contract.setStatus("cancelado");
        ProjectService projectService = newProjectService(mock(ProjectRepository.class), mock(ServiceOfferingRepository.class), mock(ContractServiceItemRepository.class), mock(TaskService.class));

        assertThatThrownBy(() -> projectService.generateProjectFromContract(contract, List.of(contractItem(contract))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Somente contratos ativos");
    }

    private ProjectService newProjectService(ProjectRepository projects,
                                             ServiceOfferingRepository services,
                                             ContractServiceItemRepository items,
                                             TaskService tasks) {
        ClientRepository clients = mock(ClientRepository.class);
        Client client = new Client();
        client.setName("Cliente VX");
        client.setActive(true);
        when(clients.findByIdAndActiveTrue(any())).thenReturn(Optional.of(client));
        return new ProjectService(
                projects,
                clients,
                mock(ContractRepository.class),
                items,
                services,
                mock(DeliveryService.class),
                tasks,
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

    private ContractServiceItem contractItem(Contract contract) {
        ContractServiceItem item = new ContractServiceItem();
        item.setContractId(contract.getId());
        item.setServiceId(contract.getServiceId());
        item.setServiceNameSnapshot("CRM Premium");
        item.setServiceValueSnapshot(new BigDecimal("2500.00"));
        item.setActive(true);
        return item;
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
        project.setName("Projeto existente");
        project.setStatus(ProjectStatus.EM_EXECUCAO);
        project.setProgress(45);
        project.setSlaDueDate(LocalDate.of(2026, 5, 20));
        project.setBudget(new BigDecimal("8000.00"));
        project.setEstimatedCost(new BigDecimal("4000.00"));
        project.setActualCost(new BigDecimal("700.00"));
        project.setActive(true);
        return project;
    }
}
