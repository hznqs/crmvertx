package br.com.vertxmidia.crm.modules.leads.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.application.ClientService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import br.com.vertxmidia.crm.modules.client.dto.ClientRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientResponse;
import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.Lead;
import br.com.vertxmidia.crm.modules.leads.domain.LeadOrigin;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import br.com.vertxmidia.crm.modules.leads.domain.LeadTemperature;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadRepository;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadStageHistoryRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LeadServiceTest {

    @Test
    void convertCreatesClientAndClosesLead() {
        UUID leadId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        LeadRepository repository = mock(LeadRepository.class);
        LeadStageHistoryRepository stageHistoryRepository = mock(LeadStageHistoryRepository.class);
        ClientService clientService = mock(ClientService.class);
        AuditService auditService = mock(AuditService.class);
        Lead lead = lead(leadId);

        when(repository.findByIdAndActiveTrue(leadId)).thenReturn(Optional.of(lead));
        when(repository.save(any(Lead.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(clientService.create(any(ClientRequest.class))).thenReturn(clientResponse(clientId, leadId));

        LeadService service = new LeadService(
                repository,
                stageHistoryRepository,
                new LeadMapper(),
                clientService,
                auditService
        );

        var response = service.convert(leadId);

        ArgumentCaptor<ClientRequest> clientRequest = ArgumentCaptor.forClass(ClientRequest.class);
        verify(clientService).create(clientRequest.capture());
        verify(stageHistoryRepository).save(any());
        verify(repository).save(lead);
        verify(auditService).log("CONVERT_TO_CLIENT", "Lead", leadId);

        assertThat(clientRequest.getValue().name()).isEqualTo("Vertx Midia Cliente");
        assertThat(clientRequest.getValue().contact()).isEqualTo("Maria Silva");
        assertThat(clientRequest.getValue().convertedFromLeadId()).isEqualTo(leadId);
        assertThat(clientRequest.getValue().priority()).isEqualTo(ClientPriority.ESTRATEGICA);
        assertThat(lead.getStatus()).isEqualTo(LeadStatus.CONVERTED);
        assertThat(lead.getCommercialStage()).isEqualTo(CommercialStage.FECHADO);
        assertThat(lead.getConvertedAt()).isNotNull();
        assertThat(response.client().id()).isEqualTo(clientId);
        assertThat(response.lead().id()).isEqualTo(leadId);
    }

    private Lead lead(UUID id) {
        Lead lead = new Lead();
        ReflectionTestUtils.setField(lead, "id", id);
        ReflectionTestUtils.setField(lead, "createdAt", Instant.now());
        ReflectionTestUtils.setField(lead, "updatedAt", Instant.now());
        lead.setName("Maria Silva");
        lead.setCompanyName("Vertx Midia Cliente");
        lead.setEmail("maria@cliente.com");
        lead.setPhone("11999999999");
        lead.setOrigin(LeadOrigin.INDICACAO);
        lead.setSegment("SaaS");
        lead.setTemperature(LeadTemperature.QUENTE);
        lead.setPotentialValue(new BigDecimal("12000.00"));
        lead.setNotes("Lead pronto para fechamento");
        lead.setStatus(LeadStatus.ACTIVE);
        lead.setCommercialStage(CommercialStage.NEGOCIACAO);
        lead.setActive(true);
        return lead;
    }

    private ClientResponse clientResponse(UUID clientId, UUID leadId) {
        return new ClientResponse(
                clientId,
                "Vertx Midia Cliente",
                "fechado",
                new BigDecimal("12000.00"),
                1,
                "Maria Silva",
                "maria@cliente.com",
                "11999999999",
                null,
                DocumentType.NAO_INFORMADO,
                "SaaS",
                ClientStatus.ATIVO,
                ClientPriority.ESTRATEGICA,
                "lead-convertido",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                true,
                leadId,
                null,
                null,
                "Cliente criado automaticamente",
                Instant.now(),
                Instant.now()
        );
    }
}
