package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.auth.domain.AppUser;
import br.com.vertxmidia.crm.modules.auth.dto.AuthUserResponse;
import br.com.vertxmidia.crm.modules.auth.dto.ChangePasswordRequest;
import br.com.vertxmidia.crm.modules.auth.dto.ProfileUpdateRequest;
import br.com.vertxmidia.crm.modules.auth.infrastructure.AppUserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public ProfileService(AppUserRepository users, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public AuthUserResponse update(Jwt jwt, ProfileUpdateRequest request) {
        AppUser user = currentUser(jwt);
        user.setName(request.name().trim());
        user.setPosition(request.position() == null ? null : request.position().trim());
        user.setPhotoUrl(request.photoUrl() == null ? null : request.photoUrl().trim());
        AppUser saved = users.save(user);
        auditService.log("UPDATE_PROFILE", "Usuario", saved.getId());
        return AuthUserResponse.from(saved);
    }

    @Transactional
    public void changePassword(Jwt jwt, ChangePasswordRequest request) {
        AppUser user = currentUser(jwt);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Senha atual invalida");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        users.save(user);
        auditService.log("CHANGE_PASSWORD", "Usuario", user.getId());
    }

    private AppUser currentUser(Jwt jwt) {
        return users.findById(UUID.fromString(jwt.getSubject()))
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado nao encontrado"));
    }
}
