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
import java.time.Instant;
import java.time.LocalDate;
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
    @Column(nullable = false, length = 40)
    private String type = "VENDA";
    @Column(nullable = false, length = 40)
    private String status = "PENDENTE";
    @Column(name = "contract_id")
    private UUID contractId;
    @Column(name = "finance_entry_id")
    private UUID financeEntryId;

    @Column(name = "client_id")
    private UUID clientId;

    @Column(length = 180)
    private String client;

    @DecimalMin("0.00")
    @Column(name = "sale_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal value = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "commission_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal percent = BigDecimal.ZERO;

    @Column(name = "calculation_type", nullable = false, length = 20)
    private String calculationType = "PERCENTUAL";

    @DecimalMin("0.00")
    @Column(name = "fixed_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal fixedValue = BigDecimal.ZERO;

    @Column(name = "reference_month")
    private LocalDate referenceMonth;

    @Min(0)
    @Column(nullable = false)
    private int goal;
    @Column(name = "paid_at")
    private Instant paidAt;
    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() { return id; }
    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getContractId() { return contractId; }
    public void setContractId(UUID contractId) { this.contractId = contractId; }
    public UUID getFinanceEntryId() { return financeEntryId; }
    public void setFinanceEntryId(UUID financeEntryId) { this.financeEntryId = financeEntryId; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public String getClient() { return client; }
    public void setClient(String client) { this.client = client; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public BigDecimal getPercent() { return percent; }
    public void setPercent(BigDecimal percent) { this.percent = percent; }
    public String getCalculationType() { return calculationType; }
    public void setCalculationType(String calculationType) { this.calculationType = calculationType; }
    public BigDecimal getFixedValue() { return fixedValue; }
    public void setFixedValue(BigDecimal fixedValue) { this.fixedValue = fixedValue; }
    public LocalDate getReferenceMonth() { return referenceMonth; }
    public void setReferenceMonth(LocalDate referenceMonth) { this.referenceMonth = referenceMonth; }
    public int getGoal() { return goal; }
    public void setGoal(int goal) { this.goal = goal; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
