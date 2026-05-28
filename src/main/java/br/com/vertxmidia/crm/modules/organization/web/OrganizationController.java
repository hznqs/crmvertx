package br.com.vertxmidia.crm.modules.organization.web;

import br.com.vertxmidia.crm.modules.organization.application.OrganizationService;
import br.com.vertxmidia.crm.modules.organization.dto.OrganizationRequest;
import br.com.vertxmidia.crm.modules.organization.dto.OrganizationResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organization")
public class OrganizationController {

    private final OrganizationService service;

    public OrganizationController(OrganizationService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'ORGANIZATION')")
    OrganizationResponse get() {
        return service.get();
    }

    @PutMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'ORGANIZATION')")
    OrganizationResponse save(@Valid @RequestBody OrganizationRequest request) {
        return service.save(request);
    }
}
