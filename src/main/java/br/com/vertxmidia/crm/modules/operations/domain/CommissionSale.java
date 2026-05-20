package br.com.vertxmidia.crm.modules.operations.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_commission_sales")
public class CommissionSale extends TimestampedEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(length = 180)
    private String client;

    @DecimalMin("0.00")
    @Column(name = "sale_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal value = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "commission_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal percent = BigDecimal.ZERO;

    @Min(0)
    @Column(nullable = false)
    private int goal;

    public UUID getId() { return id; }
    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }
    public String getClient() { return client; }
    public void setClient(String client) { this.client = client; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public BigDecimal getPercent() { return percent; }
    public void setPercent(BigDecimal percent) { this.percent = percent; }
    public int getGoal() { return goal; }
    public void setGoal(int goal) { this.goal = goal; }
}
