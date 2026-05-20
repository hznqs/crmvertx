package br.com.vertxmidia.crm.modules.organization.dto;

import br.com.vertxmidia.crm.modules.organization.domain.Organization;
import java.time.Instant;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String document,
        String website,
        String address,
        Instant updatedAt
) {
    public static OrganizationResponse from(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getEmail(),
                organization.getPhone(),
                organization.getDocument(),
                organization.getWebsite(),
                organization.getAddress(),
                organization.getUpdatedAt()
        );
    }
}
