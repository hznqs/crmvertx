package br.com.vertxmidia.crm.modules.tasks.web;

import br.com.vertxmidia.crm.modules.tasks.application.TaskService;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskPriority;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskFilterRequest;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskRequest;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskResponse;
import br.com.vertxmidia.crm.modules.tasks.dto.TaskStatusUpdateRequest;
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
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'TASKS')")
    Page<TaskResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) UUID deliveryId,
            @RequestParam(required = false) UUID responsibleUserId,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @PageableDefault(size = 25, sort = "dueDate", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        TaskFilterRequest filter = new TaskFilterRequest(
                search,
                projectId,
                deliveryId,
                responsibleUserId,
                priority,
                status,
                dueFrom,
                dueTo,
                active,
                createdFrom,
                createdTo
        );
        return service.search(filter, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'TASKS')")
    TaskResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'TASKS')")
    ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        TaskResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/tasks/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'TASKS')")
    TaskResponse update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'TASKS')")
    TaskResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody TaskStatusUpdateRequest request) {
        return service.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'TASKS')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
