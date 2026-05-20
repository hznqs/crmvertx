package br.com.vertxmidia.crm.modules.operations.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_client_performance")
public class ClientPerformance extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @Column(name = "client_id")
    private UUID clientId;
    @NotNull
    @Column(name = "metric_date", nullable = false)
    private LocalDate date;
    @Min(0)
    @Column(nullable = false)
    private Integer leads = 0;
    @Min(0)
    @Column(nullable = false)
    private Integer sales = 0;
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal revenue = BigDecimal.ZERO;
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal investment = BigDecimal.ZERO;

    public UUID getId() { return id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Integer getLeads() { return leads; }
    public void setLeads(Integer leads) { this.leads = leads; }
    public Integer getSales() { return sales; }
    public void setSales(Integer sales) { this.sales = sales; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public BigDecimal getInvestment() { return investment; }
    public void setInvestment(BigDecimal investment) { this.investment = investment; }
}
