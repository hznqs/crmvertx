package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import br.com.vertxmidia.crm.modules.operations.dto.TeamMemberRequest;
import br.com.vertxmidia.crm.modules.operations.dto.TeamMemberResponse;
import br.com.vertxmidia.crm.modules.operations.dto.TeamSummaryResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.TeamMemberRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeamMemberService {

    private final TeamMemberRepository repository;
    private final AuditService auditService;

    public TeamMemberService(TeamMemberRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<TeamMemberResponse> search(String role, String search, Pageable pageable) {
        Specification<TeamMember> spec = Specification
                .where(OperationSpecifications.<TeamMember>equalsText("role", role))
                .and(OperationSpecifications.textLike("name", search));
        return repository.findAll(spec, pageable).map(TeamMemberResponse::from);
    }

    @Transactional(readOnly = true)
    public TeamMemberResponse findById(UUID id) {
        return TeamMemberResponse.from(get(id));
    }

    @Transactional(readOnly = true)
    public TeamSummaryResponse summary(String role, String search) {
        String normalizedRole = role == null ? "" : role.trim();
        String normalizedSearch = search == null ? "" : search.trim();
        long tasks = repository.sumTasksByFilters(normalizedRole, normalizedSearch);
        long completed = repository.sumCompletedByFilters(normalizedRole, normalizedSearch);
        long productivity = tasks > 0 ? Math.round((completed * 100.0) / tasks) : 0;
        return new TeamSummaryResponse(
                repository.countByFilters(normalizedRole, normalizedSearch),
                tasks,
                completed,
                productivity,
                repository.countByRole("marketing"),
                repository.countByRole("trafego"),
                repository.countByRole("sdr"),
                repository.countByRole("closer"),
                repository.countByRole("dev")
        );
    }

    @Transactional
    public TeamMemberResponse create(TeamMemberRequest request) {
        TeamMember member = new TeamMember();
        apply(request, member);
        TeamMember saved = repository.save(member);
        auditService.log("CREATE", "Membro da equipe", saved.getId());
        return TeamMemberResponse.from(saved);
    }

    @Transactional
    public TeamMemberResponse update(UUID id, TeamMemberRequest request) {
        TeamMember member = get(id);
        auditTeamMemberChanges(member, request);
        apply(request, member);
        TeamMember saved = repository.save(member);
        auditService.log("UPDATE", "Membro da equipe", saved.getId());
        return TeamMemberResponse.from(saved);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Membro da equipe nao encontrado");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Membro da equipe", id);
    }

    private TeamMember get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Membro da equipe nao encontrado"));
    }

    private void apply(TeamMemberRequest request, TeamMember member) {
        member.setName(request.name().trim());
        member.setRole(request.role().trim());
        member.setTasks(request.tasks() == null ? 0 : request.tasks());
        member.setCompleted(request.completed() == null ? 0 : request.completed());
        member.setPerformance(request.performance() == null ? 0 : request.performance());
        member.setNotes(request.notes() == null ? null : request.notes().trim());
        member.setTaskBreakdown(request.taskBreakdown() == null ? null : request.taskBreakdown().trim());
    }

    private void auditTeamMemberChanges(TeamMember member, TeamMemberRequest request) {
        auditService.logChange("Membro da equipe", member.getId(), "name", member.getName(), request.name().trim());
        auditService.logChange("Membro da equipe", member.getId(), "role", member.getRole(), request.role().trim());
        auditService.logChange("Membro da equipe", member.getId(), "tasks", member.getTasks(), request.tasks() == null ? 0 : request.tasks());
        auditService.logChange("Membro da equipe", member.getId(), "completed", member.getCompleted(), request.completed() == null ? 0 : request.completed());
        auditService.logChange("Membro da equipe", member.getId(), "performance", member.getPerformance(), request.performance() == null ? 0 : request.performance());
        auditService.logChange("Membro da equipe", member.getId(), "notes", member.getNotes(), request.notes() == null ? null : request.notes().trim());
        auditService.logChange("Membro da equipe", member.getId(), "taskBreakdown", member.getTaskBreakdown(), request.taskBreakdown() == null ? null : request.taskBreakdown().trim());
    }
}
