package br.com.vertxmidia.crm.modules.leads.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(
    name = "crm_leads",
    indexes = {
        @Index(name = "idx_crm_leads_origin", columnList = "origin"),
        @Index(name = "idx_crm_leads_temperature", columnList = "temperature"),
        @Index(name = "idx_crm_leads_status_stage", columnList = "status, commercial_stage"),
        @Index(name = "idx_crm_leads_responsible", columnList = "responsible_user_id"),
        @Index(name = "idx_crm_leads_active_created", columnList = "active, created_at")
    }
)
public class Lead extends TimestampedEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String name;

    @Size(max = 160)
    @Column(name = "company_name", length = 160)
    private String companyName;

    @Size(max = 180)
    @Column(length = 180)
    private String email;

    @Size(max = 40)
    @Column(length = 40)
    private String phone;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private LeadOrigin origin = LeadOrigin.OUTRO;

    @Size(max = 100)
    @Column(length = 100)
    private String segment;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeadTemperature temperature = LeadTemperature.MORNO;

    @DecimalMin("0.00")
    @Column(name = "potential_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal potentialValue = BigDecimal.ZERO;

    @Column(name = "responsible_user_id")
    private UUID responsibleUserId;

    @Column(columnDefinition = "text")
    private String notes;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LeadStatus status = LeadStatus.ACTIVE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "commercial_stage", nullable = false, length = 30)
    private CommercialStage commercialStage = CommercialStage.NOVO;

    @Size(max = 240)
    @Column(name = "lost_reason", length = 240)
    private String lostReason;

    @Column(name = "converted_at")
    private Instant convertedAt;

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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LeadOrigin getOrigin() {
        return origin;
    }

    public void setOrigin(LeadOrigin origin) {
        this.origin = origin;
    }

    public String getSegment() {
        return segment;
    }

    public void setSegment(String segment) {
        this.segment = segment;
    }

    public LeadTemperature getTemperature() {
        return temperature;
    }

    public void setTemperature(LeadTemperature temperature) {
        this.temperature = temperature;
    }

    public BigDecimal getPotentialValue() {
        return potentialValue;
    }

    public void setPotentialValue(BigDecimal potentialValue) {
        this.potentialValue = potentialValue;
    }

    public UUID getResponsibleUserId() {
        return responsibleUserId;
    }

    public void setResponsibleUserId(UUID responsibleUserId) {
        this.responsibleUserId = responsibleUserId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(LeadStatus status) {
        this.status = status;
    }

    public CommercialStage getCommercialStage() {
        return commercialStage;
    }

    public void setCommercialStage(CommercialStage commercialStage) {
        this.commercialStage = commercialStage;
    }

    public String getLostReason() {
        return lostReason;
    }

    public void setLostReason(String lostReason) {
        this.lostReason = lostReason;
    }

    public Instant getConvertedAt() {
        return convertedAt;
    }

    public void setConvertedAt(Instant convertedAt) {
        this.convertedAt = convertedAt;
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
