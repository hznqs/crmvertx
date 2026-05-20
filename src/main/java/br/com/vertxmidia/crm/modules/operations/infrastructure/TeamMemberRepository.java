package br.com.vertxmidia.crm.modules.operations.infrastructure;

import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID>, JpaSpecificationExecutor<TeamMember> {
    @Query("""
            select count(member)
            from TeamMember member
            where (:role is null or :role = '' or lower(member.role) = lower(:role))
              and (:search is null or :search = '' or lower(member.name) like concat('%', lower(:search), '%'))
            """)
    long countByFilters(String role, String search);

    @Query("""
            select coalesce(sum(member.tasks), 0)
            from TeamMember member
            where (:role is null or :role = '' or lower(member.role) = lower(:role))
              and (:search is null or :search = '' or lower(member.name) like concat('%', lower(:search), '%'))
            """)
    long sumTasksByFilters(String role, String search);

    @Query("""
            select coalesce(sum(member.completed), 0)
            from TeamMember member
            where (:role is null or :role = '' or lower(member.role) = lower(:role))
              and (:search is null or :search = '' or lower(member.name) like concat('%', lower(:search), '%'))
            """)
    long sumCompletedByFilters(String role, String search);

    long countByRole(String role);
}
