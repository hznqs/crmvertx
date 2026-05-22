package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.auth.domain.AppUser;
import br.com.vertxmidia.crm.modules.auth.domain.UserRole;
import br.com.vertxmidia.crm.modules.auth.dto.ChangePasswordRequest;
import br.com.vertxmidia.crm.modules.auth.dto.ProfileUpdateRequest;
import br.com.vertxmidia.crm.modules.auth.infrastructure.AppUserRepository;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProfileServiceTest {

    @Test
    void updateTrimsProfileFieldsAndAuditsChange() {
        UUID userId = UUID.randomUUID();
        AppUser user = user(userId);
        AppUserRepository users = mock(AppUserRepository.class);
        AuditService audit = mock(AuditService.class);

        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProfileService service = new ProfileService(users, mock(PasswordEncoder.class), audit);

        var response = service.update(jwt(userId), new ProfileUpdateRequest(
                "  Ana VertX  ",
                "  Gestora Comercial  ",
                "  https://cdn.example.com/foto.png  "
        ));

        assertThat(response.name()).isEqualTo("Ana VertX");
        assertThat(response.position()).isEqualTo("Gestora Comercial");
        assertThat(response.photoUrl()).isEqualTo("https://cdn.example.com/foto.png");
        verify(audit).log("UPDATE_PROFILE", "Usuario", userId);
    }

    @Test
    void changePasswordRejectsInvalidCurrentPassword() {
        UUID userId = UUID.randomUUID();
        AppUser user = user(userId);
        AppUserRepository users = mock(AppUserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);

        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(encoder.matches("senha-antiga", user.getPasswordHash())).thenReturn(false);

        ProfileService service = new ProfileService(users, encoder, mock(AuditService.class));

        assertThatThrownBy(() -> service.changePassword(jwt(userId), new ChangePasswordRequest("senha-antiga", "NovaSenha123")))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Senha atual");
    }

    @Test
    void changePasswordEncodesNewPasswordAndAuditsChange() {
        UUID userId = UUID.randomUUID();
        AppUser user = user(userId);
        AppUserRepository users = mock(AppUserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        AuditService audit = mock(AuditService.class);

        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(encoder.matches("SenhaAtual123", user.getPasswordHash())).thenReturn(true);
        when(encoder.encode("NovaSenha123")).thenReturn("encoded-new-password");

        ProfileService service = new ProfileService(users, encoder, audit);
        service.changePassword(jwt(userId), new ChangePasswordRequest("SenhaAtual123", "NovaSenha123"));

        assertThat(user.getPasswordHash()).isEqualTo("encoded-new-password");
        verify(users).save(user);
        verify(audit).log("CHANGE_PASSWORD", "Usuario", userId);
    }

    private AppUser user(UUID id) {
        AppUser user = new AppUser();
        ReflectionTestUtils.setField(user, "id", id);
        user.setName("Ana");
        user.setEmail("ana@vertx.com");
        user.setPasswordHash("encoded-old-password");
        user.setRole(UserRole.ADMIN);
        user.setEnabled(true);
        return user;
    }

    private Jwt jwt(UUID userId) {
        return new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", userId.toString(), "email", "ana@vertx.com")
        );
    }
}
