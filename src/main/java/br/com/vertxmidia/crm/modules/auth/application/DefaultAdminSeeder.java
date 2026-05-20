package br.com.vertxmidia.crm.modules.auth.application;

import br.com.vertxmidia.crm.modules.auth.domain.AppUser;
import br.com.vertxmidia.crm.modules.auth.domain.UserRole;
import br.com.vertxmidia.crm.modules.auth.infrastructure.AppUserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DefaultAdminSeeder implements ApplicationRunner {

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public DefaultAdminSeeder(
            AppUserRepository users,
            PasswordEncoder passwordEncoder,
            Environment environment
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String email = environment.getProperty("ADMIN_EMAIL", "").trim().toLowerCase();
        String password = environment.getProperty("ADMIN_PASSWORD", "");

        if (email.isBlank() || password.isBlank()) {
            return;
        }

        if (users.existsByEmail(email)) {
            return;
        }

        AppUser admin = new AppUser();
        admin.setName(environment.getProperty("ADMIN_NAME", "Administrador VertX"));
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);
        users.save(admin);
    }
}
