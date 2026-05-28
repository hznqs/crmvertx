package br.com.vertxmidia.crm.modules.leads.web;

import br.com.vertxmidia.crm.modules.leads.application.LeadService;
import br.com.vertxmidia.crm.modules.leads.domain.CommercialStage;
import br.com.vertxmidia.crm.modules.leads.domain.LeadOrigin;
import br.com.vertxmidia.crm.modules.leads.domain.LeadStatus;
import br.com.vertxmidia.crm.modules.leads.domain.LeadTemperature;
import br.com.vertxmidia.crm.modules.leads.dto.LeadCreateRequest;
import br.com.vertxmidia.crm.modules.leads.dto.LeadConversionResponse;
import br.com.vertxmidia.crm.modules.leads.dto.LeadFilterRequest;
import br.com.vertxmidia.crm.modules.leads.dto.LeadResponse;
import br.com.vertxmidia.crm.modules.leads.dto.LeadStageHistoryResponse;
import br.com.vertxmidia.crm.modules.leads.dto.LeadStageUpdateRequest;
import br.com.vertxmidia.crm.modules.leads.dto.LeadUpdateRequest;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.List;
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
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService service;

    public LeadController(LeadService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'LEADS')")
    Page<LeadResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LeadOrigin origin,
            @RequestParam(required = false) String segment,
            @RequestParam(required = false) LeadTemperature temperature,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) CommercialStage commercialStage,
            @RequestParam(required = false) UUID responsibleUserId,
            @RequestParam(required = false) BigDecimal minPotentialValue,
            @RequestParam(required = false) BigDecimal maxPotentialValue,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 25, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        LeadFilterRequest filter = new LeadFilterRequest(
                search,
                origin,
                segment,
                temperature,
                status,
                commercialStage,
                responsibleUserId,
                minPotentialValue,
                maxPotentialValue,
                createdFrom,
                createdTo,
                active
        );
        return service.search(filter, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmPermission.canRead(authentication, 'LEADS')")
    LeadResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("@crmPermission.canRead(authentication, 'LEADS')")
    List<LeadStageHistoryResponse> history(@PathVariable UUID id) {
        return service.history(id);
    }

    @PostMapping
    @PreAuthorize("@crmPermission.canWrite(authentication, 'LEADS')")
    ResponseEntity<LeadResponse> create(@Valid @RequestBody LeadCreateRequest request) {
        LeadResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/leads/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'LEADS')")
    LeadResponse update(@PathVariable UUID id, @Valid @RequestBody LeadUpdateRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/stage")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'LEADS')")
    LeadResponse updateStage(@PathVariable UUID id, @Valid @RequestBody LeadStageUpdateRequest request) {
        return service.updateStage(id, request);
    }

    @PatchMapping("/{id}/convert")
    @PreAuthorize("@crmPermission.canWrite(authentication, 'LEADS')")
    LeadConversionResponse convert(@PathVariable UUID id) {
        return service.convert(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'LEADS')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
