package br.com.vertxmidia.crm.modules.operations.web;

import br.com.vertxmidia.crm.modules.operations.application.CommissionSaleService;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionRankingResponse;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionSaleRequest;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionSaleResponse;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionSalesMetricsResponse;
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
@RequestMapping("/api/commission-sales")
public class CommissionSaleController {

    private final CommissionSaleService service;

    public CommissionSaleController(CommissionSaleService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    Page<CommissionSaleResponse> search(
            @RequestParam(required = false) UUID memberId,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return service.search(memberId, pageable);
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    CommissionSalesMetricsResponse metrics(@RequestParam(required = false) UUID memberId) {
        return service.metrics(memberId);
    }

    @GetMapping("/ranking")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    CommissionRankingResponse ranking() {
        return service.ranking();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    CommissionSaleResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    ResponseEntity<CommissionSaleResponse> create(@Valid @RequestBody CommissionSaleRequest request) {
        CommissionSaleResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/commission-sales/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','COMERCIAL','FINANCEIRO')")
    CommissionSaleResponse update(@PathVariable UUID id, @Valid @RequestBody CommissionSaleRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GESTOR','FINANCEIRO')")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
