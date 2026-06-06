package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.CrmEvent;
import br.com.vertxmidia.crm.modules.operations.dto.CrmEventRequest;
import br.com.vertxmidia.crm.modules.operations.dto.CrmEventResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CrmEventRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CrmEventService {

    private final CrmEventRepository repository;
    private final AuditService auditService;

    public CrmEventService(CrmEventRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<CrmEventResponse> search(
            String status,
            String type,
            String responsible,
            UUID clientId,
            UUID leadId,
            UUID projectId,
            UUID contractId,
            UUID taskId,
            String priority,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        Specification<CrmEvent> spec = Specification
                .where(OperationSpecifications.<CrmEvent>equalsText("status", status))
                .and(OperationSpecifications.equalsText("type", type))
                .and(OperationSpecifications.equalsText("priority", priority))
                .and(OperationSpecifications.textLike("responsible", responsible))
                .and(OperationSpecifications.equalsUuid("clientId", clientId))
                .and(OperationSpecifications.equalsUuid("leadId", leadId))
                .and(OperationSpecifications.equalsUuid("projectId", projectId))
                .and(OperationSpecifications.equalsUuid("contractId", contractId))
                .and(OperationSpecifications.equalsUuid("taskId", taskId))
                .and(rangeOverlaps(from, to))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
        return repository.findAll(spec, pageable).map(CrmEventResponse::from);
    }

    @Transactional(readOnly = true)
    public CrmEventResponse findById(UUID id) {
        return CrmEventResponse.from(get(id));
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public CrmEventResponse create(CrmEventRequest request) {
        CrmEvent event = new CrmEvent();
        apply(request, event);
        event.setCreatedBy(currentUserId());
        event.setUpdatedBy(currentUserId());
        CrmEvent saved = repository.save(event);
        auditService.log("CREATE", "Reuniao", saved.getId());
        return CrmEventResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public CrmEventResponse update(UUID id, CrmEventRequest request) {
        CrmEvent event = get(id);
        auditEventChanges(event, request);
        apply(request, event);
        event.setUpdatedBy(currentUserId());
        CrmEvent saved = repository.save(event);
        auditService.log("UPDATE", "Reuniao", saved.getId());
        return CrmEventResponse.from(saved);
    }

    @Transactional
    @CacheEvict(value = "dashboardMetrics", allEntries = true)
    public void delete(UUID id) {
        CrmEvent event = get(id);
        auditService.logChange("Reuniao", event.getId(), "status", event.getStatus(), "cancelada");
        event.setStatus("cancelada");
        event.setCancelledAt(Instant.now());
        event.setUpdatedBy(currentUserId());
        repository.save(event);
        auditService.log("CANCEL", "Reuniao", id);
    }

    private CrmEvent get(UUID id) {
        return repository.findById(id)
                .filter(CrmEvent::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Evento nao encontrado"));
    }

    private void apply(CrmEventRequest request, CrmEvent event) {
        validateMeeting(request, event.getId());
        LocalTime startTime = request.startTime() != null ? request.startTime() : request.time();
        LocalDate endDate = request.endDate() == null ? request.date() : request.endDate();
        boolean allDay = Boolean.TRUE.equals(request.allDay());
        String meetingUrl = firstNonBlank(request.meetingUrl(), request.meetingLink());
        String status = request.status().trim();

        event.setClientId(request.clientId());
        event.setLeadId(request.leadId());
        event.setProjectId(request.projectId());
        event.setContractId(request.contractId());
        event.setTaskId(request.taskId());
        event.setType(request.type() == null || request.type().isBlank() ? "REUNIAO" : request.type().trim());
        event.setTitle(request.title().trim());
        event.setDate(request.date());
        event.setEndDate(endDate);
        event.setTime(allDay ? null : startTime);
        event.setEndTime(allDay ? null : request.endTime());
        event.setAllDay(allDay);
        event.setStatus(status);
        event.setResponsible(blankToNull(request.responsible()));
        event.setMeetingLink(meetingUrl);
        event.setMeetingUrl(meetingUrl);
        event.setLocation(blankToNull(request.location()));
        event.setPriority(request.priority() == null || request.priority().isBlank() ? "media" : request.priority().trim());
        event.setColor(blankToNull(request.color()));
        event.setRecurrenceRule(normalizeRecurrence(request.recurrenceRule()));
        event.setRecurrenceGroupId(request.recurrenceGroupId());
        event.setParticipants(blankToNull(request.participants()));
        event.setReminderMinutesBefore(request.reminderMinutesBefore() == null ? 15 : request.reminderMinutesBefore());
        event.setSale(request.sale());
        event.setRevenue(request.revenue() == null ? BigDecimal.ZERO : request.revenue());
        event.setDescription(blankToNull(request.description()));
        event.setNotes(blankToNull(request.notes()));
        applyLifecycleTimestamps(status, event);
        if (request.active() != null) {
            event.setActive(request.active());
        }
    }

    private void auditEventChanges(CrmEvent event, CrmEventRequest request) {
        LocalTime startTime = request.startTime() != null ? request.startTime() : request.time();
        auditService.logChange("Reuniao", event.getId(), "clientId", event.getClientId(), request.clientId());
        auditService.logChange("Reuniao", event.getId(), "leadId", event.getLeadId(), request.leadId());
        auditService.logChange("Reuniao", event.getId(), "projectId", event.getProjectId(), request.projectId());
        auditService.logChange("Reuniao", event.getId(), "contractId", event.getContractId(), request.contractId());
        auditService.logChange("Reuniao", event.getId(), "taskId", event.getTaskId(), request.taskId());
        auditService.logChange("Reuniao", event.getId(), "type", event.getType(), request.type());
        auditService.logChange("Reuniao", event.getId(), "title", event.getTitle(), request.title().trim());
        auditService.logChange("Reuniao", event.getId(), "date", event.getDate(), request.date());
        auditService.logChange("Reuniao", event.getId(), "endDate", event.getEndDate(), request.endDate() == null ? request.date() : request.endDate());
        auditService.logChange("Reuniao", event.getId(), "startTime", event.getTime(), startTime);
        auditService.logChange("Reuniao", event.getId(), "endTime", event.getEndTime(), request.endTime());
        auditService.logChange("Reuniao", event.getId(), "allDay", event.isAllDay(), Boolean.TRUE.equals(request.allDay()));
        auditService.logChange("Reuniao", event.getId(), "status", event.getStatus(), request.status().trim());
        auditService.logChange("Reuniao", event.getId(), "responsible", event.getResponsible(), blankToNull(request.responsible()));
        auditService.logChange("Reuniao", event.getId(), "meetingLink", event.getMeetingLink(), firstNonBlank(request.meetingUrl(), request.meetingLink()));
        auditService.logChange("Reuniao", event.getId(), "location", event.getLocation(), blankToNull(request.location()));
        auditService.logChange("Reuniao", event.getId(), "priority", event.getPriority(), request.priority());
        auditService.logChange("Reuniao", event.getId(), "recurrenceRule", event.getRecurrenceRule(), request.recurrenceRule());
        auditService.logChange("Reuniao", event.getId(), "reminderMinutesBefore", event.getReminderMinutesBefore(), request.reminderMinutesBefore() == null ? 15 : request.reminderMinutesBefore());
        auditService.logChange("Reuniao", event.getId(), "sale", event.isSale(), request.sale());
        auditService.logChange("Reuniao", event.getId(), "revenue", event.getRevenue(), request.revenue() == null ? BigDecimal.ZERO : request.revenue());
        auditService.logChange("Reuniao", event.getId(), "description", event.getDescription(), blankToNull(request.description()));
        auditService.logChange("Reuniao", event.getId(), "notes", event.getNotes(), blankToNull(request.notes()));
    }

    private void validateMeeting(CrmEventRequest request, UUID eventId) {
        String type = request.type() == null ? "REUNIAO" : request.type().trim();
        LocalTime startTime = request.startTime() != null ? request.startTime() : request.time();
        LocalDate endDate = request.endDate() == null ? request.date() : request.endDate();
        boolean allDay = Boolean.TRUE.equals(request.allDay());

        if (request.date() != null && endDate.isBefore(request.date())) {
            throw new IllegalArgumentException("Data de termino deve ser igual ou maior que a data de inicio");
        }

        if (!allDay && request.endTime() != null && startTime == null) {
            throw new IllegalArgumentException("Horario de inicio e obrigatorio quando houver horario de termino");
        }

        if (!allDay && request.date() != null && request.date().equals(endDate) && startTime != null && request.endTime() != null && !request.endTime().isAfter(startTime)) {
            throw new IllegalArgumentException("Horario de termino deve ser maior que o horario de inicio");
        }

        if ("ONLINE".equals(type) && firstNonBlank(request.meetingUrl(), request.meetingLink()) == null) {
            throw new IllegalArgumentException("Link da reuniao e obrigatorio para reunioes online");
        }

        if ("PRESENCIAL".equals(type) && blankToNull(request.location()) == null) {
            throw new IllegalArgumentException("Local da reuniao e obrigatorio para reunioes presenciais");
        }

        if (request.reminderMinutesBefore() != null && request.reminderMinutesBefore() > 10_080) {
            throw new IllegalArgumentException("Lembrete nao pode ultrapassar 7 dias");
        }

        validateTimeConflict(request, eventId, startTime, endDate, allDay);
    }

    private void validateTimeConflict(CrmEventRequest request, UUID eventId, LocalTime startTime, LocalDate endDate, boolean allDay) {
        String responsible = blankToNull(request.responsible());
        if (allDay || responsible == null || startTime == null || request.endTime() == null) {
            return;
        }

        long conflicts = repository.countConflictingEvents(eventId, responsible, request.date(), endDate, startTime, request.endTime());
        if (conflicts > 0) {
            throw new IllegalArgumentException("Responsavel ja possui evento nesse horario");
        }
    }

    private Specification<CrmEvent> rangeOverlaps(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) {
                return cb.conjunction();
            }

            var eventDate = root.<LocalDate>get("date");
            var effectiveEndDate = cb.<LocalDate>coalesce(root.<LocalDate>get("endDate"), eventDate);
            if (from != null && to != null) {
                return cb.and(cb.lessThanOrEqualTo(eventDate, to), cb.greaterThanOrEqualTo(effectiveEndDate, from));
            }

            if (from != null) {
                return cb.greaterThanOrEqualTo(effectiveEndDate, from);
            }

            return cb.lessThanOrEqualTo(eventDate, to);
        };
    }

    private void applyLifecycleTimestamps(String status, CrmEvent event) {
        if ("cancelada".equals(status)) {
            event.setCancelledAt(event.getCancelledAt() == null ? Instant.now() : event.getCancelledAt());
        } else {
            event.setCancelledAt(null);
        }

        if ("executada".equals(status) || "realizada".equals(status)) {
            event.setCompletedAt(event.getCompletedAt() == null ? Instant.now() : event.getCompletedAt());
        } else {
            event.setCompletedAt(null);
        }
    }

    private String normalizeRecurrence(String recurrenceRule) {
        String value = blankToNull(recurrenceRule);
        if (value == null || "NONE".equals(value)) {
            return null;
        }
        return value;
    }

    private String firstNonBlank(String firstValue, String secondValue) {
        String first = blankToNull(firstValue);
        return first == null ? blankToNull(secondValue) : first;
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

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
