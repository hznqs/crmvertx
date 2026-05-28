package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.Goal;
import br.com.vertxmidia.crm.modules.operations.dto.GoalRequest;
import br.com.vertxmidia.crm.modules.operations.dto.GoalResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.GoalRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {

    private final GoalRepository repository;
    private final AuditService auditService;

    public GoalService(GoalRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<GoalResponse> search(LocalDate from, LocalDate to, Pageable pageable) {
        Specification<Goal> spec = Specification
                .where(OperationSpecifications.<Goal>dateFrom("date", from))
                .and(OperationSpecifications.dateTo("date", to))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
        return repository.findAll(spec, pageable).map(GoalResponse::from);
    }

    @Transactional(readOnly = true)
    public GoalResponse findById(UUID id) {
        return GoalResponse.from(get(id));
    }

    @Transactional
    public GoalResponse create(GoalRequest request) {
        Goal goal = new Goal();
        apply(request, goal);
        Goal saved = repository.save(goal);
        auditService.log("CREATE", "Meta", saved.getId());
        return GoalResponse.from(saved);
    }

    @Transactional
    public GoalResponse update(UUID id, GoalRequest request) {
        Goal goal = get(id);
        auditGoalChanges(goal, request);
        apply(request, goal);
        Goal saved = repository.save(goal);
        auditService.log("UPDATE", "Meta", saved.getId());
        return GoalResponse.from(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Goal goal = get(id);
        goal.setActive(false);
        repository.save(goal);
        auditService.log("SOFT_DELETE", "Meta", id);
    }

    private Goal get(UUID id) {
        return repository.findById(id)
                .filter(Goal::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Meta nao encontrada"));
    }

    private void apply(GoalRequest request, Goal goal) {
        goal.setType(request.type() == null || request.type().isBlank() ? "FATURAMENTO" : request.type().trim());
        goal.setTarget(request.target() == null ? BigDecimal.ZERO : request.target());
        goal.setActual(request.actual() == null ? BigDecimal.ZERO : request.actual());
        goal.setDate(request.date());
        goal.setPeriodStart(request.periodStart() == null ? request.date().withDayOfMonth(1) : request.periodStart());
        goal.setPeriodEnd(request.periodEnd() == null ? request.date().withDayOfMonth(request.date().lengthOfMonth()) : request.periodEnd());
        if (request.active() != null) {
            goal.setActive(request.active());
        }
    }

    private void auditGoalChanges(Goal goal, GoalRequest request) {
        auditService.logChange("Meta", goal.getId(), "type", goal.getType(), request.type());
        auditService.logChange("Meta", goal.getId(), "target", goal.getTarget(), request.target() == null ? BigDecimal.ZERO : request.target());
        auditService.logChange("Meta", goal.getId(), "actual", goal.getActual(), request.actual() == null ? BigDecimal.ZERO : request.actual());
        auditService.logChange("Meta", goal.getId(), "date", goal.getDate(), request.date());
    }
}
