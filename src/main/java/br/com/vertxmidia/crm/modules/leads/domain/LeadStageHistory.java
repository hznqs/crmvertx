package br.com.vertxmidia.crm.modules.leads.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(
    name = "crm_lead_stage_history",
    indexes = {
        @Index(name = "idx_crm_lead_stage_history_lead_created", columnList = "lead_id, created_at"),
        @Index(name = "idx_crm_lead_stage_history_changed_by", columnList = "changed_by")
    }
)
public class LeadStageHistory {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "lead_id", nullable = false)
    private UUID leadId;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_stage", length = 30)
    private CommercialStage fromStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_stage", nullable = false, length = 30)
    private CommercialStage toStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private LeadStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private LeadStatus toStatus;

    @Column(length = 240)
    private String reason;

    @Column(name = "changed_by")
    private UUID changedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public UUID getLeadId() {
        return leadId;
    }

    public void setLeadId(UUID leadId) {
        this.leadId = leadId;
    }

    public CommercialStage getFromStage() {
        return fromStage;
    }

    public void setFromStage(CommercialStage fromStage) {
        this.fromStage = fromStage;
    }

    public CommercialStage getToStage() {
        return toStage;
    }

    public void setToStage(CommercialStage toStage) {
        this.toStage = toStage;
    }

    public LeadStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(LeadStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public LeadStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(LeadStatus toStatus) {
        this.toStatus = toStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public UUID getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(UUID changedBy) {
        this.changedBy = changedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
