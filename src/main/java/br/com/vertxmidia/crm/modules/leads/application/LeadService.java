package br.com.vertxmidia.crm.modules.leads.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.client.application.ClientService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.dto.ClientRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientResponse;
import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.Lead;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStageHistory;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import br.com.vertxmidia.crm.modules.leads.dto.LeadCreateRequest;
import br.com.vertxmidia.crm.modules.leads.dto.LeadConversionResponse;
import br.com.vertxmidia.crm.modules.leads.dto.LeadFilterRequest;
import br.com.vertxmidia.crm.modules.leads.dto.LeadResponse;
import br.com.vertxmidia.crm.modules.leads.dto.LeadStageHistoryResponse;
import br.com.vertxmidia.crm.modules.leads.dto.LeadStageUpdateRequest;
import br.com.vertxmidia.crm.modules.leads.dto.LeadUpdateRequest;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadRepository;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadStageHistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LeadService {

    private static final BigDecimal STRATEGIC_VALUE_THRESHOLD = new BigDecimal("10000.00");
    private static final int DEFAULT_CONTRACT_MONTHS = 1;

    private final LeadRepository repository;
    private final LeadStageHistoryRepository stageHistoryRepository;
    private final LeadMapper mapper;
    private final ClientService clientService;
    private final AuditService auditService;

    public LeadService(LeadRepository repository,
                       LeadStageHistoryRepository stageHistoryRepository,
                       LeadMapper mapper,
                       ClientService clientService,
                       AuditService auditService) {
        this.repository = repository;
        this.stageHistoryRepository = stageHistoryRepository;
        this.mapper = mapper;
        this.clientService = clientService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<LeadResponse> search(LeadFilterRequest filter, Pageable pageable) {
        return repository.findAll(LeadSpecifications.byFilters(filter), pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public LeadResponse findById(UUID id) {
        return mapper.toResponse(getActiveLead(id));
    }

    @Transactional(readOnly = true)
    public List<LeadStageHistoryResponse> history(UUID id) {
        getActiveLead(id);
        return stageHistoryRepository.findTop50ByLeadIdOrderByCreatedAtDesc(id)
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public LeadResponse create(LeadCreateRequest request) {
        validateUniqueEmail(request.email(), null);
        Lead lead = mapper.toEntity(request);
        lead.setCreatedBy(currentUserId());
        lead.setUpdatedBy(currentUserId());

        Lead saved = repository.save(lead);
        auditService.log("CREATE", "Lead", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public LeadResponse update(UUID id, LeadUpdateRequest request) {
        Lead lead = getActiveLead(id);
        assertLeadCanBeEdited(lead);
        assertDirectConversionIsNotRequested(request);
        validateUniqueEmail(request.email(), id);
        auditLeadChanges(lead, request);

        mapper.updateEntity(request, lead);
        lead.setUpdatedBy(currentUserId());
        Lead saved = repository.save(lead);
        auditService.log("UPDATE", "Lead", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public LeadResponse updateStage(UUID id, LeadStageUpdateRequest request) {
        Lead lead = getActiveLead(id);
        assertLeadCanBeEdited(lead);

        CommercialStage oldStage = lead.getCommercialStage();
        LeadStatus oldStatus = lead.getStatus();
        String oldLostReason = lead.getLostReason();

        lead.setCommercialStage(request.commercialStage());
        if (request.commercialStage() == CommercialStage.PERDIDO) {
            lead.setStatus(LeadStatus.LOST);
            lead.setLostReason(request.lostReason().trim());
        } else if (lead.getStatus() == LeadStatus.LOST) {
            lead.setStatus(LeadStatus.ACTIVE);
            lead.setLostReason(null);
        }
        lead.setUpdatedBy(currentUserId());

        saveStageHistory(lead, oldStage, oldStatus, oldLostReason);
        auditService.logChange("Lead", lead.getId(), "commercialStage", oldStage, lead.getCommercialStage());
        auditService.logChange("Lead", lead.getId(), "status", oldStatus, lead.getStatus());
        auditService.logChange("Lead", lead.getId(), "lostReason", oldLostReason, lead.getLostReason());
        Lead saved = repository.save(lead);
        auditService.log("STAGE_UPDATE", "Lead", saved.getId());
        return mapper.toResponse(saved);
    }

    private void saveStageHistory(Lead lead, CommercialStage oldStage, LeadStatus oldStatus, String oldLostReason) {
        LeadStageHistory history = new LeadStageHistory();
        history.setLeadId(lead.getId());
        history.setFromStage(oldStage);
        history.setToStage(lead.getCommercialStage());
        history.setFromStatus(oldStatus);
        history.setToStatus(lead.getStatus());
        history.setReason(lead.getCommercialStage() == CommercialStage.PERDIDO ? lead.getLostReason() : oldLostReason);
        history.setChangedBy(currentUserId());
        stageHistoryRepository.save(history);
    }

    private LeadStageHistoryResponse toHistoryResponse(LeadStageHistory history) {
        return new LeadStageHistoryResponse(
                history.getId(),
                history.getLeadId(),
                history.getFromStage(),
                history.getToStage(),
                history.getFromStatus(),
                history.getToStatus(),
                history.getReason(),
                history.getChangedBy(),
                history.getCreatedAt()
        );
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public LeadConversionResponse convert(UUID id) {
        Lead lead = getActiveLead(id);
        assertLeadCanBeEdited(lead);

        CommercialStage oldStage = lead.getCommercialStage();
        LeadStatus oldStatus = lead.getStatus();
        String oldLostReason = lead.getLostReason();

        ClientResponse client = clientService.create(buildClientRequest(lead));

        auditService.logChange("Lead", lead.getId(), "status", lead.getStatus(), LeadStatus.CONVERTED);
        auditService.logChange("Lead", lead.getId(), "commercialStage", lead.getCommercialStage(), CommercialStage.FECHADO);
        auditService.logChange("Lead", lead.getId(), "convertedClientId", null, client.id());

        lead.setStatus(LeadStatus.CONVERTED);
        lead.setCommercialStage(CommercialStage.FECHADO);
        lead.setLostReason(null);
        lead.setConvertedAt(Instant.now());
        lead.setUpdatedBy(currentUserId());

        saveStageHistory(lead, oldStage, oldStatus, oldLostReason);
        Lead saved = repository.save(lead);
        auditService.log("CONVERT_TO_CLIENT", "Lead", saved.getId());
        return new LeadConversionResponse(mapper.toResponse(saved), client);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        Lead lead = getActiveLead(id);
        assertLeadCanBeEdited(lead);

        lead.setActive(false);
        lead.setStatus(LeadStatus.INACTIVE);
        lead.setUpdatedBy(currentUserId());
        repository.save(lead);
        auditService.log("SOFT_DELETE", "Lead", id);
    }

    private Lead getActiveLead(UUID id) {
        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Lead nao encontrado"));
    }

    private void validateUniqueEmail(String email, UUID currentLeadId) {
        if (email == null || email.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        boolean exists = currentLeadId == null
                ? repository.existsByEmailIgnoreCaseAndActiveTrue(normalizedEmail)
                : repository.existsByEmailIgnoreCaseAndActiveTrueAndIdNot(normalizedEmail, currentLeadId);
        if (exists) {
            throw new IllegalArgumentException("Ja existe um lead ativo com este email");
        }
    }

    private void assertLeadCanBeEdited(Lead lead) {
        if (lead.getStatus() == LeadStatus.CONVERTED) {
            throw new IllegalArgumentException("Lead convertido nao pode ser alterado diretamente");
        }
    }

    private void assertDirectConversionIsNotRequested(LeadUpdateRequest request) {
        if (request.status() == LeadStatus.CONVERTED) {
            throw new IllegalArgumentException("Use o endpoint de conversao para converter um lead");
        }
    }

    private ClientRequest buildClientRequest(Lead lead) {
        return new ClientRequest(
                clientNameFrom(lead),
                "fechado",
                lead.getPotentialValue() == null ? BigDecimal.ZERO : lead.getPotentialValue(),
                DEFAULT_CONTRACT_MONTHS,
                lead.getName(),
                lead.getEmail(),
                lead.getPhone(),
                null,
                null,
                lead.getSegment(),
                ClientStatus.ATIVO,
                clientPriorityFrom(lead),
                "lead-convertido",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                lead.getId(),
                conversionNotesFrom(lead)
        );
    }

    private String clientNameFrom(Lead lead) {
        String companyName = normalizeNullable(lead.getCompanyName());
        return companyName == null ? lead.getName() : companyName;
    }

    private ClientPriority clientPriorityFrom(Lead lead) {
        BigDecimal potentialValue = lead.getPotentialValue() == null ? BigDecimal.ZERO : lead.getPotentialValue();
        if (potentialValue.compareTo(STRATEGIC_VALUE_THRESHOLD) >= 0) {
            return ClientPriority.ESTRATEGICA;
        }
        return switch (lead.getTemperature()) {
            case QUENTE -> ClientPriority.ALTA;
            case MORNO -> ClientPriority.MEDIA;
            case FRIO -> ClientPriority.BAIXA;
        };
    }

    private String conversionNotesFrom(Lead lead) {
        String notes = normalizeNullable(lead.getNotes());
        String conversionNote = "Cliente criado automaticamente a partir do lead " + lead.getId() + ".";
        return notes == null ? conversionNote : notes + "\n\n" + conversionNote;
    }

    private void auditLeadChanges(Lead lead, LeadUpdateRequest request) {
        auditService.logChange("Lead", lead.getId(), "name", lead.getName(), request.name().trim());
        auditService.logChange("Lead", lead.getId(), "companyName", lead.getCompanyName(), normalizeNullable(request.companyName()));
        auditService.logChange("Lead", lead.getId(), "email", lead.getEmail(), normalizeEmail(request.email()));
        auditService.logChange("Lead", lead.getId(), "phone", lead.getPhone(), normalizeNullable(request.phone()));
        auditService.logChange("Lead", lead.getId(), "origin", lead.getOrigin(), request.origin());
        auditService.logChange("Lead", lead.getId(), "segment", lead.getSegment(), normalizeNullable(request.segment()));
        auditService.logChange("Lead", lead.getId(), "temperature", lead.getTemperature(), request.temperature());
        auditService.logChange("Lead", lead.getId(), "potentialValue", lead.getPotentialValue(), request.potentialValue());
        auditService.logChange("Lead", lead.getId(), "responsibleUserId", lead.getResponsibleUserId(), request.responsibleUserId());
        auditService.logChange("Lead", lead.getId(), "notes", lead.getNotes(), normalizeNullable(request.notes()));
        auditService.logChange("Lead", lead.getId(), "status", lead.getStatus(), request.status());
        auditService.logChange("Lead", lead.getId(), "commercialStage", lead.getCommercialStage(), request.commercialStage());
        auditService.logChange("Lead", lead.getId(), "lostReason", lead.getLostReason(), normalizeNullable(request.lostReason()));
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

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
