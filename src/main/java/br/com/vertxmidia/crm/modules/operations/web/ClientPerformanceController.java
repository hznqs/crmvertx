package br.com.vertxmidia.crm.modules.operations.web;

import br.com.vertxmidia.crm.modules.operations.application.ClientPerformanceService;
import br.com.vertxmidia.crm.modules.operations.dto.ClientPerformanceRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ClientPerformanceResponse;
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
@RequestMapping("/api/performance-records")
public class ClientPerformanceController {

    private final ClientPerformanceService service;

    public ClientPerformanceController(ClientPerformanceService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    Page<ClientPerformanceResponse> search(
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 50, sort = "date", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return service.search(clientId, from, to, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    ClientPerformanceResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL')")
    ResponseEntity<ClientPerformanceResponse> create(@Valid @RequestBody ClientPerformanceRequest request) {
        ClientPerformanceResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/performance-records/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL')")
    ClientPerformanceResponse update(@PathVariable UUID id, @Valid @RequestBody ClientPerformanceRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
