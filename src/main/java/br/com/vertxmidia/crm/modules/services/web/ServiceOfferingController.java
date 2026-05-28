package br.com.vertxmidia.crm.modules.services.web;

import br.com.vertxmidia.crm.modules.services.application.ServiceOfferingService;
import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import br.com.vertxmidia.crm.modules.services.domain.ServiceCategory;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingFilterRequest;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingRequest;
import br.com.vertxmidia.crm.modules.services.dto.ServiceOfferingResponse;
import jakarta.validation.Valid;
import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/services")
public class ServiceOfferingController {

    private final ServiceOfferingService service;

    public ServiceOfferingController(ServiceOfferingService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'SERVICES')")
    Page<ServiceOfferingResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ServiceCategory category,
            @RequestParam(required = false) ServiceBillingType billingType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @PageableDefault(size = 25, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        ServiceOfferingFilterRequest filter = new ServiceOfferingFilterRequest(
                search,
                category,
                billingType,
                minPrice,
                maxPrice,
                active,
                createdFrom,
                createdTo
        );
        return service.search(filter, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'SERVICES')")
    ServiceOfferingResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'SERVICES')")
    ResponseEntity<ServiceOfferingResponse> create(@Valid @RequestBody ServiceOfferingRequest request) {
        ServiceOfferingResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/services/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'SERVICES')")
    ServiceOfferingResponse update(@PathVariable UUID id, @Valid @RequestBody ServiceOfferingRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'SERVICES')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
