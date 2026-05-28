package br.com.vertxmidia.crm.modules.client.application;

import br.com.vertxmidia.crm.modules.client.domain.Client;
import br.com.vertxmidia.crm.modules.client.domain.ClientPhase;
import br.com.vertxmidia.crm.modules.client.domain.ClientPriority;
import br.com.vertxmidia.crm.modules.client.domain.ClientStatus;
import br.com.vertxmidia.crm.modules.client.domain.DocumentType;
import br.com.vertxmidia.crm.modules.client.dto.ClientRequest;
import br.com.vertxmidia.crm.modules.client.dto.ClientResponse;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public Client toEntity(ClientRequest request) {
        Client client = new Client();
        updateEntity(request, client);
        return client;
    }

    public void updateEntity(ClientRequest request, Client client) {
        client.setName(request.name().trim());
        client.setPhase(ClientPhase.from(request.phase()));
        client.setContractValue(request.value());
        client.setContractMonths(request.months());
        client.setContactName(request.contact().trim());
        client.setEmail(normalizeEmail(request.email()));
        client.setPhone(normalizeNullable(request.phone()));
        client.setDocument(normalizeDocument(request.document()));
        client.setDocumentType(defaultDocumentType(request.documentType()));
        client.setSegment(normalizeNullable(request.segment()));
        client.setStatus(defaultStatus(request.status()));
        client.setPriority(defaultPriority(request.priority()));
        client.setTags(normalizeNullable(request.tags()));
        client.setAddressStreet(normalizeNullable(request.addressStreet()));
        client.setAddressNumber(normalizeNullable(request.addressNumber()));
        client.setAddressComplement(normalizeNullable(request.addressComplement()));
        client.setAddressDistrict(normalizeNullable(request.addressDistrict()));
        client.setAddressCity(normalizeNullable(request.addressCity()));
        client.setAddressState(normalizeState(request.addressState()));
        client.setAddressZipCode(normalizeDocument(request.addressZipCode()));
        client.setConvertedFromLeadId(request.convertedFromLeadId());
        client.setNotes(normalizeNullable(request.notes()));
    }

    public ClientResponse toResponse(Client client) {
        return ClientResponse.from(client);
    }

    private ClientStatus defaultStatus(ClientStatus status) {
        return status == null ? ClientStatus.ATIVO : status;
    }

    private ClientPriority defaultPriority(ClientPriority priority) {
        return priority == null ? ClientPriority.MEDIA : priority;
    }

    private DocumentType defaultDocumentType(DocumentType documentType) {
        return documentType == null ? DocumentType.NAO_INFORMADO : documentType;
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeNullable(value);
        return normalized == null ? null : normalized.toLowerCase();
    }

    private String normalizeState(String value) {
        String normalized = normalizeNullable(value);
        return normalized == null ? null : normalized.toUpperCase();
    }

    private String normalizeDocument(String value) {
        String normalized = normalizeNullable(value);
        return normalized == null ? null : normalized.replaceAll("\\D", "");
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
