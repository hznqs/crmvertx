package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContractServiceTest {

    @Test
    void summaryUsesGlobalContractAndClientAggregates() {
        ContractRepository contracts = mock(ContractRepository.class);
        ClientRepository clients = mock(ClientRepository.class);
        LocalDate today = LocalDate.now();
        when(contracts.countByStatus("ativo")).thenReturn(8L);
        when(contracts.countByStatusAndEndDateBetween(eq("ativo"), eq(today), eq(today.plusDays(30)))).thenReturn(3L);
        when(contracts.countByAutoRenewTrue()).thenReturn(5L);
        when(clients.sumContractValueByPhase(ClientPhase.FECHADO)).thenReturn(new BigDecimal("17500.00"));

        ContractService service = new ContractService(contracts, clients, mock(AuditService.class));

        var summary = service.summary();

        assertThat(summary.active()).isEqualTo(8);
        assertThat(summary.expiringSoon()).isEqualTo(3);
        assertThat(summary.autoRenew()).isEqualTo(5);
        assertThat(summary.mrr()).isEqualByComparingTo("17500.00");
    }
}
