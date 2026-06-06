package br.com.vertxmidia.crm.modules.admin.web;

import br.com.vertxmidia.crm.modules.admin.application.AdminCleanupService;
import br.com.vertxmidia.crm.modules.admin.dto.AdminCleanupRequest;
import br.com.vertxmidia.crm.modules.admin.dto.AdminCleanupResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminCleanupController {

    private final AdminCleanupService service;

    public AdminCleanupController(AdminCleanupService service) {
        this.service = service;
    }

    @PostMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    AdminCleanupResponse cleanup(@Valid @RequestBody AdminCleanupRequest request) {
        return service.cleanup(request);
    }
}
