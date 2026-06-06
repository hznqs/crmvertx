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
    @Size(max = 160)
    @Column(name = "seller_name", length = 160)
    private String sellerName;
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
    @Column(name = "implementation_fee", nullable = false, precision = 14, scale = 2)
    private BigDecimal implementationFee = BigDecimal.ZERO;
    @Column(name = "discount_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;
    @Column(name = "total_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalValue = BigDecimal.ZERO;
    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths = 1;
    @Column(name = "billing_due_day")
    private Integer billingDueDay;
    @Size(max = 80)
    @Column(name = "payment_method", length = 80)
    private String paymentMethod;
    @Column(columnDefinition = "text")
    private String notes;
    @Column(name = "cancelled_at")
    private LocalDate cancelledAt;
    @Column(name = "ended_at")
    private LocalDate endedAt;
    @Column(name = "cancellation_reason", columnDefinition = "text")
    private String cancellationReason;
    @Column(name = "churn_reason", columnDefinition = "text")
    private String churnReason;
    @Column(name = "non_renewal_reason", columnDefinition = "text")
    private String nonRenewalReason;
    @Column(name = "is_recurring", nullable = false)
    private boolean recurring;
    @Column(name = "mrr_lost", nullable = false, precision = 14, scale = 2)
    private BigDecimal mrrLost = BigDecimal.ZERO;
    @Column(name = "renewed_from_contract_id")
    private UUID renewedFromContractId;
    @Column(name = "renewed_to_contract_id")
    private UUID renewedToContractId;
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
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
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
    public BigDecimal getImplementationFee() { return implementationFee; }
    public void setImplementationFee(BigDecimal implementationFee) { this.implementationFee = implementationFee; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    public Integer getBillingDueDay() { return billingDueDay; }
    public void setBillingDueDay(Integer billingDueDay) { this.billingDueDay = billingDueDay; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDate cancelledAt) { this.cancelledAt = cancelledAt; }
    public LocalDate getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDate endedAt) { this.endedAt = endedAt; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public String getChurnReason() { return churnReason; }
    public void setChurnReason(String churnReason) { this.churnReason = churnReason; }
    public String getNonRenewalReason() { return nonRenewalReason; }
    public void setNonRenewalReason(String nonRenewalReason) { this.nonRenewalReason = nonRenewalReason; }
    public boolean isRecurring() { return recurring; }
    public void setRecurring(boolean recurring) { this.recurring = recurring; }
    public BigDecimal getMrrLost() { return mrrLost; }
    public void setMrrLost(BigDecimal mrrLost) { this.mrrLost = mrrLost; }
    public UUID getRenewedFromContractId() { return renewedFromContractId; }
    public void setRenewedFromContractId(UUID renewedFromContractId) { this.renewedFromContractId = renewedFromContractId; }
    public UUID getRenewedToContractId() { return renewedToContractId; }
    public void setRenewedToContractId(UUID renewedToContractId) { this.renewedToContractId = renewedToContractId; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
