package br.com.vertxmidia.crm.modules.operations.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_team_members")
public class TeamMember extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @Column(name = "user_id")
    private UUID userId;
    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String name;
    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String role;
    @Size(max = 120)
    @Column(name = "function_name", length = 120)
    private String functionName;
    @Column(name = "joined_at")
    private LocalDate joinedAt;
    @Min(0)
    @Column(nullable = false)
    private Integer tasks = 0;
    @Min(0)
    @Column(nullable = false)
    private Integer completed = 0;
    @Min(0)
    @Column(nullable = false)
    private Integer performance = 0;
    @Size(max = 5000)
    @Column(columnDefinition = "text")
    private String notes;
    @Size(max = 10000)
    @Column(name = "task_breakdown", columnDefinition = "text")
    private String taskBreakdown;
    @Size(max = 180)
    @Column(length = 180)
    private String email;
    @Size(max = 40)
    @Column(length = 40)
    private String phone;
    @Column(name = "hourly_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal hourlyCost = BigDecimal.ZERO;
    @Column(name = "capacity_hours_month", nullable = false)
    private Integer capacityHoursMonth = 160;
    @Column(nullable = false)
    private boolean active = true;
    @Column(name = "created_by")
    private UUID createdBy;
    @Column(name = "updated_by")
    private UUID updatedBy;

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFunctionName() { return functionName; }
    public void setFunctionName(String functionName) { this.functionName = functionName; }
    public LocalDate getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDate joinedAt) { this.joinedAt = joinedAt; }
    public Integer getTasks() { return tasks; }
    public void setTasks(Integer tasks) { this.tasks = tasks; }
    public Integer getCompleted() { return completed; }
    public void setCompleted(Integer completed) { this.completed = completed; }
    public Integer getPerformance() { return performance; }
    public void setPerformance(Integer performance) { this.performance = performance; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getTaskBreakdown() { return taskBreakdown; }
    public void setTaskBreakdown(String taskBreakdown) { this.taskBreakdown = taskBreakdown; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public BigDecimal getHourlyCost() { return hourlyCost; }
    public void setHourlyCost(BigDecimal hourlyCost) { this.hourlyCost = hourlyCost; }
    public Integer getCapacityHoursMonth() { return capacityHoursMonth; }
    public void setCapacityHoursMonth(Integer capacityHoursMonth) { this.capacityHoursMonth = capacityHoursMonth; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
