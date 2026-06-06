package br.com.vertxmidia.crm.modules.billing.application;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BillingServiceTest {

    private static final LocalDate MIN_REPORT_DATE = LocalDate.of(1900, 1, 1);
    private static final LocalDate MAX_REPORT_DATE = LocalDate.of(9999, 12, 31);

    @Test
    void summaryUsesClosedClientsFromRepository() {
        ClientRepository clients = mock(ClientRepository.class);
        ContractRepository contracts = mock(ContractRepository.class);
        FinanceEntryRepository finances = mock(FinanceEntryRepository.class);
        
        UUID alphaId = UUID.randomUUID();
        UUID betaId = UUID.randomUUID();
        
        Client alphaClient = mock(Client.class);
        when(alphaClient.getId()).thenReturn(alphaId);
        when(alphaClient.getName()).thenReturn("Alpha");

        Client betaClient = mock(Client.class);
        when(betaClient.getId()).thenReturn(betaId);
        when(betaClient.getName()).thenReturn("Beta");

        when(clients.findAllById(isA(Iterable.class)))
                .thenReturn(List.of(alphaClient, betaClient));

        when(contracts.findByStatusAndActiveTrue("ativo"))
                .thenReturn(List.of(
                        contract(alphaId, "1200.00", 3),
                        contract(betaId, "800.00", 1),
                        contract(null, "500.00", 1)
                ));

        BillingService service = new BillingService(clients, contracts, finances);

        var summary = service.summary(null, null);

        assertThat(summary.activeContracts()).isEqualTo(3);
        assertThat(summary.totalRevenue()).isEqualByComparingTo("4400.00");
        assertThat(summary.averageTicket()).isEqualByComparingTo("1000.00");
        assertThat(summary.clients()).extracting("clientName").containsExactly("Alpha", "Beta");
        verify(finances).sumByTypeAndStatusAndPeriod("receita", "pago", MIN_REPORT_DATE, MAX_REPORT_DATE);
        verify(finances).sumByTypeAndStatusAndPeriod("receita", "pendente", MIN_REPORT_DATE, MAX_REPORT_DATE);
        verify(finances).sumByTypeAndStatusAndPeriod("receita", "vencido", MIN_REPORT_DATE, MAX_REPORT_DATE);
    }

    private Contract contract(UUID clientId, String value, int months) {
        Contract contract = new Contract();
        contract.setClientId(clientId);
        contract.setMonthlyValue(new BigDecimal(value));
        contract.setDurationMonths(months);
        contract.setImplementationFee(BigDecimal.ZERO);
        contract.setDiscount(BigDecimal.ZERO);
        contract.setTotalValue(new BigDecimal(value).multiply(BigDecimal.valueOf(months)));
        return contract;
    }
}
