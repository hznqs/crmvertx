package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CommissionSaleRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.TeamMemberRepository;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CommissionSaleServiceTest {

    @Test
    void metricsUsesRepositoryAggregates() {
        CommissionSaleRepository sales = mock(CommissionSaleRepository.class);
        TeamMemberRepository members = mock(TeamMemberRepository.class);
        UUID memberId = UUID.randomUUID();

        when(sales.countByMemberFilter(memberId)).thenReturn(4L);
        when(sales.totalRevenue(memberId)).thenReturn(new BigDecimal("12000.00"));
        when(sales.totalCommission(memberId)).thenReturn(new BigDecimal("1800.00"));

        CommissionSaleService service = newService(sales, members, mock(ServiceOfferingRepository.class), mock(ClientRepository.class));

        var metrics = service.metrics(memberId);

        assertThat(metrics.totalSales()).isEqualTo(4);
        assertThat(metrics.totalRevenue()).isEqualByComparingTo("12000.00");
        assertThat(metrics.totalCommission()).isEqualByComparingTo("1800.00");
    }

    @Test
    void rankingCombinesTeamProductivityWithCommissionAggregates() {
        CommissionSaleRepository sales = mock(CommissionSaleRepository.class);
        TeamMemberRepository members = mock(TeamMemberRepository.class);
        UUID closerId = UUID.randomUUID();
        UUID sdrId = UUID.randomUUID();
        UUID marketingId = UUID.randomUUID();

        TeamMember closer = member(closerId, "Ana Closer", "closer", 20, 15, 90);
        TeamMember sdr = member(sdrId, "Bia SDR", "sdr", 10, 4, 50);
        TeamMember marketing = member(marketingId, "Caio Marketing", "marketing", 8, 8, 75);

        when(members.findAll(any(Sort.class))).thenReturn(List.of(marketing, sdr, closer));
        when(sales.memberStats()).thenReturn(List.of(
                new Object[] { closerId, 8L, new BigDecimal("40000.00"), new BigDecimal("6000.00"), 10 },
                new Object[] { sdrId, 2L, new BigDecimal("5000.00"), new BigDecimal("500.00"), 5 }
        ));

        CommissionSaleService service = newService(sales, members, mock(ServiceOfferingRepository.class), mock(ClientRepository.class));

        var ranking = service.ranking();

        assertThat(ranking.topCloser()).isEqualTo("Ana Closer");
        assertThat(ranking.topSdr()).isEqualTo("Bia SDR");
        assertThat(ranking.topMarketing()).isEqualTo("Caio Marketing");
        assertThat(ranking.averageGoalProgress()).isEqualByComparingTo("60");
        assertThat(ranking.ranking()).extracting("name")
                .containsExactly("Ana Closer", "Caio Marketing", "Bia SDR");

        var closerStats = ranking.ranking().getFirst();
        assertThat(closerStats.sales()).isEqualTo(8);
        assertThat(closerStats.revenue()).isEqualByComparingTo("40000.00");
        assertThat(closerStats.commission()).isEqualByComparingTo("6000.00");
        assertThat(closerStats.goalProgress()).isEqualByComparingTo("80.00");
        assertThat(closerStats.xp()).isEqualTo(5000);
        assertThat(closerStats.level()).isEqualTo(11);
        assertThat(closerStats.badge()).isEqualTo("Elite");
        assertThat(closerStats.productivity()).isEqualTo(75);
    }

    @Test
    void syncContractCommissionCreatesPendingSaleCommissionForSeller() {
        CommissionSaleRepository sales = mock(CommissionSaleRepository.class);
        TeamMemberRepository members = mock(TeamMemberRepository.class);
        ServiceOfferingRepository services = mock(ServiceOfferingRepository.class);
        ClientRepository clients = mock(ClientRepository.class);
        Contract contract = activeContract();
        TeamMember seller = member(UUID.randomUUID(), "Ana Closer", "closer", 0, 0, 90);
        seller.setUserId(contract.getUpdatedBy());
        ServiceOffering serviceOffering = serviceOffering(contract.getServiceId());
        Client client = client(contract.getClientId());

        when(sales.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.empty());
        when(members.findFirstByUserIdAndActiveTrue(contract.getUpdatedBy())).thenReturn(Optional.of(seller));
        when(services.findByIdAndActiveTrue(contract.getServiceId())).thenReturn(Optional.of(serviceOffering));
        when(clients.findByIdAndActiveTrue(contract.getClientId())).thenReturn(Optional.of(client));
        when(sales.save(any(CommissionSale.class))).thenAnswer(invocation -> {
            CommissionSale sale = invocation.getArgument(0);
            ReflectionTestUtils.setField(sale, "id", UUID.randomUUID());
            ReflectionTestUtils.setField(sale, "createdAt", Instant.now());
            ReflectionTestUtils.setField(sale, "updatedAt", Instant.now());
            return sale;
        });

        CommissionSaleService service = newService(sales, members, services, clients);

        var response = service.syncContractCommission(contract).orElseThrow();

        assertThat(response.contractId()).isEqualTo(contract.getId());
        assertThat(response.memberId()).isEqualTo(seller.getId());
        assertThat(response.type()).isEqualTo("VENDA");
        assertThat(response.status()).isEqualTo("PENDENTE");
        assertThat(response.client()).isEqualTo("Vertx Cliente");
        assertThat(response.value()).isEqualByComparingTo("15000.00");
        assertThat(response.percent()).isEqualByComparingTo("8.00");
        assertThat(response.commissionValue()).isEqualByComparingTo("1200.0000");
    }

    @Test
    void syncContractCommissionUpdatesExistingOpenCommission() {
        CommissionSaleRepository sales = mock(CommissionSaleRepository.class);
        TeamMemberRepository members = mock(TeamMemberRepository.class);
        ServiceOfferingRepository services = mock(ServiceOfferingRepository.class);
        ClientRepository clients = mock(ClientRepository.class);
        Contract contract = activeContract();
        CommissionSale current = commission(contract);
        ServiceOffering serviceOffering = serviceOffering(contract.getServiceId());

        when(sales.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.of(current));
        when(members.findById(current.getMemberId())).thenReturn(Optional.of(member(current.getMemberId(), "Ana Closer", "closer", 0, 0, 90)));
        when(services.findByIdAndActiveTrue(contract.getServiceId())).thenReturn(Optional.of(serviceOffering));
        when(clients.findByIdAndActiveTrue(contract.getClientId())).thenReturn(Optional.of(client(contract.getClientId())));
        when(sales.save(any(CommissionSale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommissionSaleService service = newService(sales, members, services, clients);

        var response = service.syncContractCommission(contract).orElseThrow();

        assertThat(response.id()).isEqualTo(current.getId());
        assertThat(response.value()).isEqualByComparingTo("15000.00");
        assertThat(response.percent()).isEqualByComparingTo("8.00");
        verify(sales).save(current);
    }

    @Test
    void syncContractCommissionCancelsOpenCommissionWhenContractIsCanceled() {
        CommissionSaleRepository sales = mock(CommissionSaleRepository.class);
        Contract contract = activeContract();
        contract.setStatus("cancelado");
        CommissionSale current = commission(contract);

        when(sales.findFirstByContractIdAndActiveTrue(contract.getId())).thenReturn(Optional.of(current));
        when(sales.save(any(CommissionSale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommissionSaleService service = newService(sales, mock(TeamMemberRepository.class), mock(ServiceOfferingRepository.class), mock(ClientRepository.class));

        var response = service.syncContractCommission(contract);

        assertThat(response).isEmpty();
        assertThat(current.getStatus()).isEqualTo("CANCELADA");
        assertThat(current.isActive()).isFalse();
        verify(sales).save(current);
    }

    private CommissionSaleService newService(CommissionSaleRepository sales,
                                             TeamMemberRepository members,
                                             ServiceOfferingRepository services,
                                             ClientRepository clients) {
        return new CommissionSaleService(sales, members, services, clients, mock(FinanceEntryService.class), mock(AuditService.class));
    }

    private TeamMember member(UUID id, String name, String role, int tasks, int completed, int performance) {
        TeamMember member = new TeamMember();
        ReflectionTestUtils.setField(member, "id", id);
        member.setName(name);
        member.setRole(role);
        member.setTasks(tasks);
        member.setCompleted(completed);
        member.setPerformance(performance);
        return member;
    }

    private Contract activeContract() {
        Contract contract = new Contract();
        ReflectionTestUtils.setField(contract, "id", UUID.randomUUID());
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
        contract.setCreatedBy(UUID.randomUUID());
        contract.setUpdatedBy(UUID.randomUUID());
        return contract;
    }

    private ServiceOffering serviceOffering(UUID id) {
        ServiceOffering service = new ServiceOffering();
        ReflectionTestUtils.setField(service, "id", id);
        service.setName("CRM Premium");
        service.setBasePrice(new BigDecimal("12000.00"));
        service.setCommissionPercentage(new BigDecimal("8.00"));
        service.setActive(true);
        return service;
    }

    private Client client(UUID id) {
        Client client = new Client();
        ReflectionTestUtils.setField(client, "id", id);
        client.setName("Vertx Cliente");
        client.setActive(true);
        return client;
    }

    private CommissionSale commission(Contract contract) {
        CommissionSale sale = new CommissionSale();
        ReflectionTestUtils.setField(sale, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(sale, "createdAt", Instant.now());
        ReflectionTestUtils.setField(sale, "updatedAt", Instant.now());
        sale.setMemberId(UUID.randomUUID());
        sale.setType("VENDA");
        sale.setStatus("PENDENTE");
        sale.setContractId(contract.getId());
        sale.setClient("Cliente antigo");
        sale.setValue(new BigDecimal("1000.00"));
        sale.setPercent(new BigDecimal("5.00"));
        sale.setActive(true);
        return sale;
    }
}
