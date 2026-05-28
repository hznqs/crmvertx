package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.dto.ContractRequest;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.projects.application.ProjectService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ContractServiceTest {

    @Test
    void summaryUsesGlobalContractAndClientAggregates() {
        ContractRepository contracts = mock(ContractRepository.class);
        ClientRepository clients = mock(ClientRepository.class);
        LocalDate today = LocalDate.now();
        when(contracts.countByStatusAndActiveTrue("ativo")).thenReturn(8L);
        when(contracts.countByStatusAndEndDateBetweenAndActiveTrue(eq("ativo"), eq(today), eq(today.plusDays(30)))).thenReturn(3L);
        when(contracts.countByAutoRenewTrueAndActiveTrue()).thenReturn(5L);
        when(clients.sumContractValueByPhase(ClientPhase.FECHADO)).thenReturn(new BigDecimal("17500.00"));

        ContractService service = new ContractService(
                contracts,
                clients,
                mock(FinanceEntryService.class),
                mock(CommissionSaleService.class),
                mock(ProjectService.class),
                mock(AuditService.class)
        );

        var summary = service.summary();

        assertThat(summary.active()).isEqualTo(8);
        assertThat(summary.expiringSoon()).isEqualTo(3);
        assertThat(summary.autoRenew()).isEqualTo(5);
        assertThat(summary.mrr()).isEqualByComparingTo("17500.00");
    }

    @Test
    void createActiveContractSynchronizesAutomaticRevenue() {
        ContractRepository contracts = mock(ContractRepository.class);
        FinanceEntryService financeEntries = mock(FinanceEntryService.class);
        CommissionSaleService commissions = mock(CommissionSaleService.class);
        ProjectService projects = mock(ProjectService.class);

        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContractService service = new ContractService(
                contracts,
                mock(ClientRepository.class),
                financeEntries,
                commissions,
                projects,
                mock(AuditService.class)
        );

        service.create(new ContractRequest(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                "Mensalidade CRM",
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2026, 11, 1),
                "ativo",
                true,
                new BigDecimal("2500.00"),
                null,
                6,
                10,
                true
        ));

        verify(financeEntries).syncContractRevenue(any(Contract.class));
        verify(commissions).syncContractCommission(any(Contract.class));
        verify(projects).syncContractProject(any(Contract.class));
    }
}
