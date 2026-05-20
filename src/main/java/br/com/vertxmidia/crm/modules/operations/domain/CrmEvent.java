package br.com.vertxmidia.crm.modules.operations.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_events")
public class CrmEvent extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @Column(name = "client_id")
    private UUID clientId;
    @NotBlank
    @Size(max = 180)
    @Column(nullable = false, length = 180)
    private String title;
    @NotNull
    @Column(name = "event_date", nullable = false)
    private LocalDate date;
    @Column(name = "event_time")
    private LocalTime time;
    @NotBlank
    @Size(max = 40)
    @Column(nullable = false, length = 40)
    private String status;
    @Column(nullable = false)
    private boolean sale;
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal revenue = BigDecimal.ZERO;

    public UUID getId() { return id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isSale() { return sale; }
    public void setSale(boolean sale) { this.sale = sale; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
}
