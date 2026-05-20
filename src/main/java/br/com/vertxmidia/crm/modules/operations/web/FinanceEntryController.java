package br.com.vertxmidia.crm.modules.operations.web;

import br.com.vertxmidia.crm.modules.operations.application.FinanceEntryService;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryRequest;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceEntryResponse;
import br.com.vertxmidia.crm.modules.operations.dto.FinanceSummaryResponse;
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
@RequestMapping("/api/finance-entries")
public class FinanceEntryController {

    private final FinanceEntryService service;

    public FinanceEntryController(FinanceEntryService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','FINANCEIRO')")
    Page<FinanceEntryResponse> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 50, sort = "due", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return service.search(type, status, from, to, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','FINANCEIRO')")
    FinanceEntryResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','FINANCEIRO')")
    FinanceSummaryResponse summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.summary(from, to);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','FINANCEIRO')")
    ResponseEntity<FinanceEntryResponse> create(@Valid @RequestBody FinanceEntryRequest request) {
        FinanceEntryResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/finance-entries/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','FINANCEIRO')")
    FinanceEntryResponse update(@PathVariable UUID id, @Valid @RequestBody FinanceEntryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
