package br.com.vertxmidia.crm.modules.billing.web;

import br.com.vertxmidia.crm.modules.billing.application.BillingService;
import br.com.vertxmidia.crm.modules.billing.dto.BillingSummaryResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService service;

    public BillingController(BillingService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    @PreAuthorize("@crmPermission.canRead(authentication, 'BILLING')")
    BillingSummaryResponse summary() {
        return service.summary();
    }
}
