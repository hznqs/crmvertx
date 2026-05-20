package br.com.vertxmidia.crm.modules.auth.dto;

public record LogoutRequest(
        String refreshToken,
        boolean revokeAllSessions
) {
}
