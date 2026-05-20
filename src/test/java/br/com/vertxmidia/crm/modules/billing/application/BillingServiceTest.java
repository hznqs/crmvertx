package br.com.vertxmidia.crm.modules.billing.application;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BillingServiceTest {

    @Test
    void summaryUsesClosedClientsFromRepository() {
        ClientRepository clients = mock(ClientRepository.class);
        when(clients.findByPhase(eq(ClientPhase.FECHADO), isA(Sort.class)))
                .thenReturn(List.of(client("Alpha", "1200.00", 3), client("Beta", "800.00", 1)));

        BillingService service = new BillingService(clients);

        var summary = service.summary();

        assertThat(summary.activeContracts()).isEqualTo(2);
        assertThat(summary.totalRevenue()).isEqualByComparingTo("4400.00");
        assertThat(summary.averageTicket()).isEqualByComparingTo("2200.00");
        assertThat(summary.clients()).extracting("clientName").containsExactly("Alpha", "Beta");
    }

    private Client client(String name, String value, int months) {
        Client client = new Client();
        client.setName(name);
        client.setPhase(ClientPhase.FECHADO);
        client.setContractValue(new BigDecimal(value));
        client.setContractMonths(months);
        client.setContactName("Contato");
        client.setEmail("cliente@example.com");
        client.setPhone("(00) 00000-0000");
        return client;
    }
}
