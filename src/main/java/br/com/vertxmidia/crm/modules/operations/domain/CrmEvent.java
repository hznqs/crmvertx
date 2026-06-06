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
import java.time.Instant;
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
    @Column(name = "lead_id")
    private UUID leadId;
    @Column(name = "project_id")
    private UUID projectId;
    @Column(name = "contract_id")
    private UUID contractId;
    @Column(name = "task_id")
    private UUID taskId;
    @Column(nullable = false, length = 40)
    private String type = "REUNIAO";
    @NotBlank
    @Size(max = 180)
    @Column(nullable = false, length = 180)
    private String title;
    @NotNull
    @Column(name = "event_date", nullable = false)
    private LocalDate date;
    @Column(name = "end_date")
    private LocalDate endDate;
    @Column(name = "event_time")
    private LocalTime time;
    @Column(name = "end_time")
    private LocalTime endTime;
    @Column(name = "all_day", nullable = false)
    private boolean allDay;
    @NotBlank
    @Size(max = 40)
    @Column(nullable = false, length = 40)
    private String status;
    @Size(max = 180)
    @Column(length = 180)
    private String responsible;
    @Size(max = 500)
    @Column(name = "meeting_link", length = 500)
    private String meetingLink;
    @Size(max = 500)
    @Column(name = "meeting_url", length = 500)
    private String meetingUrl;
    @Size(max = 240)
    @Column(length = 240)
    private String location;
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String priority = "media";
    @Size(max = 24)
    @Column(length = 24)
    private String color;
    @Size(max = 80)
    @Column(name = "recurrence_rule", length = 80)
    private String recurrenceRule;
    @Column(name = "recurrence_group_id")
    private UUID recurrenceGroupId;
    @Column(columnDefinition = "text")
    private String participants;
    @Column(name = "reminder_minutes_before")
    private Integer reminderMinutesBefore = 15;
    @Column(nullable = false)
    private boolean sale;
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal revenue = BigDecimal.ZERO;
    @Column(columnDefinition = "text")
    private String notes;
    @Column(columnDefinition = "text")
    private String description;
    @Column(nullable = false)
    private boolean active = true;
    @Column(name = "cancelled_at")
    private Instant cancelledAt;
    @Column(name = "completed_at")
    private Instant completedAt;
    @Column(name = "created_by")
    private UUID createdBy;
    @Column(name = "updated_by")
    private UUID updatedBy;

    public UUID getId() { return id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public UUID getLeadId() { return leadId; }
    public void setLeadId(UUID leadId) { this.leadId = leadId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public UUID getContractId() { return contractId; }
    public void setContractId(UUID contractId) { this.contractId = contractId; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public boolean isAllDay() { return allDay; }
    public void setAllDay(boolean allDay) { this.allDay = allDay; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public String getMeetingUrl() { return meetingUrl; }
    public void setMeetingUrl(String meetingUrl) { this.meetingUrl = meetingUrl; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getRecurrenceRule() { return recurrenceRule; }
    public void setRecurrenceRule(String recurrenceRule) { this.recurrenceRule = recurrenceRule; }
    public UUID getRecurrenceGroupId() { return recurrenceGroupId; }
    public void setRecurrenceGroupId(UUID recurrenceGroupId) { this.recurrenceGroupId = recurrenceGroupId; }
    public String getParticipants() { return participants; }
    public void setParticipants(String participants) { this.participants = participants; }
    public Integer getReminderMinutesBefore() { return reminderMinutesBefore; }
    public void setReminderMinutesBefore(Integer reminderMinutesBefore) { this.reminderMinutesBefore = reminderMinutesBefore; }
    public boolean isSale() { return sale; }
    public void setSale(boolean sale) { this.sale = sale; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Instant getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Instant cancelledAt) { this.cancelledAt = cancelledAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
