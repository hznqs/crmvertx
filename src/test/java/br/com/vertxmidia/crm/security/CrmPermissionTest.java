package br.com.vertxmidia.crm.security;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import static org.assertj.core.api.Assertions.assertThat;

class CrmPermissionTest {

    private final CrmPermission permission = new CrmPermission();

    @Test
    void restrictsAuditToAdminAndManagers() {
        assertThat(permission.canRead(auth("ADMIN"), "AUDIT")).isTrue();
        assertThat(permission.canRead(auth("GESTOR"), "AUDIT")).isTrue();
        assertThat(permission.canRead(auth("FINANCEIRO"), "AUDIT")).isFalse();
        assertThat(permission.canRead(auth("SUPORTE"), "AUDIT")).isFalse();
    }

    @Test
    void allowsFinanceUsersToReadBillingWithoutManagingIt() {
        assertThat(permission.canRead(auth("FINANCEIRO"), "BILLING")).isTrue();
        assertThat(permission.canWrite(auth("FINANCEIRO"), "BILLING")).isTrue();
        assertThat(permission.canManage(auth("FINANCEIRO"), "BILLING")).isFalse();
    }

    @Test
    void allowsSupportToUploadButNotDeleteFiles() {
        assertThat(permission.canRead(auth("SUPORTE"), "UPLOADS")).isTrue();
        assertThat(permission.canWrite(auth("SUPORTE"), "UPLOADS")).isTrue();
        assertThat(permission.canManage(auth("SUPORTE"), "UPLOADS")).isFalse();
    }

    @Test
    void ignoresUnknownAuthoritiesSafely() {
        TestingAuthenticationToken token = new TestingAuthenticationToken(
                "user",
                "password",
                List.of(new SimpleGrantedAuthority("SCOPE_crm"), new SimpleGrantedAuthority("ROLE_SUPORTE"))
        );
        token.setAuthenticated(true);

        assertThat(permission.canRead(token, "UPLOADS")).isTrue();
        assertThat(permission.canRead(token, "AUDIT")).isFalse();
    }

    private TestingAuthenticationToken auth(String role) {
        TestingAuthenticationToken token = new TestingAuthenticationToken(
                "user",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        token.setAuthenticated(true);
        return token;
    }
}
