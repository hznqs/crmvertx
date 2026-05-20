package br.com.vertxmidia.crm.modules.operations.web;

import br.com.vertxmidia.crm.modules.operations.application.CrmEventService;
import br.com.vertxmidia.crm.modules.operations.dto.CrmEventRequest;
import br.com.vertxmidia.crm.modules.operations.dto.CrmEventResponse;
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
@RequestMapping("/api/events")
public class CrmEventController {

    private final CrmEventService service;

    public CrmEventController(CrmEventService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','OPERACIONAL')")
    Page<CrmEventResponse> search(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 50, sort = "date", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return service.search(status, clientId, from, to, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','OPERACIONAL')")
    CrmEventResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','OPERACIONAL')")
    ResponseEntity<CrmEventResponse> create(@Valid @RequestBody CrmEventRequest request) {
        CrmEventResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/events/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','OPERACIONAL')")
    CrmEventResponse update(@PathVariable UUID id, @Valid @RequestBody CrmEventRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
