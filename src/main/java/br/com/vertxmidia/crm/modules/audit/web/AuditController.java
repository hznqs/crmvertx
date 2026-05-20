package br.com.vertxmidia.crm.modules.audit.web;

import br.com.vertxmidia.crm.modules.audit.application.AuditLogSpecifications;
import br.com.vertxmidia.crm.modules.audit.dto.AuditLogResponse;
import br.com.vertxmidia.crm.modules.audit.infrastructure.AuditLogRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogRepository repository;

    public AuditController(AuditLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR')")
    Page<AuditLogResponse> list(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @PageableDefault(size = 25, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Specification<br.com.vertxmidia.crm.modules.audit.domain.AuditLog> spec = AuditLogSpecifications.userId(userId)
                .and(AuditLogSpecifications.action(action))
                .and(AuditLogSpecifications.entity(entity))
                .and(AuditLogSpecifications.from(from))
                .and(AuditLogSpecifications.to(to));
        return repository.findAll(spec, pageable).map(AuditLogResponse::from);
    }
}
