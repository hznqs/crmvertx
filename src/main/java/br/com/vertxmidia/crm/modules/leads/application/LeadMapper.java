package br.com.vertxmidia.crm.modules.leads.application;

import br.com.vertxmidia.crm.modules.leads.domain.Lead;
import br.com.vertxmidia.crm.modules.leads.dto.LeadCreateRequest;
import br.com.vertxmidia.crm.modules.leads.dto.LeadResponse;
import br.com.vertxmidia.crm.modules.leads.dto.LeadUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class LeadMapper {

    public Lead toEntity(LeadCreateRequest request) {
        Lead lead = new Lead();
        applyCreateRequest(request, lead);
        return lead;
    }

    public void updateEntity(LeadUpdateRequest request, Lead lead) {
        applySharedFields(
                lead,
                request.name(),
                request.companyName(),
                request.email(),
                request.phone(),
                request.origin(),
                request.segment(),
                request.temperature(),
                request.potentialValue(),
                request.responsibleUserId(),
                request.notes()
        );
        lead.setStatus(request.status());
        lead.setCommercialStage(request.commercialStage());
        lead.setLostReason(normalizeNullable(request.lostReason()));
    }

    public LeadResponse toResponse(Lead lead) {
        return new LeadResponse(
                lead.getId(),
                lead.getName(),
                lead.getCompanyName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getOrigin(),
                lead.getSegment(),
                lead.getTemperature(),
                lead.getPotentialValue(),
                lead.getResponsibleUserId(),
                lead.getNotes(),
                lead.getStatus(),
                lead.getCommercialStage(),
                lead.getLostReason(),
                lead.getConvertedAt(),
                lead.isActive(),
                lead.getCreatedBy(),
                lead.getUpdatedBy(),
                lead.getCreatedAt(),
                lead.getUpdatedAt()
        );
    }

    private void applyCreateRequest(LeadCreateRequest request, Lead lead) {
        applySharedFields(
                lead,
                request.name(),
                request.companyName(),
                request.email(),
                request.phone(),
                request.origin(),
                request.segment(),
                request.temperature(),
                request.potentialValue(),
                request.responsibleUserId(),
                request.notes()
        );
    }

    private void applySharedFields(Lead lead,
                                   String name,
                                   String companyName,
                                   String email,
                                   String phone,
                                   br.com.vertxmidia.crm.modules.leads.domain.LeadOrigin origin,
                                   String segment,
                                   br.com.vertxmidia.crm.modules.leads.domain.LeadTemperature temperature,
                                   java.math.BigDecimal potentialValue,
                                   java.util.UUID responsibleUserId,
                                   String notes) {
        lead.setName(name.trim());
        lead.setCompanyName(normalizeNullable(companyName));
        lead.setEmail(normalizeEmail(email));
        lead.setPhone(normalizeNullable(phone));
        lead.setOrigin(origin);
        lead.setSegment(normalizeNullable(segment));
        lead.setTemperature(temperature);
        lead.setPotentialValue(potentialValue);
        lead.setResponsibleUserId(responsibleUserId);
        lead.setNotes(normalizeNullable(notes));
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
