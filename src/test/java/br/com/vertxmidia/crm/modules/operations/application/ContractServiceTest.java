package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.domain.ContractServiceItem;
import br.com.vertxmidia.crm.modules.operations.dto.ChurnReasonResponse;
import br.com.vertxmidia.crm.modules.operations.dto.ContractLifecycleRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ContractRequest;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractServiceItemRepository;
import br.com.vertxmidia.crm.modules.projects.application.ProjectService;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectResponse;
import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import br.com.vertxmidia.crm.modules.services.domain.ServiceOffering;
import br.com.vertxmidia.crm.modules.services.infrastructure.ServiceOfferingRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ContractServiceTest {

    @Test
    void summaryUsesContractMonthlyAggregate() {
        ContractRepository contracts = mock(ContractRepository.class);
        LocalDate today = LocalDate.now();
        when(contracts.countByStatusAndActiveTrue("ativo")).thenReturn(8L);
        when(contracts.countByStatusAndEndDateBetweenAndActiveTrue(eq("ativo"), eq(today), eq(today.plusDays(30)))).thenReturn(3L);
        when(contracts.countByAutoRenewTrueAndActiveTrue()).thenReturn(5L);
        when(contracts.sumMonthlyValueByStatusAndActiveTrue("ativo")).thenReturn(new BigDecimal("17500.00"));

        ContractService service = service(contracts, mock(ContractServiceItemRepository.class), mock(ServiceOfferingRepository.class), clientRepository(UUID.randomUUID()));

        var summary = service.summary();

        assertThat(summary.active()).isEqualTo(8);
        assertThat(summary.expiringSoon()).isEqualTo(3);
        assertThat(summary.autoRenew()).isEqualTo(5);
        assertThat(summary.mrr()).isEqualByComparingTo("17500.00");
    }

    @Test
    void createActiveContractSynchronizesAutomaticRevenue() {
        UUID clientId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        ContractRepository contracts = mock(ContractRepository.class);
        ContractServiceItemRepository items = itemRepository();
        ServiceOfferingRepository services = serviceRepository(serviceId, "CRM", "2500.00", ServiceBillingType.MENSAL);
        FinanceEntryService financeEntries = mock(FinanceEntryService.class);
        CommissionSaleService commissions = mock(CommissionSaleService.class);
        ProjectService projects = mock(ProjectService.class);

        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContractService service = new ContractService(
                contracts,
                items,
                services,
                clientRepository(clientId),
                financeEntries,
                commissions,
                projects,
                mock(AuditService.class)
        );

        service.create(contractRequest(clientId, List.of(serviceId), BigDecimal.ZERO, BigDecimal.ZERO, 6));

        verify(financeEntries).syncContractRevenue(any(Contract.class));
        verify(commissions).syncContractCommission(any(Contract.class));
        verify(projects).syncContractProject(any(Contract.class));
    }

    @Test
    void createCalculatesTotalFromMultipleServicesDurationImplementationAndDiscount() {
        UUID clientId = UUID.randomUUID();
        UUID landingPageId = UUID.randomUUID();
        UUID socialMediaId = UUID.randomUUID();
        UUID setupId = UUID.randomUUID();
        ContractRepository contracts = mock(ContractRepository.class);
        ServiceOfferingRepository services = mock(ServiceOfferingRepository.class);
        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(services.findByIdAndActiveTrue(landingPageId)).thenReturn(Optional.of(service(landingPageId, "Landing Page", "800.00", ServiceBillingType.MENSAL)));
        when(services.findByIdAndActiveTrue(socialMediaId)).thenReturn(Optional.of(service(socialMediaId, "Social Media", "1200.00", ServiceBillingType.RECORRENTE)));
        when(services.findByIdAndActiveTrue(setupId)).thenReturn(Optional.of(service(setupId, "Setup SEO", "1500.00", ServiceBillingType.UNICO)));

        ContractService service = service(contracts, itemRepository(), services, clientRepository(clientId));

        service.create(contractRequest(
                clientId,
                List.of(landingPageId, socialMediaId, setupId),
                new BigDecimal("2000.00"),
                new BigDecimal("500.00"),
                12
        ));

        ArgumentCaptor<Contract> captor = ArgumentCaptor.forClass(Contract.class);
        verify(contracts).save(captor.capture());

        Contract saved = captor.getValue();
        assertThat(saved.getMonthlyValue()).isEqualByComparingTo("2000.00");
        assertThat(saved.getImplementationFee()).isEqualByComparingTo("2000.00");
        assertThat(saved.getDiscount()).isEqualByComparingTo("500.00");
        assertThat(saved.getTotalValue()).isEqualByComparingTo("27000.00");
        assertThat(saved.getServiceId()).isEqualTo(landingPageId);
    }

    @Test
    void createOneTimeOnlyContractDoesNotUseMonthlyDurationOrMrr() {
        UUID clientId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        ContractRepository contracts = mock(ContractRepository.class);
        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ContractService service = service(
                contracts,
                itemRepository(),
                serviceRepository(serviceId, "Landing Page", "1200.00", ServiceBillingType.UNICO),
                clientRepository(clientId)
        );

        service.create(contractRequest(
                clientId,
                List.of(serviceId),
                new BigDecimal("300.00"),
                new BigDecimal("100.00"),
                99,
                false,
                LocalDate.of(2026, 6, 2),
                LocalDate.of(2026, 6, 19)
        ));

        ArgumentCaptor<Contract> captor = ArgumentCaptor.forClass(Contract.class);
        verify(contracts).save(captor.capture());

        Contract saved = captor.getValue();
        assertThat(saved.getDurationMonths()).isZero();
        assertThat(saved.getMonthlyValue()).isEqualByComparingTo("0.00");
        assertThat(saved.getTotalValue()).isEqualByComparingTo("1400.00");
    }

    @Test
    void createRecurringContractIgnoresManualDurationAndUsesDateRange() {
        UUID clientId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        ContractRepository contracts = mock(ContractRepository.class);
        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ContractService service = service(
                contracts,
                itemRepository(),
                serviceRepository(serviceId, "Social Media", "700.00", ServiceBillingType.RECORRENTE),
                clientRepository(clientId)
        );

        service.create(contractRequest(
                clientId,
                List.of(serviceId),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                99,
                false,
                LocalDate.of(2026, 6, 2),
                LocalDate.of(2026, 9, 2)
        ));

        ArgumentCaptor<Contract> captor = ArgumentCaptor.forClass(Contract.class);
        verify(contracts).save(captor.capture());

        Contract saved = captor.getValue();
        assertThat(saved.getDurationMonths()).isEqualTo(3);
        assertThat(saved.getMonthlyValue()).isEqualByComparingTo("700.00");
        assertThat(saved.getTotalValue()).isEqualByComparingTo("2100.00");
    }

    @Test
    void createGeneratesOperationalProjectOnlyWhenRequested() {
        UUID clientId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        ContractRepository contracts = mock(ContractRepository.class);
        ContractServiceItemRepository items = itemRepository();
        ProjectService projects = mock(ProjectService.class);
        ServiceOfferingRepository services = serviceRepository(serviceId, "CRM", "2500.00", ServiceBillingType.MENSAL);

        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(projects.generateProjectFromContract(any(Contract.class), any())).thenReturn(projectResponse(projectId, clientId, serviceId));

        ContractService service = new ContractService(
                contracts,
                items,
                services,
                clientRepository(clientId),
                mock(FinanceEntryService.class),
                mock(CommissionSaleService.class),
                projects,
                mock(AuditService.class)
        );

        var response = service.create(contractRequest(clientId, List.of(serviceId), BigDecimal.ZERO, BigDecimal.ZERO, 6, true));

        assertThat(response.projectId()).isEqualTo(projectId);
        verify(projects).generateProjectFromContract(any(Contract.class), any());
    }

    @Test
    void createRejectsContractWithoutClient() {
        ContractService service = service(
                mock(ContractRepository.class),
                mock(ContractServiceItemRepository.class),
                mock(ServiceOfferingRepository.class),
                mock(ClientRepository.class)
        );

        assertThatThrownBy(() -> service.create(contractRequest(null, List.of(UUID.randomUUID()), BigDecimal.ZERO, BigDecimal.ZERO, 1)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cliente e obrigatorio");
    }

    @Test
    void createRejectsDiscountGreaterThanGrossContractValue() {
        UUID clientId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        ContractService service = service(
                mock(ContractRepository.class),
                mock(ContractServiceItemRepository.class),
                serviceRepository(serviceId, "CRM", "500.00", ServiceBillingType.MENSAL),
                clientRepository(clientId)
        );

        assertThatThrownBy(() -> service.create(contractRequest(
                clientId,
                List.of(serviceId),
                BigDecimal.ZERO,
                new BigDecimal("7000.00"),
                1
        )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Desconto nao pode ser maior");
    }

    @Test
    void createRejectsEndDateBeforeStartDateWithSpecificMessage() {
        UUID clientId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        ContractService service = service(
                mock(ContractRepository.class),
                mock(ContractServiceItemRepository.class),
                serviceRepository(serviceId, "CRM", "500.00", ServiceBillingType.MENSAL),
                clientRepository(clientId)
        );

        assertThatThrownBy(() -> service.create(contractRequest(
                clientId,
                List.of(serviceId),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                1,
                false,
                LocalDate.of(2026, 6, 20),
                LocalDate.of(2026, 6, 19)
        )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Data final do contrato nao pode ser anterior");
    }

    @Test
    void cancelRecurringContractRegistersLostMrrAsChurn() {
        UUID contractId = UUID.randomUUID();
        Contract contract = contract(contractId, new BigDecimal("900.00"), true);
        ContractRepository contracts = mock(ContractRepository.class);
        when(contracts.findById(contractId)).thenReturn(Optional.of(contract));
        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContractService service = service(contracts, mock(ContractServiceItemRepository.class), mock(ServiceOfferingRepository.class), clientRepository(UUID.randomUUID()));

        var response = service.cancel(contractId, new ContractLifecycleRequest(LocalDate.of(2026, 6, 4), "Cliente cancelou mensalidade", "Sem interesse"));

        assertThat(response.status()).isEqualTo("cancelado");
        assertThat(response.recurring()).isTrue();
        assertThat(response.mrrLost()).isEqualByComparingTo("900.00");
        assertThat(response.cancelledAt()).isEqualTo(LocalDate.of(2026, 6, 4));
        assertThat(response.churnReason()).isEqualTo("Cliente cancelou mensalidade");
    }

    @Test
    void cancelOneTimeContractDoesNotRegisterMrrChurn() {
        UUID contractId = UUID.randomUUID();
        Contract contract = contract(contractId, BigDecimal.ZERO, false);
        contract.setTotalValue(new BigDecimal("2500.00"));
        ContractRepository contracts = mock(ContractRepository.class);
        when(contracts.findById(contractId)).thenReturn(Optional.of(contract));
        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContractService service = service(contracts, mock(ContractServiceItemRepository.class), mock(ServiceOfferingRepository.class), clientRepository(UUID.randomUUID()));

        var response = service.cancel(contractId, new ContractLifecycleRequest(LocalDate.of(2026, 6, 4), "Projeto avulso cancelado", null));

        assertThat(response.status()).isEqualTo("cancelado");
        assertThat(response.recurring()).isFalse();
        assertThat(response.mrrLost()).isEqualByComparingTo("0.00");
    }

    @Test
    void nonRenewedRecurringContractRegistersLostMrr() {
        UUID contractId = UUID.randomUUID();
        Contract contract = contract(contractId, new BigDecimal("1200.00"), true);
        ContractRepository contracts = mock(ContractRepository.class);
        when(contracts.findById(contractId)).thenReturn(Optional.of(contract));
        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContractService service = service(contracts, mock(ContractServiceItemRepository.class), mock(ServiceOfferingRepository.class), clientRepository(UUID.randomUUID()));

        var response = service.markAsNonRenewed(contractId, new ContractLifecycleRequest(LocalDate.of(2026, 12, 31), "Nao renovou", null));

        assertThat(response.status()).isEqualTo("nao_renovado");
        assertThat(response.endedAt()).isEqualTo(LocalDate.of(2026, 12, 31));
        assertThat(response.mrrLost()).isEqualByComparingTo("1200.00");
        assertThat(response.nonRenewalReason()).isEqualTo("Nao renovou");
    }

    @Test
    void renewedRecurringContractLinksOldAndNewWithoutLostMrr() {
        UUID oldContractId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        Contract oldContract = contract(oldContractId, new BigDecimal("1200.00"), true);
        oldContract.setClientId(clientId);
        ContractRepository contracts = mock(ContractRepository.class);
        when(contracts.findById(oldContractId)).thenReturn(Optional.of(oldContract));
        when(contracts.save(any(Contract.class))).thenAnswer(invocation -> {
            Contract saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                ReflectionTestUtils.setField(saved, "id", UUID.randomUUID());
            }
            return saved;
        });
        ContractService service = service(
                contracts,
                itemRepository(),
                serviceRepository(serviceId, "Social Media", "1200.00", ServiceBillingType.RECORRENTE),
                clientRepository(clientId)
        );

        var renewed = service.renew(oldContractId, contractRequest(clientId, List.of(serviceId), BigDecimal.ZERO, BigDecimal.ZERO, 12));

        assertThat(renewed.renewedFromContractId()).isEqualTo(oldContractId);
        assertThat(oldContract.getStatus()).isEqualTo("renovado");
        assertThat(oldContract.getRenewedToContractId()).isEqualTo(renewed.id());
        assertThat(oldContract.getMrrLost()).isEqualByComparingTo("0.00");
    }

    @Test
    void churnMetricsUsesOnlyRecurringLossesFromRepository() {
        ContractRepository contracts = mock(ContractRepository.class);
        LocalDate from = LocalDate.of(2026, 6, 1);
        LocalDate to = LocalDate.of(2026, 6, 30);
        when(contracts.countRecurringCustomersActiveAt(anyCollection(), eq(from))).thenReturn(10L);
        when(contracts.countRecurringContractsActiveAt(anyCollection(), eq(from))).thenReturn(20L);
        when(contracts.countLostRecurringCustomersBetween(anyCollection(), anyCollection(), eq(from), eq(to))).thenReturn(2L);
        when(contracts.countLostRecurringContractsBetween(anyCollection(), eq(from), eq(to))).thenReturn(4L);
        when(contracts.countNonRenewedRecurringContractsBetween(from, to)).thenReturn(1L);
        when(contracts.sumRecurringMrrActiveAt(anyCollection(), eq(from))).thenReturn(new BigDecimal("10000.00"));
        when(contracts.sumMrrLostBetween(anyCollection(), eq(from), eq(to))).thenReturn(new BigDecimal("1500.00"));
        when(contracts.countChurnReasonsBetween(anyCollection(), eq(from), eq(to))).thenReturn(List.of(new ChurnReasonResponse("Preco", 2)));

        ContractService service = service(contracts, mock(ContractServiceItemRepository.class), mock(ServiceOfferingRepository.class), clientRepository(UUID.randomUUID()));

        var metrics = service.churnMetrics(from, to);

        assertThat(metrics.customerChurnRate()).isEqualByComparingTo("20.00");
        assertThat(metrics.contractChurnRate()).isEqualByComparingTo("20.00");
        assertThat(metrics.mrrChurnRate()).isEqualByComparingTo("15.00");
        assertThat(metrics.mrrLost()).isEqualByComparingTo("1500.00");
        assertThat(metrics.nonRenewedContracts()).isEqualTo(1);
        assertThat(metrics.churnReasons()).hasSize(1);
    }

    private ContractService service(ContractRepository contracts,
                                    ContractServiceItemRepository items,
                                    ServiceOfferingRepository services,
                                    ClientRepository clients) {
        return new ContractService(
                contracts,
                items,
                services,
                clients,
                mock(FinanceEntryService.class),
                mock(CommissionSaleService.class),
                mock(ProjectService.class),
                mock(AuditService.class)
        );
    }

    private ClientRepository clientRepository(UUID clientId) {
        ClientRepository clients = mock(ClientRepository.class);
        if (clientId != null) {
            Client client = new Client();
            ReflectionTestUtils.setField(client, "id", clientId);
            client.setActive(true);
            when(clients.findByIdAndActiveTrue(clientId)).thenReturn(Optional.of(client));
        }
        return clients;
    }

    private ContractServiceItemRepository itemRepository() {
        ContractServiceItemRepository items = mock(ContractServiceItemRepository.class);
        when(items.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        return items;
    }

    private ServiceOfferingRepository serviceRepository(UUID serviceId, String name, String price, ServiceBillingType billingType) {
        ServiceOfferingRepository services = mock(ServiceOfferingRepository.class);
        when(services.findByIdAndActiveTrue(serviceId)).thenReturn(Optional.of(service(serviceId, name, price, billingType)));
        return services;
    }

    private ServiceOffering service(UUID serviceId, String name, String price, ServiceBillingType billingType) {
        ServiceOffering service = new ServiceOffering();
        ReflectionTestUtils.setField(service, "id", serviceId);
        service.setName(name);
        service.setBasePrice(new BigDecimal(price));
        service.setBillingType(billingType);
        service.setActive(true);
        return service;
    }

    private ContractRequest contractRequest(UUID clientId,
                                            List<UUID> serviceIds,
                                            BigDecimal implementationFee,
                                            BigDecimal discount,
                                            int durationMonths) {
        return contractRequest(clientId, serviceIds, implementationFee, discount, durationMonths, false);
    }

    private ContractRequest contractRequest(UUID clientId,
                                            List<UUID> serviceIds,
                                            BigDecimal implementationFee,
                                            BigDecimal discount,
                                            int durationMonths,
                                            boolean generateProject) {
        return contractRequest(
                clientId,
                serviceIds,
                implementationFee,
                discount,
                durationMonths,
                generateProject,
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2027, 5, 1)
        );
    }

    private ContractRequest contractRequest(UUID clientId,
                                            List<UUID> serviceIds,
                                            BigDecimal implementationFee,
                                            BigDecimal discount,
                                            int durationMonths,
                                            boolean generateProject,
                                            LocalDate startDate,
                                            LocalDate endDate) {
        return new ContractRequest(
                clientId,
                serviceIds,
                serviceIds == null || serviceIds.isEmpty() ? null : serviceIds.get(0),
                null,
                null,
                "Contrato completo",
                startDate,
                endDate,
                "ativo",
                false,
                null,
                implementationFee,
                discount,
                null,
                durationMonths,
                10,
                null,
                null,
                generateProject,
                true
        );
    }

    private ProjectResponse projectResponse(UUID projectId, UUID clientId, UUID serviceId) {
        Instant now = Instant.now();
        return new ProjectResponse(
                projectId,
                clientId,
                UUID.randomUUID(),
                serviceId,
                "Projeto operacional",
                "Gerado a partir do contrato",
                ProjectStatus.PLANEJAMENTO,
                null,
                null,
                LocalDate.of(2026, 5, 1),
                "MEDIA",
                0,
                LocalDate.of(2026, 6, 1),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                true,
                null,
                null,
                now,
                now
        );
    }

    private Contract contract(UUID contractId, BigDecimal monthlyValue, boolean recurring) {
        Contract contract = new Contract();
        ReflectionTestUtils.setField(contract, "id", contractId);
        contract.setClientId(UUID.randomUUID());
        contract.setPlan("Contrato lifecycle");
        contract.setStartDate(LocalDate.of(2026, 1, 1));
        contract.setEndDate(LocalDate.of(2026, 12, 31));
        contract.setStatus("ativo");
        contract.setMonthlyValue(monthlyValue);
        contract.setImplementationFee(BigDecimal.ZERO);
        contract.setDiscount(BigDecimal.ZERO);
        contract.setTotalValue(monthlyValue.multiply(BigDecimal.valueOf(12)));
        contract.setDurationMonths(recurring ? 12 : 0);
        contract.setRecurring(recurring);
        contract.setMrrLost(BigDecimal.ZERO);
        contract.setActive(true);
        return contract;
    }
}
