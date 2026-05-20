package br.com.vertxmidia.crm.modules.organization.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "organizations")
public class Organization extends TimestampedEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(length = 180)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(length = 40)
    private String document;

    @Column(length = 200)
    private String website;

    @Column(length = 280)
    private String address;

    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDocument() { return document; }
    public void setDocument(String document) { this.document = document; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
