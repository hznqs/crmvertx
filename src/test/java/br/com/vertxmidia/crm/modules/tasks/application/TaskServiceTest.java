package br.com.vertxmidia.crm.modules.tasks.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceTaskTemplateRepository;
import br.com.vertxmidia.crm.modules.tasks.domain.Task;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import br.com.vertxmidia.crm.modules.tasks.infrastructure.TaskRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TaskServiceTest {

    @Test
    void syncProjectTasksCreatesChecklistTasksLinkedToDeliveries() {
        TaskRepository repository = mock(TaskRepository.class);
        Project project = project(ProjectStatus.EM_EXECUCAO);
        ServiceOffering service = serviceOffering();
        DeliveryResponse delivery = deliveryResponse(project);

        when(repository.findByProjectIdAndActiveTrue(project.getId())).thenReturn(List.of());
        when(repository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            ReflectionTestUtils.setField(task, "id", UUID.randomUUID());
            ReflectionTestUtils.setField(task, "createdAt", Instant.now());
            ReflectionTestUtils.setField(task, "updatedAt", Instant.now());
            return task;
        });

        TaskService serviceLayer = taskService(repository);

        var responses = serviceLayer.syncProjectTasks(project, List.of(delivery), Optional.of(service));

        assertThat(responses).hasSize(2);
        assertThat(responses).extracting("title").containsExactly("Configurar pipeline", "Validar dashboard");
        assertThat(responses).extracting("status").containsOnly(TaskStatus.EM_ANDAMENTO);
        assertThat(responses.get(0).deliveryId()).isEqualTo(delivery.id());
        assertThat(responses.get(0).responsibleUserId()).isEqualTo(project.getResponsibleUserId());
    }

    @Test
    void syncProjectTasksCancelsOpenTasksWhenProjectIsCanceled() {
        TaskRepository repository = mock(TaskRepository.class);
        Project project = project(ProjectStatus.CANCELADO);
        Task task = task(project);

        when(repository.findByProjectIdAndActiveTrue(project.getId())).thenReturn(List.of(task));
        when(repository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskService serviceLayer = taskService(repository);

        var responses = serviceLayer.syncProjectTasks(project, List.of(), Optional.empty());

        assertThat(responses).isEmpty();
        assertThat(task.getStatus()).isEqualTo(TaskStatus.CANCELADA);
        assertThat(task.isActive()).isFalse();
        verify(repository).save(task);
    }

    private TaskService taskService(TaskRepository repository) {
        return new TaskService(
                repository,
                mock(ClientRepository.class),
                mock(ProjectRepository.class),
                mock(ContractRepository.class),
                mock(ServiceOfferingRepository.class),
                mock(ServiceTaskTemplateRepository.class),
                mock(DeliveryRepository.class),
                new TaskMapper(),
                mock(AuditService.class)
        );
    }

    private Project project(ProjectStatus status) {
        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", UUID.randomUUID());
        project.setClientId(UUID.randomUUID());
        project.setContractId(UUID.randomUUID());
        project.setServiceId(UUID.randomUUID());
        project.setName("CRM Premium");
        project.setStatus(status);
        project.setResponsibleUserId(UUID.randomUUID());
        project.setProgress(30);
        project.setSlaDueDate(LocalDate.now().plusDays(10));
        project.setBudget(new BigDecimal("15000.00"));
        project.setEstimatedCost(new BigDecimal("9000.00"));
        project.setActualCost(BigDecimal.ZERO);
        project.setActive(status != ProjectStatus.CANCELADO);
        return project;
    }

    private ServiceOffering serviceOffering() {
        ServiceOffering service = new ServiceOffering();
        ReflectionTestUtils.setField(service, "id", UUID.randomUUID());
        service.setName("CRM Premium");
        service.setDefaultChecklist("Configurar pipeline\nValidar dashboard");
        service.setActive(true);
        return service;
    }

    private DeliveryResponse deliveryResponse(Project project) {
        return new DeliveryResponse(
                UUID.randomUUID(),
                project.getClientId(),
                project.getId(),
                project.getContractId(),
                project.getServiceId(),
                "producao",
                "Producao - CRM Premium",
                "Entrega automatica",
                "Operacional",
                LocalDate.now().plusDays(5),
                "producao",
                "MEDIA",
                30,
                null,
                null,
                null,
                true,
                Instant.now(),
                Instant.now()
        );
    }

    private Task task(Project project) {
        Task task = new Task();
        ReflectionTestUtils.setField(task, "id", UUID.randomUUID());
        task.setProjectId(project.getId());
        task.setTitle("Configurar pipeline");
        task.setDescription("Tarefa antiga");
        task.setDueDate(LocalDate.now().plusDays(2));
        task.setStatus(TaskStatus.EM_ANDAMENTO);
        task.setActive(true);
        return task;
    }
}
