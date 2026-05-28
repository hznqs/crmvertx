package br.com.vertxmidia.crm.modules.projects.web;

import br.com.vertxmidia.crm.modules.projects.application.ProjectService;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectFilterRequest;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectRequest;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectResponse;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectStatusUpdateRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'PROJECTS')")
    Page<ProjectResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) UUID contractId,
            @RequestParam(required = false) UUID serviceId,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) UUID responsibleUserId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate slaFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate slaTo,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @PageableDefault(size = 25, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        ProjectFilterRequest filter = new ProjectFilterRequest(
                search,
                clientId,
                contractId,
                serviceId,
                status,
                responsibleUserId,
                slaFrom,
                slaTo,
                active,
                createdFrom,
                createdTo
        );
        return service.search(filter, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'PROJECTS')")
    ProjectResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'PROJECTS')")
    ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/projects/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'PROJECTS')")
    ProjectResponse update(@PathVariable UUID id, @Valid @RequestBody ProjectRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'PROJECTS')")
    ProjectResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody ProjectStatusUpdateRequest request) {
        return service.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'PROJECTS')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
