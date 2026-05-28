package br.com.vertxmidia.crm.modules.operations.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_contracts")
public class Contract extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @Column(name = "client_id")
    private UUID clientId;
    @Column(name = "service_id")
    private UUID serviceId;
    @Column(name = "project_id")
    private UUID projectId;
    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String plan;
    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    @NotBlank
    @Size(max = 40)
    @Column(nullable = false, length = 40)
    private String status;
    @Column(name = "auto_renew", nullable = false)
    private boolean autoRenew;
    @Column(name = "monthly_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal monthlyValue = BigDecimal.ZERO;
    @Column(name = "total_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalValue = BigDecimal.ZERO;
    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths = 1;
    @Column(name = "billing_due_day")
    private Integer billingDueDay;
    @Column(nullable = false)
    private boolean active = true;
    @Column(name = "created_by")
    private UUID createdBy;
    @Column(name = "updated_by")
    private UUID updatedBy;

    public UUID getId() { return id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public UUID getServiceId() { return serviceId; }
    public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isAutoRenew() { return autoRenew; }
    public void setAutoRenew(boolean autoRenew) { this.autoRenew = autoRenew; }
    public BigDecimal getMonthlyValue() { return monthlyValue; }
    public void setMonthlyValue(BigDecimal monthlyValue) { this.monthlyValue = monthlyValue; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    public Integer getBillingDueDay() { return billingDueDay; }
    public void setBillingDueDay(Integer billingDueDay) { this.billingDueDay = billingDueDay; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
