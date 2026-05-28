package br.com.vertxmidia.crm.modules.operations.web;

import br.com.vertxmidia.crm.modules.operations.application.ContractService;
import br.com.vertxmidia.crm.modules.operations.dto.ContractRequest;
import br.com.vertxmidia.crm.modules.operations.dto.ContractResponse;
import br.com.vertxmidia.crm.modules.operations.dto.ContractSummaryResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService service;

    public ContractController(ContractService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'CONTRACTS')")
    Page<ContractResponse> search(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID clientId,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return service.search(status, clientId, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'CONTRACTS')")
    ContractResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/summary")
    @PreAuthorize("@crmPermission.canRead(authentication, 'CONTRACTS')")
    ContractSummaryResponse summary() {
        return service.summary();
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'CONTRACTS')")
    ResponseEntity<ContractResponse> create(@Valid @RequestBody ContractRequest request) {
        ContractResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/contracts/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'CONTRACTS')")
    ContractResponse update(@PathVariable UUID id, @Valid @RequestBody ContractRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'CONTRACTS')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
