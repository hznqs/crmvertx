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
                .and(OperationSpecifications.dateTo("date", to));
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
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Meta nao encontrada");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Meta", id);
    }

    private Goal get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meta nao encontrada"));
    }

    private void apply(GoalRequest request, Goal goal) {
        goal.setTarget(request.target() == null ? BigDecimal.ZERO : request.target());
        goal.setDate(request.date());
    }

    private void auditGoalChanges(Goal goal, GoalRequest request) {
        auditService.logChange("Meta", goal.getId(), "target", goal.getTarget(), request.target() == null ? BigDecimal.ZERO : request.target());
        auditService.logChange("Meta", goal.getId(), "date", goal.getDate(), request.date());
    }
}
