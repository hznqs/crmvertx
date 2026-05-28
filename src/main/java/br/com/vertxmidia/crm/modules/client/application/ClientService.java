package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import br.com.vertxmidia.crm.modules.client.dto.ClientFilterRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientPhaseUpdateRequest;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientService {

    private final ClientRepository repository;
    private final ClientMapper mapper;
    private final AuditService auditService;

    public ClientService(ClientRepository repository, ClientMapper mapper, AuditService auditService) {
        this.repository = repository;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .filter(Client::isActive)
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ClientResponse> search(String search, String phase, Pageable pageable) {
        return search(new ClientFilterRequest(search, phase, null, null, null, null, null, null, null, null, true, null, null), pageable);
    }

    @Transactional(readOnly = true)
    public Page<ClientResponse> search(ClientFilterRequest filter, Pageable pageable) {
        ClientFilterRequest normalizedFilter = withDefaultActiveFilter(filter);
        return repository.findAll(ClientSpecifications.byFilters(normalizedFilter), pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(UUID id) {
        return mapper.toResponse(getActiveClient(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ClientResponse create(ClientRequest request) {
        validateDocument(request.document(), null);
        Client client = mapper.toEntity(request);
        client.setCreatedBy(currentUserId());
        client.setUpdatedBy(currentUserId());
        Client saved = repository.save(client);
        auditService.log("CREATE", "Cliente", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ClientResponse update(UUID id, ClientRequest request) {
        Client client = getActiveClient(id);
        validateDocument(request.document(), id);
        auditClientChanges(client, request);
        mapper.updateEntity(request, client);
        client.setUpdatedBy(currentUserId());
        Client saved = repository.save(client);
        auditService.log("UPDATE", "Cliente", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        Client client = getActiveClient(id);
        auditService.logChange("Cliente", client.getId(), "active", client.isActive(), false);
        auditService.logChange("Cliente", client.getId(), "status", client.getStatus(), ClientStatus.INATIVO);
        client.setActive(false);
        client.setStatus(ClientStatus.INATIVO);
        client.setUpdatedBy(currentUserId());
        repository.save(client);
        auditService.log("SOFT_DELETE", "Cliente", id);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public ClientResponse updatePhase(UUID id, ClientPhaseUpdateRequest request) {
        Client client = getActiveClient(id);
        ClientPhase newPhase = ClientPhase.from(request.phase());
        auditService.logChange("Cliente", client.getId(), "phase", client.getPhase(), newPhase);
        client.setPhase(newPhase);
        client.setUpdatedBy(currentUserId());
        Client saved = repository.save(client);
        auditService.log("PHASE_UPDATE", "Cliente", saved.getId());
        return mapper.toResponse(saved);
    }

    private Client getActiveClient(UUID id) {
        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente nao encontrado"));
    }

    private void validateDocument(String document, UUID currentClientId) {
        String normalizedDocument = normalizeDocument(document);
        if (normalizedDocument == null) {
            return;
        }

        boolean exists = currentClientId == null
                ? repository.existsByDocumentAndActiveTrue(normalizedDocument)
                : repository.existsByDocumentAndActiveTrueAndIdNot(normalizedDocument, currentClientId);
        if (exists) {
            throw new IllegalArgumentException("Ja existe um cliente ativo com este CPF/CNPJ");
        }
    }

    private void auditClientChanges(Client client, ClientRequest request) {
        auditService.logChange("Cliente", client.getId(), "name", client.getName(), request.name().trim());
        auditService.logChange("Cliente", client.getId(), "phase", client.getPhase(), ClientPhase.from(request.phase()));
        auditService.logChange("Cliente", client.getId(), "value", client.getContractValue(), request.value());
        auditService.logChange("Cliente", client.getId(), "months", client.getContractMonths(), request.months());
        auditService.logChange("Cliente", client.getId(), "contact", client.getContactName(), request.contact().trim());
        auditService.logChange("Cliente", client.getId(), "email", client.getEmail(), normalizeEmail(request.email()));
        auditService.logChange("Cliente", client.getId(), "phone", client.getPhone(), normalizeNullable(request.phone()));
        auditService.logChange("Cliente", client.getId(), "document", client.getDocument(), normalizeDocument(request.document()));
        auditService.logChange("Cliente", client.getId(), "documentType", client.getDocumentType(), request.documentType() == null ? DocumentType.NAO_INFORMADO : request.documentType());
        auditService.logChange("Cliente", client.getId(), "segment", client.getSegment(), normalizeNullable(request.segment()));
        auditService.logChange("Cliente", client.getId(), "status", client.getStatus(), request.status() == null ? ClientStatus.ATIVO : request.status());
        auditService.logChange("Cliente", client.getId(), "priority", client.getPriority(), request.priority());
        auditService.logChange("Cliente", client.getId(), "tags", client.getTags(), normalizeNullable(request.tags()));
        auditService.logChange("Cliente", client.getId(), "addressStreet", client.getAddressStreet(), normalizeNullable(request.addressStreet()));
        auditService.logChange("Cliente", client.getId(), "addressNumber", client.getAddressNumber(), normalizeNullable(request.addressNumber()));
        auditService.logChange("Cliente", client.getId(), "addressComplement", client.getAddressComplement(), normalizeNullable(request.addressComplement()));
        auditService.logChange("Cliente", client.getId(), "addressDistrict", client.getAddressDistrict(), normalizeNullable(request.addressDistrict()));
        auditService.logChange("Cliente", client.getId(), "addressCity", client.getAddressCity(), normalizeNullable(request.addressCity()));
        auditService.logChange("Cliente", client.getId(), "addressState", client.getAddressState(), normalizeState(request.addressState()));
        auditService.logChange("Cliente", client.getId(), "addressZipCode", client.getAddressZipCode(), normalizeDocument(request.addressZipCode()));
        auditService.logChange("Cliente", client.getId(), "convertedFromLeadId", client.getConvertedFromLeadId(), request.convertedFromLeadId());
        auditService.logChange("Cliente", client.getId(), "notes", client.getNotes(), normalizeNullable(request.notes()));
    }

    private ClientFilterRequest withDefaultActiveFilter(ClientFilterRequest filter) {
        return new ClientFilterRequest(
                filter.search(),
                filter.phase(),
                filter.document(),
                filter.documentType(),
                filter.segment(),
                filter.status(),
                filter.priority(),
                filter.city(),
                filter.state(),
                filter.tag(),
                filter.active() == null ? true : filter.active(),
                filter.createdFrom(),
                filter.createdTo()
        );
    }

    private UUID currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return null;
        }

        try {
            return UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeNullable(value);
        return normalized == null ? null : normalized.toLowerCase();
    }

    private String normalizeState(String value) {
        String normalized = normalizeNullable(value);
        return normalized == null ? null : normalized.toUpperCase();
    }

    private String normalizeDocument(String value) {
        String normalized = normalizeNullable(value);
        return normalized == null ? null : normalized.replaceAll("\\D", "");
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
