package br.com.vertxmidia.crm.modules.auth.dto;

public record LoginResponse(
        String tokenType,
        String accessToken,
        String refreshToken,
        long expiresIn,
        AuthUserResponse user
) {
}
