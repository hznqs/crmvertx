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
@Table(name = "crm_contracts")
public class Contract extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @Column(name = "client_id")
    private UUID clientId;
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

    public UUID getId() { return id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
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
}
