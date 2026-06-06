package br.com.vertxmidia.crm.modules.operations.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_contract_service_items")
public class ContractServiceItem extends TimestampedEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @NotNull
    @Column(name = "contract_id", nullable = false)
    private UUID contractId;

    @Column(name = "service_id")
    private UUID serviceId;

    @NotBlank
    @Size(max = 160)
    @Column(name = "service_name_snapshot", nullable = false, length = 160)
    private String serviceNameSnapshot;

    @NotNull
    @Column(name = "service_value_snapshot", nullable = false, precision = 14, scale = 2)
    private BigDecimal serviceValueSnapshot = BigDecimal.ZERO;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_type_snapshot", nullable = false, length = 30)
    private ServiceBillingType billingTypeSnapshot = ServiceBillingType.MENSAL;

    @Column(name = "service_active_snapshot", nullable = false)
    private boolean serviceActiveSnapshot = true;

    @Min(1)
    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() {
        return id;
    }

    public UUID getContractId() {
        return contractId;
    }

    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }

    public UUID getServiceId() {
        return serviceId;
    }

    public void setServiceId(UUID serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceNameSnapshot() {
        return serviceNameSnapshot;
    }

    public void setServiceNameSnapshot(String serviceNameSnapshot) {
        this.serviceNameSnapshot = serviceNameSnapshot;
    }

    public BigDecimal getServiceValueSnapshot() {
        return serviceValueSnapshot;
    }

    public void setServiceValueSnapshot(BigDecimal serviceValueSnapshot) {
        this.serviceValueSnapshot = serviceValueSnapshot;
    }

    public ServiceBillingType getBillingTypeSnapshot() {
        return billingTypeSnapshot;
    }

    public void setBillingTypeSnapshot(ServiceBillingType billingTypeSnapshot) {
        this.billingTypeSnapshot = billingTypeSnapshot;
    }

    public boolean isServiceActiveSnapshot() {
        return serviceActiveSnapshot;
    }

    public void setServiceActiveSnapshot(boolean serviceActiveSnapshot) {
        this.serviceActiveSnapshot = serviceActiveSnapshot;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
