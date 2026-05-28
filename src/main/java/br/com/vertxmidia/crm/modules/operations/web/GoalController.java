package br.com.vertxmidia.crm.modules.operations.web;

import br.com.vertxmidia.crm.modules.operations.application.GoalService;
import br.com.vertxmidia.crm.modules.operations.dto.GoalRequest;
import br.com.vertxmidia.crm.modules.operations.dto.GoalResponse;
import jakarta.validation.Valid;
import java.net.URI;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService service;

    public GoalController(GoalService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'GOALS')")
    Page<GoalResponse> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 25, sort = "date", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return service.search(from, to, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'GOALS')")
    GoalResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'GOALS')")
    ResponseEntity<GoalResponse> create(@Valid @RequestBody GoalRequest request) {
        GoalResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/goals/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'GOALS')")
    GoalResponse update(@PathVariable UUID id, @Valid @RequestBody GoalRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'GOALS')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
