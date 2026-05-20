package br.com.vertxmidia.crm.modules.client.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_client_dashboards")
public class ClientDashboard extends TimestampedEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "client_id", nullable = false, unique = true)
    private UUID clientId;

    @Column(columnDefinition = "text")
    private String services;

    @Column(name = "next_steps", columnDefinition = "text")
    private String nextSteps;

    @Column(name = "contact_history", columnDefinition = "text")
    private String history;

    @Column(columnDefinition = "text")
    private String files;

    public UUID getId() { return id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public String getServices() { return services; }
    public void setServices(String services) { this.services = services; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }
    public String getHistory() { return history; }
    public void setHistory(String history) { this.history = history; }
    public String getFiles() { return files; }
    public void setFiles(String files) { this.files = files; }
}
