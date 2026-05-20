package br.com.vertxmidia.crm.modules.auth.web;

import br.com.vertxmidia.crm.modules.auth.application.AuthService;
import br.com.vertxmidia.crm.modules.auth.application.CurrentUserService;
import br.com.vertxmidia.crm.modules.auth.application.ProfileService;
import br.com.vertxmidia.crm.modules.auth.dto.AuthUserResponse;
import br.com.vertxmidia.crm.modules.auth.dto.ChangePasswordRequest;
import br.com.vertxmidia.crm.modules.auth.dto.LoginRequest;
import br.com.vertxmidia.crm.modules.auth.dto.LoginResponse;
import br.com.vertxmidia.crm.modules.auth.dto.LogoutRequest;
import br.com.vertxmidia.crm.modules.auth.dto.ProfileUpdateRequest;
import br.com.vertxmidia.crm.modules.auth.dto.RefreshTokenRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;
    private final ProfileService profileService;

    public AuthController(AuthService authService, CurrentUserService currentUserService, ProfileService profileService) {
        this.authService = authService;
        this.currentUserService = currentUserService;
        this.profileService = profileService;
    }

    @PostMapping("/login")
    LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    LoginResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    ResponseEntity<Void> logout(@AuthenticationPrincipal Jwt jwt, @RequestBody(required = false) LogoutRequest request) {
        authService.logout(jwt, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    AuthUserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return currentUserService.findFromJwt(jwt);
    }

    @PutMapping("/me")
    AuthUserResponse updateProfile(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfileUpdateRequest request) {
        return profileService.update(jwt, request);
    }

    @PostMapping("/change-password")
    ResponseEntity<Void> changePassword(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(jwt, request);
        return ResponseEntity.noContent().build();
    }
}
