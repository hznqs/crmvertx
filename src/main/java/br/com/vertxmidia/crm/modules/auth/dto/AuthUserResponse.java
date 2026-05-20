package br.com.vertxmidia.crm.modules.auth.dto;

import br.com.vertxmidia.crm.modules.auth.domain.AppUser;
import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String name,
        String email,
        String role,
        String position,
        String photoUrl
) {
    public static AuthUserResponse from(AppUser user) {
        return new AuthUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPosition(),
                user.getPhotoUrl()
        );
    }
}
