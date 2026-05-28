package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.FinanceEntry;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
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

    @Test
    void syncContractRevenueCreatesPendingAutomaticRevenueForActiveContract() {
        FinanceEntryRepository entries = mock(FinanceEntryRepository.class);
        Contract contract = activeContract();
        UUID entryId = UUID.randomUUID();

        when(entries.findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(contract.getId(), "receita")).thenReturn(Optional.empty());
        when(entries.save(any(FinanceEntry.class))).thenAnswer(invocation -> {
            FinanceEntry entry = invocation.getArgument(0);
            ReflectionTestUtils.setField(entry, "id", entryId);
            ReflectionTestUtils.setField(entry, "createdAt", Instant.now());
            ReflectionTestUtils.setField(entry, "updatedAt", Instant.now());
            return entry;
        });

        FinanceEntryService service = new FinanceEntryService(entries, mock(ClientRepository.class), mock(AuditService.class));

        var response = service.syncContractRevenue(contract).orElseThrow();

        assertThat(response.id()).isEqualTo(entryId);
        assertThat(response.contractId()).isEqualTo(contract.getId());
        assertThat(response.clientId()).isEqualTo(contract.getClientId());
        assertThat(response.type()).isEqualTo("receita");
        assertThat(response.status()).isEqualTo("pendente");
        assertThat(response.value()).isEqualByComparingTo("2500.00");
        assertThat(response.due()).isEqualTo(LocalDate.of(2026, 5, 10));
        assertThat(response.recurring()).isTrue();
        assertThat(response.autoBilling()).isTrue();
        assertThat(response.costCenter()).isEqualTo("vendas");
    }

    @Test
    void syncContractRevenueUpdatesExistingAutomaticRevenue() {
        FinanceEntryRepository entries = mock(FinanceEntryRepository.class);
        Contract contract = activeContract();
        FinanceEntry current = financeEntry(contract.getId());

        when(entries.findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(contract.getId(), "receita")).thenReturn(Optional.of(current));
        when(entries.save(any(FinanceEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FinanceEntryService service = new FinanceEntryService(entries, mock(ClientRepository.class), mock(AuditService.class));

        var response = service.syncContractRevenue(contract).orElseThrow();

        assertThat(response.id()).isEqualTo(current.getId());
        assertThat(current.getValue()).isEqualByComparingTo("2500.00");
        assertThat(current.getDue()).isEqualTo(LocalDate.of(2026, 5, 10));
        verify(entries).save(current);
    }

    @Test
    void syncContractRevenueCancelsAutomaticRevenueForInactiveContract() {
        FinanceEntryRepository entries = mock(FinanceEntryRepository.class);
        Contract contract = activeContract();
        contract.setStatus("cancelado");
        FinanceEntry current = financeEntry(contract.getId());

        when(entries.findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(contract.getId(), "receita")).thenReturn(Optional.of(current));
        when(entries.save(any(FinanceEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FinanceEntryService service = new FinanceEntryService(entries, mock(ClientRepository.class), mock(AuditService.class));

        var response = service.syncContractRevenue(contract);

        assertThat(response).isEmpty();
        assertThat(current.getStatus()).isEqualTo("cancelado");
        assertThat(current.isActive()).isFalse();
        verify(entries).save(current);
    }

    @Test
    void syncCommissionExpenseCreatesPaidExpenseForPaidCommission() {
        FinanceEntryRepository entries = mock(FinanceEntryRepository.class);
        CommissionSale commission = paidCommission();
        UUID entryId = UUID.randomUUID();

        when(entries.findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(commission.getContractId(), "despesa")).thenReturn(Optional.empty());
        when(entries.save(any(FinanceEntry.class))).thenAnswer(invocation -> {
            FinanceEntry entry = invocation.getArgument(0);
            ReflectionTestUtils.setField(entry, "id", entryId);
            ReflectionTestUtils.setField(entry, "createdAt", Instant.now());
            ReflectionTestUtils.setField(entry, "updatedAt", Instant.now());
            return entry;
        });

        FinanceEntryService service = new FinanceEntryService(entries, mock(ClientRepository.class), mock(AuditService.class));

        var response = service.syncCommissionExpense(commission).orElseThrow();

        assertThat(response.id()).isEqualTo(entryId);
        assertThat(response.contractId()).isEqualTo(commission.getContractId());
        assertThat(response.type()).isEqualTo("despesa");
        assertThat(response.status()).isEqualTo("pago");
        assertThat(response.value()).isEqualByComparingTo("1200.00");
        assertThat(response.costCenter()).isEqualTo("vendas");
        assertThat(response.autoBilling()).isTrue();
        assertThat(commission.getFinanceEntryId()).isEqualTo(entryId);
    }

    @Test
    void syncCommissionExpenseKeepsAlreadyPaidExpenseImmutable() {
        FinanceEntryRepository entries = mock(FinanceEntryRepository.class);
        CommissionSale commission = paidCommission();
        FinanceEntry current = commissionExpense(commission);

        when(entries.findFirstByContractIdAndTypeAndAutoBillingTrueAndActiveTrue(commission.getContractId(), "despesa")).thenReturn(Optional.of(current));

        FinanceEntryService service = new FinanceEntryService(entries, mock(ClientRepository.class), mock(AuditService.class));

        var response = service.syncCommissionExpense(commission).orElseThrow();

        assertThat(response.id()).isEqualTo(current.getId());
        assertThat(response.status()).isEqualTo("pago");
        assertThat(commission.getFinanceEntryId()).isEqualTo(current.getId());
    }

    @Test
    void syncCommissionExpenseCancelsOpenExpenseWhenCommissionIsNoLongerPaid() {
        FinanceEntryRepository entries = mock(FinanceEntryRepository.class);
        CommissionSale commission = paidCommission();
        commission.setStatus("CANCELADA");
        FinanceEntry current = commissionExpense(commission);
        current.setStatus("pendente");

        when(entries.findById(commission.getFinanceEntryId())).thenReturn(Optional.of(current));
        when(entries.save(any(FinanceEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FinanceEntryService service = new FinanceEntryService(entries, mock(ClientRepository.class), mock(AuditService.class));

        var response = service.syncCommissionExpense(commission);

        assertThat(response).isEmpty();
        assertThat(current.getStatus()).isEqualTo("cancelado");
        assertThat(current.isActive()).isFalse();
        verify(entries).save(current);
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

    private FinanceEntry financeEntry(UUID contractId) {
        FinanceEntry entry = new FinanceEntry();
        ReflectionTestUtils.setField(entry, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(entry, "createdAt", Instant.now());
        ReflectionTestUtils.setField(entry, "updatedAt", Instant.now());
        entry.setContractId(contractId);
        entry.setType("receita");
        entry.setStatus("pendente");
        entry.setDescription("Receita antiga");
        entry.setValue(new BigDecimal("1000.00"));
        entry.setDue(LocalDate.of(2026, 5, 5));
        entry.setRecurring(true);
        entry.setAutoBilling(true);
        entry.setCostCenter("vendas");
        entry.setActive(true);
        return entry;
    }

    private CommissionSale paidCommission() {
        CommissionSale commission = new CommissionSale();
        ReflectionTestUtils.setField(commission, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(commission, "createdAt", Instant.now());
        ReflectionTestUtils.setField(commission, "updatedAt", Instant.now());
        commission.setMemberId(UUID.randomUUID());
        commission.setType("VENDA");
        commission.setStatus("PAGA");
        commission.setContractId(UUID.randomUUID());
        commission.setClient("Vertx Cliente");
        commission.setValue(new BigDecimal("15000.00"));
        commission.setPercent(new BigDecimal("8.00"));
        commission.setActive(true);
        commission.setPaidAt(Instant.parse("2026-05-20T10:15:30Z"));
        return commission;
    }

    private FinanceEntry commissionExpense(CommissionSale commission) {
        FinanceEntry entry = new FinanceEntry();
        ReflectionTestUtils.setField(entry, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(entry, "createdAt", Instant.now());
        ReflectionTestUtils.setField(entry, "updatedAt", Instant.now());
        entry.setContractId(commission.getContractId());
        entry.setType("despesa");
        entry.setStatus("pago");
        entry.setDescription("Despesa automatica da comissao Vertx Cliente");
        entry.setValue(new BigDecimal("1200.00"));
        entry.setDue(LocalDate.of(2026, 5, 20));
        entry.setRecurring(false);
        entry.setAutoBilling(true);
        entry.setCostCenter("vendas");
        entry.setActive(true);
        commission.setFinanceEntryId(entry.getId());
        return entry;
    }
}
