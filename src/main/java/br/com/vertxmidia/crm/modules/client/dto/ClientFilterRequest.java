package br.com.vertxmidia.crm.modules.client.dto;

import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import java.time.Instant;

public record ClientFilterRequest(
        String search,
        String phase,
        String document,
        DocumentType documentType,
        String segment,
        ClientStatus status,
        ClientPriority priority,
        String city,
        String state,
        String tag,
        Boolean active,
        Instant createdFrom,
        Instant createdTo
) {
}
