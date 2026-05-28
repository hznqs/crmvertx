package br.com.vertxmidia.crm.security;

import br.com.vertxmidia.crm.modules.auth.domain.UserRole;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component("crmPermission")
public class CrmPermission {

    private final Map<CrmModule, Set<UserRole>> readRoles = new EnumMap<>(CrmModule.class);
    private final Map<CrmModule, Set<UserRole>> writeRoles = new EnumMap<>(CrmModule.class);
    private final Map<CrmModule, Set<UserRole>> manageRoles = new EnumMap<>(CrmModule.class);

    public CrmPermission() {
        configureEnterpriseMatrix();
    }

    public boolean canRead(Authentication authentication, String module) {
        return isAllowed(authentication, CrmModule.from(module), readRoles);
    }

    public boolean canWrite(Authentication authentication, String module) {
        return isAllowed(authentication, CrmModule.from(module), writeRoles);
    }

    public boolean canManage(Authentication authentication, String module) {
        return isAllowed(authentication, CrmModule.from(module), manageRoles);
    }

    private void configureEnterpriseMatrix() {
        allow(CrmModule.AUDIT, roles(UserRole.ADMIN, UserRole.GESTOR), roles(), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.BILLING, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.UPLOADS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.OPERACIONAL, UserRole.FINANCEIRO, UserRole.SUPORTE), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.OPERACIONAL, UserRole.FINANCEIRO, UserRole.SUPORTE), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.OPERACIONAL));

        allow(CrmModule.LEADS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.CLIENTS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.OPERACIONAL, UserRole.FINANCEIRO, UserRole.SUPORTE), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.SERVICES, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.OPERACIONAL, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.PROJECTS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.OPERACIONAL, UserRole.FINANCEIRO, UserRole.SUPORTE), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.OPERACIONAL), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.TASKS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.OPERACIONAL, UserRole.COMERCIAL, UserRole.SUPORTE), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.OPERACIONAL), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.CONTRACTS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.FINANCE, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.DELIVERIES, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.OPERACIONAL, UserRole.COMERCIAL, UserRole.SUPORTE), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.OPERACIONAL), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.TEAM, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.OPERACIONAL), roles(UserRole.ADMIN, UserRole.GESTOR), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.COMMISSIONS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.FINANCEIRO));
        allow(CrmModule.AGENDA, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.OPERACIONAL, UserRole.SUPORTE), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.OPERACIONAL), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.GOALS, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.DASHBOARD, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.FINANCEIRO, UserRole.OPERACIONAL), roles(), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.PERFORMANCE, roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL, UserRole.FINANCEIRO), roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.COMERCIAL), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.ORGANIZATION, roles(UserRole.ADMIN, UserRole.GESTOR), roles(UserRole.ADMIN, UserRole.GESTOR), roles(UserRole.ADMIN, UserRole.GESTOR));
        allow(CrmModule.SETTINGS, roles(UserRole.ADMIN, UserRole.GESTOR), roles(UserRole.ADMIN, UserRole.GESTOR), roles(UserRole.ADMIN, UserRole.GESTOR));
    }

    private void allow(CrmModule module, Set<UserRole> readers, Set<UserRole> writers, Set<UserRole> managers) {
        readRoles.put(module, withLegacyManagers(readers));
        writeRoles.put(module, withLegacyManagers(writers));
        manageRoles.put(module, withLegacyManagers(managers));
    }

    private boolean isAllowed(Authentication authentication, CrmModule module, Map<CrmModule, Set<UserRole>> matrix) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        Set<UserRole> roles = matrix.getOrDefault(module, Set.of());
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(this::normalizeAuthority)
                .flatMap(Optional::stream)
                .anyMatch(roles::contains);
    }

    private Optional<UserRole> normalizeAuthority(String authority) {
        String role = authority == null ? "" : authority.replaceFirst("^ROLE_", "");
        try {
            return Optional.of(UserRole.valueOf(role));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private Set<UserRole> roles(UserRole... roles) {
        return roles.length == 0 ? EnumSet.noneOf(UserRole.class) : EnumSet.of(roles[0], roles);
    }

    private Set<UserRole> withLegacyManagers(Set<UserRole> roles) {
        EnumSet<UserRole> normalizedRoles = roles.isEmpty() ? EnumSet.noneOf(UserRole.class) : EnumSet.copyOf(roles);
        if (normalizedRoles.contains(UserRole.GESTOR)) {
            normalizedRoles.add(UserRole.MANAGER);
        }
        return normalizedRoles;
    }
}
