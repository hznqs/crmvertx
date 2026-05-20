package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.dto.ClientRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientResponse;
import br.com.vertxmidia.crm.modules.client.infrastructure.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientService {

    private final ClientRepository repository;
    private final AuditService auditService;

    public ClientService(ClientRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(ClientResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ClientResponse> search(String search, String phase, Pageable pageable) {
        return repository.findAll(ClientSpecifications.byFilters(search, phase), pageable)
                .map(ClientResponse::from);
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(UUID id) {
        return ClientResponse.from(getClient(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ClientResponse create(ClientRequest request) {
        Client client = new Client();
        apply(request, client);
        Client saved = repository.save(client);
        auditService.log("CREATE", "Cliente", saved.getId());
        return ClientResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ClientResponse update(UUID id, ClientRequest request) {
        Client client = getClient(id);
        auditClientChanges(client, request);
        apply(request, client);
        Client saved = repository.save(client);
        auditService.log("UPDATE", "Cliente", saved.getId());
        return ClientResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Cliente nao encontrado");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Cliente", id);
    }

    private Client getClient(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente nao encontrado"));
    }

    private void apply(ClientRequest request, Client client) {
        client.setName(request.name().trim());
        client.setPhase(ClientPhase.from(request.phase()));
        client.setContractValue(request.value());
        client.setContractMonths(request.months());
        client.setContactName(request.contact().trim());
        client.setEmail(request.email().trim().toLowerCase());
        client.setPhone(request.phone().trim());
        client.setNotes(request.notes() == null ? null : request.notes().trim());
    }

    private void auditClientChanges(Client client, ClientRequest request) {
        auditService.logChange("Cliente", client.getId(), "name", client.getName(), request.name().trim());
        auditService.logChange("Cliente", client.getId(), "phase", client.getPhase(), ClientPhase.from(request.phase()));
        auditService.logChange("Cliente", client.getId(), "value", client.getContractValue(), request.value());
        auditService.logChange("Cliente", client.getId(), "months", client.getContractMonths(), request.months());
        auditService.logChange("Cliente", client.getId(), "contact", client.getContactName(), request.contact().trim());
        auditService.logChange("Cliente", client.getId(), "email", client.getEmail(), request.email().trim().toLowerCase());
        auditService.logChange("Cliente", client.getId(), "phone", client.getPhone(), request.phone().trim());
        auditService.logChange("Cliente", client.getId(), "notes", client.getNotes(), request.notes() == null ? null : request.notes().trim());
    }
}
