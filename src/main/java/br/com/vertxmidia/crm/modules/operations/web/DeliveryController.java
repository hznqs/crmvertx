package br.com.vertxmidia.crm.modules.operations.web;

import br.com.vertxmidia.crm.modules.operations.application.DeliveryService;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryRequest;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryResponse;
import br.com.vertxmidia.crm.modules.operations.dto.DeliveryStatusUpdateRequest;
import br.com.vertxmidia.crm.modules.operations.dto.DeliverySummaryResponse;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService service;

    public DeliveryController(DeliveryService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'DELIVERIES')")
    Page<DeliveryResponse> search(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) UUID clientId,
            @PageableDefault(size = 50, sort = "deadline", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return service.search(status, owner, clientId, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'DELIVERIES')")
    DeliveryResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/summary")
    @PreAuthorize("@crmPermission.canRead(authentication, 'DELIVERIES')")
    DeliverySummaryResponse summary(
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) String owner
    ) {
        return service.summary(clientId, owner);
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'DELIVERIES')")
    ResponseEntity<DeliveryResponse> create(@Valid @RequestBody DeliveryRequest request) {
        DeliveryResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/deliveries/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'DELIVERIES')")
    DeliveryResponse update(@PathVariable UUID id, @Valid @RequestBody DeliveryRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'DELIVERIES')")
    DeliveryResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody DeliveryStatusUpdateRequest request) {
        return service.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'DELIVERIES')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
