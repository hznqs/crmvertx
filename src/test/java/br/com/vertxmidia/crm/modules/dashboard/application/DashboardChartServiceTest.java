package br.com.vertxmidia.crm.modules.dashboard.application;

import br.com.vertxmidia.crm.modules.operations.infrastructure.CrmEventRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardChartServiceTest {

    @Test
    void revenueByDayReturnsContinuousSeriesWithZeroDays() {
        FinanceEntryRepository financeEntries = mock(FinanceEntryRepository.class);
        CrmEventRepository events = mock(CrmEventRepository.class);
        LocalDate from = LocalDate.of(2026, 5, 1);
        LocalDate to = LocalDate.of(2026, 5, 3);

        when(financeEntries.revenueByDay("receita", "pago", from, to)).thenReturn(Arrays.asList(
                new Object[] { from, new BigDecimal("1000.00") },
                new Object[] { to, new BigDecimal("3000.00") }
        ));

        DashboardChartService service = new DashboardChartService(financeEntries, events);

        var series = service.revenueByDay(from, to);

        assertThat(series).hasSize(3);
        assertThat(series.get(0).date()).isEqualTo(from);
        assertThat(series.get(0).revenue()).isEqualByComparingTo("1000.00");
        assertThat(series.get(1).date()).isEqualTo(LocalDate.of(2026, 5, 2));
        assertThat(series.get(1).revenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(series.get(2).date()).isEqualTo(to);
        assertThat(series.get(2).revenue()).isEqualByComparingTo("3000.00");
    }

    @Test
    void meetingsSalesByDayMergesMeetingsAndClosingsIntoContinuousSeries() {
        FinanceEntryRepository financeEntries = mock(FinanceEntryRepository.class);
        CrmEventRepository events = mock(CrmEventRepository.class);
        LocalDate from = LocalDate.of(2026, 5, 10);
        LocalDate to = LocalDate.of(2026, 5, 12);

        when(events.countByDayBetween("executada", from, to)).thenReturn(Arrays.asList(
                new Object[] { from, 2L },
                new Object[] { to, 1L }
        ));
        when(events.countSalesByDayBetween(from, to)).thenReturn(List.<Object[]>of(
                new Object[] { LocalDate.of(2026, 5, 11), 1L }
        ));

        DashboardChartService service = new DashboardChartService(financeEntries, events);

        var series = service.meetingsSalesByDay(from, to);

        assertThat(series).hasSize(3);
        assertThat(series.get(0).meetings()).isEqualTo(2);
        assertThat(series.get(0).closings()).isZero();
        assertThat(series.get(1).meetings()).isZero();
        assertThat(series.get(1).closings()).isEqualTo(1);
        assertThat(series.get(2).meetings()).isEqualTo(1);
        assertThat(series.get(2).closings()).isZero();
    }

    @Test
    void rejectsInvalidDateRange() {
        DashboardChartService service = new DashboardChartService(
                mock(FinanceEntryRepository.class),
                mock(CrmEventRepository.class)
        );

        assertThatThrownBy(() -> service.revenueByDay(LocalDate.of(2026, 5, 2), LocalDate.of(2026, 5, 1)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Data final");
    }
}
