package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import br.com.vertxmidia.crm.modules.operations.dto.CrmEventRequest;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CrmEventRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CrmEventServiceTest {

    @Test
    void createMeetingPersistsScheduleDetailsAndAuditsActivity() {
        CrmEventRepository repository = mock(CrmEventRepository.class);
        AuditService auditService = mock(AuditService.class);
        when(repository.save(any(CrmEvent.class))).thenAnswer(invocation -> {
            CrmEvent event = invocation.getArgument(0);
            ReflectionTestUtils.setField(event, "id", UUID.randomUUID());
            return event;
        });

        CrmEventService service = new CrmEventService(repository, auditService);

        var response = service.create(validRequest());

        assertThat(response.type()).isEqualTo("ONLINE");
        assertThat(response.startTime()).isEqualTo(LocalTime.of(14, 0));
        assertThat(response.endTime()).isEqualTo(LocalTime.of(15, 0));
        assertThat(response.responsible()).isEqualTo("Ana");
        assertThat(response.meetingLink()).isEqualTo("https://meet.google.com/abc");
        assertThat(response.contractId()).isNotNull();
        assertThat(response.taskId()).isNotNull();
        assertThat(response.priority()).isEqualTo("alta");
        assertThat(response.recurrenceRule()).isEqualTo("WEEKLY");
        assertThat(response.reminderMinutesBefore()).isEqualTo(30);
        verify(auditService).log("CREATE", "Reuniao", response.id());
    }

    @Test
    void createMeetingRejectsInvalidTimeRange() {
        CrmEventService service = new CrmEventService(mock(CrmEventRepository.class), mock(AuditService.class));
        CrmEventRequest request = new CrmEventRequest(
                UUID.randomUUID(),
                null,
                null,
                null,
                null,
                "ONLINE",
                "Diagnostico",
                LocalDate.now(),
                null,
                null,
                LocalTime.of(15, 0),
                LocalTime.of(14, 0),
                false,
                "agendada",
                "Ana",
                "https://meet.google.com/abc",
                null,
                null,
                "media",
                null,
                "NONE",
                null,
                null,
                15,
                false,
                BigDecimal.ZERO,
                "Briefing",
                "Briefing",
                true
        );

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("termino");
    }

    private CrmEventRequest validRequest() {
        return new CrmEventRequest(
                UUID.randomUUID(),
                null,
                null,
                UUID.randomUUID(),
                UUID.randomUUID(),
                "ONLINE",
                "Diagnostico",
                LocalDate.now().plusDays(1),
                null,
                null,
                LocalTime.of(14, 0),
                LocalTime.of(15, 0),
                false,
                "agendada",
                "Ana",
                "https://meet.google.com/abc",
                null,
                null,
                "alta",
                "#ea59dc",
                "WEEKLY",
                UUID.randomUUID(),
                "Cliente, Ana",
                30,
                false,
                BigDecimal.ZERO,
                "Briefing",
                "Briefing interno",
                true
        );
    }
}
