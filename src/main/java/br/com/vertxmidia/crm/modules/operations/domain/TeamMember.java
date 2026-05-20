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
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_team_members")
public class TeamMember extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String name;
    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String role;
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

    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
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
}
