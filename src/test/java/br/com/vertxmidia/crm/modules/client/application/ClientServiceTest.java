package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import br.com.vertxmidia.crm.modules.client.dto.ClientRequest;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ClientServiceTest {

    @Test
    void deleteRejectsClientWithActiveContract() {
        UUID clientId = UUID.randomUUID();
        ClientRepository clients = mock(ClientRepository.class);
        ContractRepository contracts = mock(ContractRepository.class);
        when(clients.findByIdAndActiveTrue(clientId)).thenReturn(Optional.of(client(clientId)));
        when(contracts.existsByClientIdAndActiveTrueAndStatusIn(any(UUID.class), anyCollection())).thenReturn(true);

        ClientService service = new ClientService(clients, new ClientMapper(), mock(AuditService.class), contracts);

        assertThatThrownBy(() -> service.delete(clientId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("possui contrato ativo");
    }

    @Test
    void deleteSoftArchivesClientWithoutActiveContract() {
        UUID clientId = UUID.randomUUID();
        Client client = client(clientId);
        ClientRepository clients = mock(ClientRepository.class);
        ContractRepository contracts = mock(ContractRepository.class);
        when(clients.findByIdAndActiveTrue(clientId)).thenReturn(Optional.of(client));
        when(contracts.existsByClientIdAndActiveTrueAndStatusIn(any(UUID.class), anyCollection())).thenReturn(false);
        when(clients.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClientService service = new ClientService(clients, new ClientMapper(), mock(AuditService.class), contracts);

        service.delete(clientId);

        assertThat(client.isActive()).isFalse();
        assertThat(client.getStatus()).isEqualTo(ClientStatus.INATIVO);
        verify(clients).save(client);
    }

    @Test
    void mapperIgnoresLegacyManualFinancialFields() {
        ClientMapper mapper = new ClientMapper();
        Client client = mapper.toEntity(clientRequestWithForcedFinancialValues());

        assertThat(client.getContractValue()).isEqualByComparingTo("0.00");
        assertThat(client.getContractMonths()).isEqualTo(1);

        var response = mapper.toResponse(client, false, false, new BigDecimal("900.00"));

        assertThat(response.value()).isEqualByComparingTo("0.00");
        assertThat(response.months()).isEqualTo(1);
        assertThat(response.currentMrr()).isEqualByComparingTo("900.00");
    }

    private Client client(UUID clientId) {
        Client client = new Client();
        ReflectionTestUtils.setField(client, "id", clientId);
        client.setName("Cliente protegido");
        client.setPhase(ClientPhase.FECHADO);
        client.setContractValue(BigDecimal.ZERO);
        client.setContractMonths(1);
        client.setContactName("Maria");
        client.setStatus(ClientStatus.ATIVO);
        client.setActive(true);
        return client;
    }

    private ClientRequest clientRequestWithForcedFinancialValues() {
        return new ClientRequest(
                "Cliente com payload forcado",
                "fechado",
                new BigDecimal("50000.00"),
                36,
                "Maria",
                "maria@cliente.com",
                "11999999999",
                "11222333000181",
                "JURIDICA",
                DocumentType.CNPJ,
                "Marketing",
                "Indicacao",
                "Ana",
                ClientStatus.ATIVO,
                ClientPriority.MEDIA,
                "vip",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                "Teste"
        );
    }
}
