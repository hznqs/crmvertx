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
import br.com.vertxmidia.crm.modules.leads.dto.LeadFilterRequest;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadRepository;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadStageHistoryRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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

        when(repository.findById(leadId)).thenReturn(Optional.of(lead));
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
        assertThat(clientRequest.getValue().value()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(clientRequest.getValue().convertedFromLeadId()).isEqualTo(leadId);
        assertThat(clientRequest.getValue().priority()).isEqualTo(ClientPriority.ESTRATEGICA);
        assertThat(lead.getStatus()).isEqualTo(LeadStatus.CONVERTED);
        assertThat(lead.getCommercialStage()).isEqualTo(CommercialStage.FECHADO);
        assertThat(lead.getConvertedAt()).isNotNull();
        assertThat(lead.getConvertedClientId()).isEqualTo(clientId);
        assertThat(lead.isActive()).isFalse();
        assertThat(response.client().id()).isEqualTo(clientId);
        assertThat(response.lead().id()).isEqualTo(leadId);
    }

    @Test
    void convertReturnsLinkedClientWhenLeadIsAlreadyConvertedAndHidden() {
        UUID leadId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        LeadRepository repository = mock(LeadRepository.class);
        ClientService clientService = mock(ClientService.class);
        Lead lead = lead(leadId);
        lead.setStatus(LeadStatus.CONVERTED);
        lead.setCommercialStage(CommercialStage.FECHADO);
        lead.setConvertedClientId(clientId);
        lead.setActive(false);

        when(repository.findById(leadId)).thenReturn(Optional.of(lead));
        when(clientService.findById(clientId)).thenReturn(clientResponse(clientId, leadId));

        LeadService service = new LeadService(
                repository,
                mock(LeadStageHistoryRepository.class),
                new LeadMapper(),
                clientService,
                mock(AuditService.class)
        );

        var response = service.convert(leadId);

        assertThat(response.client().id()).isEqualTo(clientId);
        assertThat(response.lead().active()).isFalse();
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void searchFiltersActiveLeadsByDefault() {
        LeadRepository repository = mock(LeadRepository.class);
        LeadService service = new LeadService(
                repository,
                mock(LeadStageHistoryRepository.class),
                new LeadMapper(),
                mock(ClientService.class),
                mock(AuditService.class)
        );
        when(repository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(Page.empty());

        service.search(new LeadFilterRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        ), Pageable.unpaged());

        ArgumentCaptor<Specification<Lead>> specification = ArgumentCaptor.forClass(Specification.class);
        verify(repository).findAll(specification.capture(), any(Pageable.class));

        Root<Lead> root = mock(Root.class);
        CriteriaQuery query = mock(CriteriaQuery.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Path<Object> activePath = mock(Path.class);
        Predicate activePredicate = mock(Predicate.class);
        Predicate finalPredicate = mock(Predicate.class);
        when(root.get("active")).thenReturn(activePath);
        when(criteriaBuilder.equal(activePath, true)).thenReturn(activePredicate);
        when(criteriaBuilder.and(any(Predicate[].class))).thenReturn(finalPredicate);

        Predicate result = specification.getValue().toPredicate(root, query, criteriaBuilder);

        assertThat(result).isEqualTo(finalPredicate);
        verify(criteriaBuilder).equal(activePath, true);
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
                BigDecimal.ZERO,
                1,
                "Maria Silva",
                "maria@cliente.com",
                "11999999999",
                null,
                "JURIDICA",
                DocumentType.NAO_INFORMADO,
                "SaaS",
                "INDICACAO",
                null,
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
                false,
                false,
                BigDecimal.ZERO,
                Instant.now(),
                Instant.now()
        );
    }
}
