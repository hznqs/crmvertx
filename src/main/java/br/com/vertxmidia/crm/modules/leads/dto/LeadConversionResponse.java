package br.com.vertxmidia.crm.modules.leads.dto;

import br.com.vertxmidia.crm.modules.client.dto.ClientResponse;

public record LeadConversionResponse(
        LeadResponse lead,
        ClientResponse client
) {
}
