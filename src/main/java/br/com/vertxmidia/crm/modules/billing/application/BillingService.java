package br.com.vertxmidia.crm.modules.billing.application;

import br.com.vertxmidia.crm.modules.billing.dto.BillingClientResponse;
import br.com.vertxmidia.crm.modules.billing.dto.BillingSummaryResponse;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import br.com.vertxmidia.crm.modules.operations.domain.Contract;
import br.com.vertxmidia.crm.modules.operations.infrastructure.ContractRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingService {

    private static final LocalDate MIN_REPORT_DATE = LocalDate.of(1900, 1, 1);
    private static final LocalDate MAX_REPORT_DATE = LocalDate.of(9999, 12, 31);

    private final ClientRepository clients;
    private final ContractRepository contracts;
    private final FinanceEntryRepository financeEntries;

    public BillingService(ClientRepository clients, ContractRepository contracts, FinanceEntryRepository financeEntries) {
        this.clients = clients;
        this.contracts = contracts;
        this.financeEntries = financeEntries;
    }

    @Transactional(readOnly = true)
    public BillingSummaryResponse summary(LocalDate from, LocalDate to) {
        LocalDate periodStart = normalizePeriodStart(from);
        LocalDate periodEnd = normalizePeriodEnd(to);
        List<Contract> activeContracts = contracts.findByStatusAndActiveTrue("ativo");

        List<UUID> clientIds = activeContracts.stream()
                .map(Contract::getClientId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        Map<UUID, Client> clientMap = clients.findAllById(clientIds).stream()
                .collect(Collectors.toMap(Client::getId, c -> c));

        Map<UUID, List<Contract>> contractsByClient = activeContracts.stream()
                .filter(contract -> contract.getClientId() != null)
                .collect(Collectors.groupingBy(Contract::getClientId));

        List<BillingClientResponse> items = contractsByClient.entrySet().stream()
                .map(entry -> {
                    UUID clientId = entry.getKey();
                    List<Contract> clientContracts = entry.getValue();
                    Client client = clientMap.get(clientId);
                    String clientName = client != null ? client.getName() : "Cliente Removido";

                    BigDecimal monthlyValue = clientContracts.stream()
                            .map(Contract::getMonthlyValue)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalValue = clientContracts.stream()
                            .map(Contract::getTotalValue)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    Integer maxMonths = clientContracts.stream()
                            .map(Contract::getDurationMonths)
                            .max(Integer::compareTo)
                            .orElse(1);

                    return new BillingClientResponse(clientId, clientName, monthlyValue, maxMonths, totalValue);
                })
                .sorted((a, b) -> b.totalValue().compareTo(a.totalValue()))
                .toList();

        BigDecimal totalRevenue = items.stream()
                .map(BillingClientResponse::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal mrr = items.stream()
                .map(BillingClientResponse::monthlyValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageTicket = items.isEmpty()
                ? BigDecimal.ZERO
                : mrr.divide(BigDecimal.valueOf(items.size()), 2, RoundingMode.HALF_UP);

        BigDecimal receivedRevenue = financeEntries.sumByTypeAndStatusAndPeriod("receita", "pago", periodStart, periodEnd);
        BigDecimal pendingRevenue = financeEntries.sumByTypeAndStatusAndPeriod("receita", "pendente", periodStart, periodEnd);
        BigDecimal overdueRevenue = financeEntries.sumByTypeAndStatusAndPeriod("receita", "vencido", periodStart, periodEnd);

        return new BillingSummaryResponse(
                totalRevenue, 
                mrr, 
                averageTicket, 
                pendingRevenue, 
                receivedRevenue, 
                overdueRevenue, 
                activeContracts.size(), 
                items
        );
    }

    private LocalDate normalizePeriodStart(LocalDate from) {
        return from == null ? MIN_REPORT_DATE : from;
    }

    private LocalDate normalizePeriodEnd(LocalDate to) {
        return to == null ? MAX_REPORT_DATE : to;
    }
}
