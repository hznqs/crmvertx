package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FinanceEntryServiceTest {

    @Test
    void summaryCalculatesFinancialKpisFromRepositoryAggregates() {
        FinanceEntryRepository entries = mock(FinanceEntryRepository.class);
        ClientRepository clients = mock(ClientRepository.class);
        LocalDate from = LocalDate.of(2026, 5, 1);
        LocalDate to = LocalDate.of(2026, 5, 31);

        when(clients.sumContractValueByPhase(ClientPhase.FECHADO)).thenReturn(new BigDecimal("5000.00"));
        when(entries.sumRecurringByTypeAndPeriod("receita", from, to)).thenReturn(new BigDecimal("1200.00"));
        when(entries.sumByTypeAndPeriod("receita", from, to)).thenReturn(new BigDecimal("3000.00"));
        when(entries.sumByTypeAndPeriod("despesa", from, to)).thenReturn(new BigDecimal("1000.00"));
        when(entries.sumByTypeAndPeriod("comissao", from, to)).thenReturn(new BigDecimal("500.00"));
        when(entries.sumByTypeAndPeriod("imposto", from, to)).thenReturn(new BigDecimal("300.00"));
        when(entries.sumByStatusAndPeriod("vencido", from, to)).thenReturn(new BigDecimal("250.00"));
        when(entries.countAutoBillingByPeriod(from, to)).thenReturn(2L);

        FinanceEntryService service = new FinanceEntryService(entries, clients, mock(AuditService.class));

        var summary = service.summary(from, to);

        assertThat(summary.recurringRevenue()).isEqualByComparingTo("6200.00");
        assertThat(summary.grossRevenue()).isEqualByComparingTo("8000.00");
        assertThat(summary.forecast()).isEqualByComparingTo("14200.00");
        assertThat(summary.netProfit()).isEqualByComparingTo("6200.00");
        assertThat(summary.margin()).isEqualByComparingTo("77.50");
        assertThat(summary.overdue()).isEqualByComparingTo("250.00");
        assertThat(summary.autoBillingCount()).isEqualTo(2);
    }
}
