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
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_finance_entries")
public class FinanceEntry extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @NotBlank
    @Size(max = 40)
    @Column(nullable = false, length = 40)
    private String type;
    @NotBlank
    @Size(max = 40)
    @Column(nullable = false, length = 40)
    private String status;
    @NotBlank
    @Size(max = 220)
    @Column(nullable = false, length = 220)
    private String description;
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal value = BigDecimal.ZERO;
    @NotNull
    @Column(name = "due_date", nullable = false)
    private LocalDate due;
    @Column(nullable = false)
    private boolean recurring;
    @Column(name = "auto_billing", nullable = false)
    private boolean autoBilling;

    public UUID getId() { return id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public LocalDate getDue() { return due; }
    public void setDue(LocalDate due) { this.due = due; }
    public boolean isRecurring() { return recurring; }
    public void setRecurring(boolean recurring) { this.recurring = recurring; }
    public boolean isAutoBilling() { return autoBilling; }
    public void setAutoBilling(boolean autoBilling) { this.autoBilling = autoBilling; }
}
