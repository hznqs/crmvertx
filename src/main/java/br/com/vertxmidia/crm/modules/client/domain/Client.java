package br.com.vertxmidia.crm.modules.client.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_clients")
public class Client {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, length = 160)
    private String name;

    @Convert(converter = ClientPhaseConverter.class)
    @Column(nullable = false, length = 40)
    private ClientPhase phase;

    @Column(name = "contract_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal contractValue;

    @Column(name = "contract_months", nullable = false)
    private Integer contractMonths;

    @Column(name = "contact_name", nullable = false, length = 160)
    private String contactName;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ClientPhase getPhase() {
        return phase;
    }

    public void setPhase(ClientPhase phase) {
        this.phase = phase;
    }

    public BigDecimal getContractValue() {
        return contractValue;
    }

    public void setContractValue(BigDecimal contractValue) {
        this.contractValue = contractValue;
    }

    public Integer getContractMonths() {
        return contractMonths;
    }

    public void setContractMonths(Integer contractMonths) {
        this.contractMonths = contractMonths;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
