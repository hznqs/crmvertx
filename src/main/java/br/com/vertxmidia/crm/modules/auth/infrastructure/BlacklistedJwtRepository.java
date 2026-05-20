package br.com.vertxmidia.crm.modules.auth.infrastructure;

import br.com.vertxmidia.crm.modules.auth.domain.BlacklistedJwt;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlacklistedJwtRepository extends JpaRepository<BlacklistedJwt, UUID> {

    boolean existsByJtiAndExpiresAtAfter(String jti, Instant now);

    @Modifying
    @Query("delete from BlacklistedJwt token where token.expiresAt <= :now")
    int deleteExpired(@Param("now") Instant now);
}
