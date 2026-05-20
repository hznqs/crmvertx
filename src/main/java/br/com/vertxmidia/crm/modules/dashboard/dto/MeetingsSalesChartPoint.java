package br.com.vertxmidia.crm.modules.dashboard.dto;

import java.time.LocalDate;

public record MeetingsSalesChartPoint(LocalDate date, long meetings, long closings) {
}
