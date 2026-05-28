package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.Delivery;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DeliveryServiceTest {

    @Test
    void summaryCountsStatusesAndLateDeliveriesWithFilters() {
        DeliveryRepository repository = mock(DeliveryRepository.class);
        UUID clientId = UUID.randomUUID();
        String owner = "ana";

        when(repository.countByStatusAndFilters("pendente", clientId, owner)).thenReturn(4L);
        when(repository.countByStatusAndFilters("producao", clientId, owner)).thenReturn(3L);
        when(repository.countByStatusAndFilters("revisao", clientId, owner)).thenReturn(2L);
        when(repository.countByStatusAndFilters("aprovado", clientId, owner)).thenReturn(8L);
        when(repository.countLateByFilters(eq(LocalDate.now()), eq(clientId), eq(owner))).thenReturn(1L);

        DeliveryService service = new DeliveryService(repository, mock(AuditService.class));

        var summary = service.summary(clientId, " ana ");

        assertThat(summary.pending()).isEqualTo(4);
        assertThat(summary.production()).isEqualTo(3);
        assertThat(summary.review()).isEqualTo(2);
        assertThat(summary.approved()).isEqualTo(8);
        assertThat(summary.late()).isEqualTo(1);
    }

    @Test
    void syncProjectDeliveriesCreatesOperationalDeliveriesFromServiceStages() {
        DeliveryRepository repository = mock(DeliveryRepository.class);
        Project project = project(ProjectStatus.EM_EXECUCAO);
        ServiceOffering service = serviceOffering(project.getServiceId());

        when(repository.findByProjectIdAndActiveTrue(project.getId())).thenReturn(List.of());
        when(repository.save(any(Delivery.class))).thenAnswer(invocation -> {
            Delivery delivery = invocation.getArgument(0);
            ReflectionTestUtils.setField(delivery, "id", UUID.randomUUID());
            ReflectionTestUtils.setField(delivery, "createdAt", Instant.now());
            ReflectionTestUtils.setField(delivery, "updatedAt", Instant.now());
            return delivery;
        });

        DeliveryService serviceLayer = new DeliveryService(repository, mock(AuditService.class));

        var responses = serviceLayer.syncProjectDeliveries(project, Optional.of(service));

        assertThat(responses).hasSize(3);
        assertThat(responses).extracting("type").containsExactly("briefing", "producao", "revisao");
        assertThat(responses).extracting("status").containsOnly("producao");
        assertThat(responses.get(0).projectId()).isEqualTo(project.getId());
        assertThat(responses.get(0).owner()).isEqualTo("Operacional");
    }

    @Test
    void syncProjectDeliveriesCancelsOpenDeliveriesWhenProjectIsCanceled() {
        DeliveryRepository repository = mock(DeliveryRepository.class);
        Project project = project(ProjectStatus.CANCELADO);
        Delivery delivery = delivery(project);

        when(repository.findByProjectIdAndActiveTrue(project.getId())).thenReturn(List.of(delivery));
        when(repository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DeliveryService serviceLayer = new DeliveryService(repository, mock(AuditService.class));

        var responses = serviceLayer.syncProjectDeliveries(project, Optional.empty());

        assertThat(responses).isEmpty();
        assertThat(delivery.isActive()).isFalse();
        verify(repository).save(delivery);
    }

    private Project project(ProjectStatus status) {
        Project project = new Project();
        ReflectionTestUtils.setField(project, "id", UUID.randomUUID());
        project.setClientId(UUID.randomUUID());
        project.setContractId(UUID.randomUUID());
        project.setServiceId(UUID.randomUUID());
        project.setName("CRM Premium");
        project.setStatus(status);
        project.setProgress(30);
        project.setSlaDueDate(LocalDate.now().plusDays(12));
        project.setBudget(new BigDecimal("15000.00"));
        project.setEstimatedCost(new BigDecimal("9000.00"));
        project.setActualCost(BigDecimal.ZERO);
        project.setActive(status != ProjectStatus.CANCELADO);
        return project;
    }

    private ServiceOffering serviceOffering(UUID id) {
        ServiceOffering service = new ServiceOffering();
        ReflectionTestUtils.setField(service, "id", id);
        service.setName("CRM Premium");
        service.setDeliveryStages("Briefing\nProducao\nRevisao");
        service.setActive(true);
        return service;
    }

    private Delivery delivery(Project project) {
        Delivery delivery = new Delivery();
        ReflectionTestUtils.setField(delivery, "id", UUID.randomUUID());
        delivery.setClientId(project.getClientId());
        delivery.setProjectId(project.getId());
        delivery.setContractId(project.getContractId());
        delivery.setServiceId(project.getServiceId());
        delivery.setType("briefing");
        delivery.setTitle("Briefing - CRM Premium");
        delivery.setOwner("Operacional");
        delivery.setDeadline(LocalDate.now().plusDays(3));
        delivery.setStatus("producao");
        delivery.setActive(true);
        return delivery;
    }
}
