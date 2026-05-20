package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.infrastructure.DeliveryRepository;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DeliveryServiceTest {

    @Test
    void summaryCountsStatusesAndLateDeliveriesWithFilters() {
        DeliveryRepository repository = mock(DeliveryRepository.class);
        UUID clientId = UUID.randomUUID();
        String owner = "ana";

        when(repository.countByStatusAndFilters("pendente", clientId, owner)).thenReturn(4L);
        when(repository.countByStatusAndFilters("producao", clientId, owner)).thenReturn(3L);
        when(repository.countByStatusAndFilters("revisao", clientId, owner)).thenReturn(2L);
        when(repository.countByStatusAndFilters("aprovado", clientId, owner)).thenReturn(8L);
        when(repository.countLateByFilters(eq(LocalDate.now()), eq(clientId), eq(owner))).thenReturn(1L);

        DeliveryService service = new DeliveryService(repository, mock(AuditService.class));

        var summary = service.summary(clientId, " ana ");

        assertThat(summary.pending()).isEqualTo(4);
        assertThat(summary.production()).isEqualTo(3);
        assertThat(summary.review()).isEqualTo(2);
        assertThat(summary.approved()).isEqualTo(8);
        assertThat(summary.late()).isEqualTo(1);
    }
}
