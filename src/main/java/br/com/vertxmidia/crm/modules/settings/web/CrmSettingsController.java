package br.com.vertxmidia.crm.modules.settings.web;

import br.com.vertxmidia.crm.modules.settings.application.CrmSettingsService;
import br.com.vertxmidia.crm.modules.settings.dto.CrmSettingsRequest;
import br.com.vertxmidia.crm.modules.settings.dto.CrmSettingsResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class CrmSettingsController {

    private final CrmSettingsService service;

    public CrmSettingsController(CrmSettingsService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR')")
    CrmSettingsResponse get() {
        return service.get();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR')")
    CrmSettingsResponse save(@Valid @RequestBody CrmSettingsRequest request) {
        return service.save(request);
    }
}
