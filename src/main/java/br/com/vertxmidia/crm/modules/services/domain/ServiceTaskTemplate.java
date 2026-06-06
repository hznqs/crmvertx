package br.com.vertxmidia.crm.modules.services.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskPriority;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(
    name = "crm_service_task_templates",
    indexes = {
        @Index(name = "idx_crm_service_task_templates_service", columnList = "service_id, active, sort_order")
    }
)
public class ServiceTaskTemplate extends TimestampedEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotNull
    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    @NotBlank
    @Size(max = 180)
    @Column(nullable = false, length = 180)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Min(0)
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "default_priority", nullable = false, length = 20)
    private TaskPriority defaultPriority = TaskPriority.MEDIA;

    @Min(0)
    @Column(name = "estimated_days", nullable = false)
    private Integer estimatedDays = 1;

    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() {
        return id;
    }

    public UUID getServiceId() {
        return serviceId;
    }

    public void setServiceId(UUID serviceId) {
        this.serviceId = serviceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public TaskPriority getDefaultPriority() {
        return defaultPriority;
    }

    public void setDefaultPriority(TaskPriority defaultPriority) {
        this.defaultPriority = defaultPriority;
    }

    public Integer getEstimatedDays() {
        return estimatedDays;
    }

    public void setEstimatedDays(Integer estimatedDays) {
        this.estimatedDays = estimatedDays;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
