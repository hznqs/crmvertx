package br.com.vertxmidia.crm.modules.client.web;

import br.com.vertxmidia.crm.modules.client.application.ClientService;
import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import br.com.vertxmidia.crm.modules.client.dto.ClientFilterRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientPhaseUpdateRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.Instant;
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
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService service;

    public ClientController(ClientService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'CLIENTS')")
    Page<ClientResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String phase,
            @RequestParam(required = false) String document,
            @RequestParam(required = false) DocumentType documentType,
            @RequestParam(required = false) String segment,
            @RequestParam(required = false) ClientStatus status,
            @RequestParam(required = false) ClientPriority priority,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @PageableDefault(size = 25, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        ClientFilterRequest filter = new ClientFilterRequest(
                search,
                phase,
                document,
                documentType,
                segment,
                status,
                priority,
                city,
                state,
                tag,
                active,
                createdFrom,
                createdTo
        );
        return service.search(filter, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'CLIENTS')")
    ClientResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'CLIENTS')")
    ResponseEntity<ClientResponse> create(@Valid @RequestBody ClientRequest request) {
        ClientResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/clients/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'CLIENTS')")
    ClientResponse update(@PathVariable UUID id, @Valid @RequestBody ClientRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/phase")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'CLIENTS')")
    ClientResponse updatePhase(@PathVariable UUID id, @Valid @RequestBody ClientPhaseUpdateRequest request) {
        return service.updatePhase(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'CLIENTS')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
