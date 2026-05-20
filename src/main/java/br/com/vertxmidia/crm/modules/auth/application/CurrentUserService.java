package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.modules.auth.dto.AuthUserResponse;
import br.com.vertxmidia.crm.modules.auth.infrastructure.AppUserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private final AppUserRepository users;

    public CurrentUserService(AppUserRepository users) {
        this.users = users;
    }

    @Transactional(readOnly = true)
    public AuthUserResponse findFromJwt(Jwt jwt) {
        return users.findById(UUID.fromString(jwt.getSubject()))
                .map(AuthUserResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Usuario nao encontrado"));
    }
}
