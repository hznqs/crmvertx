package br.com.vertxmidia.crm.modules.client.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ClientPhaseConverter implements AttributeConverter<ClientPhase, String> {

    @Override
    public String convertToDatabaseColumn(ClientPhase attribute) {
        return attribute == null ? null : attribute.value();
    }

    @Override
    public ClientPhase convertToEntityAttribute(String dbData) {
        return dbData == null ? null : ClientPhase.from(dbData);
    }
}
