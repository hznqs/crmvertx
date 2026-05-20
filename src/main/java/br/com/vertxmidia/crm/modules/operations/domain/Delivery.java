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
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_deliveries")
public class Delivery extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @Column(name = "client_id")
    private UUID clientId;
    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String type;
    @NotBlank
    @Size(max = 180)
    @Column(nullable = false, length = 180)
    private String title;
    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String owner;
    @NotNull
    @Column(nullable = false)
    private LocalDate deadline;
    @NotBlank
    @Size(max = 40)
    @Column(nullable = false, length = 40)
    private String status;

    public UUID getId() { return id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
