package br.com.vertxmidia.crm.modules.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenueChartPoint(LocalDate date, BigDecimal revenue) {
}
