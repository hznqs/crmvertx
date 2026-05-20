package br.com.vertxmidia.crm.modules.billing.application;

import br.com.vertxmidia.crm.modules.billing.dto.BillingClientResponse;
import br.com.vertxmidia.crm.modules.billing.dto.BillingSummaryResponse;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingService {

    private final ClientRepository clients;

    public BillingService(ClientRepository clients) {
        this.clients = clients;
    }

    @Transactional(readOnly = true)
    public BillingSummaryResponse summary() {
        List<Client> activeClients = clients.findByPhase(
                ClientPhase.FECHADO,
                Sort.by(Sort.Direction.ASC, "name")
        );

        List<BillingClientResponse> items = activeClients.stream()
                .map(this::toBillingClient)
                .toList();

        BigDecimal totalRevenue = items.stream()
                .map(BillingClientResponse::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageTicket = items.isEmpty()
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(items.size()), 2, RoundingMode.HALF_UP);

        return new BillingSummaryResponse(totalRevenue, averageTicket, items.size(), items);
    }

    private BillingClientResponse toBillingClient(Client client) {
        BigDecimal monthlyValue = client.getContractValue() == null ? BigDecimal.ZERO : client.getContractValue();
        Integer months = client.getContractMonths() == null ? 1 : client.getContractMonths();
        return new BillingClientResponse(
                client.getId(),
                client.getName(),
                monthlyValue,
                months,
                monthlyValue.multiply(BigDecimal.valueOf(months))
        );
    }
}
