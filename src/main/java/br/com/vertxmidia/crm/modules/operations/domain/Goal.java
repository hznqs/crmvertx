package br.com.vertxmidia.crm.modules.operations.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_goals")
public class Goal extends TimestampedEntity implements OperationResource {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal target = BigDecimal.ZERO;
    @NotNull
    @Column(name = "goal_date", nullable = false)
    private LocalDate date;

    public UUID getId() { return id; }
    public BigDecimal getTarget() { return target; }
    public void setTarget(BigDecimal target) { this.target = target; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
