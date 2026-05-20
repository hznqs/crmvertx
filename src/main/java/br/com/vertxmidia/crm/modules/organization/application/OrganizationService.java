package br.com.vertxmidia.crm.modules.organization.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.organization.domain.Organization;
import br.com.vertxmidia.crm.modules.organization.dto.OrganizationRequest;
import br.com.vertxmidia.crm.modules.organization.dto.OrganizationResponse;
import br.com.vertxmidia.crm.modules.organization.infrastructure.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationService {

    private final OrganizationRepository repository;
    private final AuditService auditService;

    public OrganizationService(OrganizationRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional
    public OrganizationResponse get() {
        return OrganizationResponse.from(current());
    }

    @Transactional
    public OrganizationResponse save(OrganizationRequest request) {
        Organization organization = current();
        auditOrganizationChanges(organization, request);
        apply(request, organization);
        Organization saved = repository.save(organization);
        auditService.log("UPDATE_ORGANIZATION", "Organizacao", saved.getId());
        return OrganizationResponse.from(saved);
    }

    private Organization current() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            Organization organization = new Organization();
            organization.setName("VertX Midia");
            return repository.save(organization);
        });
    }

    private void apply(OrganizationRequest request, Organization organization) {
        organization.setName(request.name().trim());
        organization.setEmail(blankToNull(request.email()));
        organization.setPhone(blankToNull(request.phone()));
        organization.setDocument(blankToNull(request.document()));
        organization.setWebsite(blankToNull(request.website()));
        organization.setAddress(blankToNull(request.address()));
    }

    private void auditOrganizationChanges(Organization organization, OrganizationRequest request) {
        auditService.logChange("Organizacao", organization.getId(), "name", organization.getName(), request.name().trim());
        auditService.logChange("Organizacao", organization.getId(), "email", organization.getEmail(), blankToNull(request.email()));
        auditService.logChange("Organizacao", organization.getId(), "phone", organization.getPhone(), blankToNull(request.phone()));
        auditService.logChange("Organizacao", organization.getId(), "document", organization.getDocument(), blankToNull(request.document()));
        auditService.logChange("Organizacao", organization.getId(), "website", organization.getWebsite(), blankToNull(request.website()));
        auditService.logChange("Organizacao", organization.getId(), "address", organization.getAddress(), blankToNull(request.address()));
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
