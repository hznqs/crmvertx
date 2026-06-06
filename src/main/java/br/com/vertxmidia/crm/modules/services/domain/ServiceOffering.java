package br.com.vertxmidia.crm.modules.services.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(
    name = "crm_service_offerings",
    indexes = {
        @Index(name = "idx_crm_service_offerings_category", columnList = "category"),
        @Index(name = "idx_crm_service_offerings_billing_type", columnList = "billing_type"),
        @Index(name = "idx_crm_service_offerings_active_created", columnList = "active, created_at"),
        @Index(name = "idx_crm_service_offerings_base_price", columnList = "base_price")
    }
)
public class ServiceOffering extends TimestampedEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ServiceCategory category = ServiceCategory.OUTRO;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String notes;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_type", nullable = false, length = 30)
    private ServiceBillingType billingType = ServiceBillingType.PERSONALIZADO;

    @DecimalMin("0.00")
    @Column(name = "base_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Min(0)
    @Max(3650)
    @Column(name = "sla_days", nullable = false)
    private Integer slaDays = 0;

    @DecimalMin("0.00")
    @Column(name = "estimated_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal estimatedHours = BigDecimal.ZERO;

    @Column(name = "default_checklist", columnDefinition = "text")
    private String defaultChecklist;

    @Column(name = "delivery_stages", columnDefinition = "text")
    private String deliveryStages;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "commission_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionPercentage = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "gross_margin_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal grossMarginPercentage = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ServiceCategory getCategory() {
        return category;
    }

    public void setCategory(ServiceCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public ServiceBillingType getBillingType() {
        return billingType;
    }

    public void setBillingType(ServiceBillingType billingType) {
        this.billingType = billingType;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getSlaDays() {
        return slaDays;
    }

    public void setSlaDays(Integer slaDays) {
        this.slaDays = slaDays;
    }

    public BigDecimal getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(BigDecimal estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public String getDefaultChecklist() {
        return defaultChecklist;
    }

    public void setDefaultChecklist(String defaultChecklist) {
        this.defaultChecklist = defaultChecklist;
    }

    public String getDeliveryStages() {
        return deliveryStages;
    }

    public void setDeliveryStages(String deliveryStages) {
        this.deliveryStages = deliveryStages;
    }

    public BigDecimal getCommissionPercentage() {
        return commissionPercentage;
    }

    public void setCommissionPercentage(BigDecimal commissionPercentage) {
        this.commissionPercentage = commissionPercentage;
    }

    public BigDecimal getGrossMarginPercentage() {
        return grossMarginPercentage;
    }

    public void setGrossMarginPercentage(BigDecimal grossMarginPercentage) {
        this.grossMarginPercentage = grossMarginPercentage;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

    public UUID getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(UUID updatedBy) {
        this.updatedBy = updatedBy;
    }
}
