package br.com.vertxmidia.crm.modules.projects.domain;

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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(
    name = "crm_projects",
    indexes = {
        @Index(name = "idx_crm_projects_client", columnList = "client_id"),
        @Index(name = "idx_crm_projects_contract", columnList = "contract_id"),
        @Index(name = "idx_crm_projects_service", columnList = "service_id"),
        @Index(name = "idx_crm_projects_status", columnList = "status"),
        @Index(name = "idx_crm_projects_responsible", columnList = "responsible_user_id"),
        @Index(name = "idx_crm_projects_active_sla", columnList = "active, sla_due_date")
    }
)
public class Project extends TimestampedEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotNull
    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "contract_id")
    private UUID contractId;

    @Column(name = "service_id")
    private UUID serviceId;

    @NotBlank
    @Size(max = 180)
    @Column(nullable = false, length = 180)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProjectStatus status = ProjectStatus.PLANEJAMENTO;

    @Column(name = "responsible_user_id")
    private UUID responsibleUserId;

    @Column(name = "team_member_ids", columnDefinition = "text")
    private String teamMemberIds;

    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private Integer progress = 0;

    @Column(name = "sla_due_date")
    private LocalDate slaDueDate;

    @DecimalMin("0.00")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal budget = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "estimated_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal estimatedCost = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "actual_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal actualCost = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    public UUID getId() {
        return id;
    }

    public UUID getClientId() {
        return clientId;
    }

    public void setClientId(UUID clientId) {
        this.clientId = clientId;
    }

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getServiceId() {
        return serviceId;
    }

    public void setServiceId(UUID serviceId) {
        this.serviceId = serviceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public UUID getResponsibleUserId() {
        return responsibleUserId;
    }

    public void setResponsibleUserId(UUID responsibleUserId) {
        this.responsibleUserId = responsibleUserId;
    }

    public String getTeamMemberIds() {
        return teamMemberIds;
    }

    public void setTeamMemberIds(String teamMemberIds) {
        this.teamMemberIds = teamMemberIds;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public LocalDate getSlaDueDate() {
        return slaDueDate;
    }

    public void setSlaDueDate(LocalDate slaDueDate) {
        this.slaDueDate = slaDueDate;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public BigDecimal getActualCost() {
        return actualCost;
    }

    public void setActualCost(BigDecimal actualCost) {
        this.actualCost = actualCost;
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
