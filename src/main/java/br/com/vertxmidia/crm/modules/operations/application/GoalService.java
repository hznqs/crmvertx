package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.Goal;
import br.com.vertxmidia.crm.modules.operations.dto.GoalRequest;
import br.com.vertxmidia.crm.modules.operations.dto.GoalResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.GoalRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CommissionSaleRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.FinanceEntryRepository;
import br.com.vertxmidia.crm.modules.leads.infrastructure.LeadRepository;
import br.com.vertxmidia.crm.modules.projects.domain.ProjectStatus;
import br.com.vertxmidia.crm.modules.tasks.infrastructure.TaskRepository;
import br.com.vertxmidia.crm.modules.projects.infrastructure.ProjectRepository;
import br.com.vertxmidia.crm.modules.tasks.domain.TaskStatus;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {

    private static final Logger LOGGER = LoggerFactory.getLogger(GoalService.class);

    private final GoalRepository repository;
    private final AuditService auditService;
    private final FinanceEntryRepository financeEntryRepository;
    private final LeadRepository leadRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final CommissionSaleRepository commissionSaleRepository;

    public GoalService(GoalRepository repository,
                       AuditService auditService,
                       FinanceEntryRepository financeEntryRepository,
                       LeadRepository leadRepository,
                       TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       CommissionSaleRepository commissionSaleRepository) {
        this.repository = repository;
        this.auditService = auditService;
        this.financeEntryRepository = financeEntryRepository;
        this.leadRepository = leadRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.commissionSaleRepository = commissionSaleRepository;
    }

    @Transactional(readOnly = true)
    public Page<GoalResponse> search(LocalDate from, LocalDate to, Pageable pageable) {
        Specification<Goal> spec = Specification
                .where(OperationSpecifications.<Goal>dateFrom("date", from))
                .and(OperationSpecifications.dateTo("date", to))
                .and((root, query, cb) -> cb.isTrue(root.get("active")));
        return repository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public GoalResponse findById(UUID id) {
        return toResponse(get(id));
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

    private GoalResponse toResponse(Goal goal) {
        BigDecimal calculatedActual = calculateActual(goal);
        return GoalResponse.from(goal, calculatedActual);
    }

    private BigDecimal calculateActual(Goal goal) {
        try {
            return calculateActualValue(goal);
        } catch (RuntimeException exception) {
            LOGGER.warn(
                    "Nao foi possivel calcular progresso dinamico da meta {} do tipo {}. Usando valor persistido. Motivo: {}",
                    goal.getId(),
                    goal.getType(),
                    exception.getMessage()
            );
            return goal.getActual() != null ? goal.getActual() : BigDecimal.ZERO;
        }
    }

    private BigDecimal calculateActualValue(Goal goal) {
        if (goal.getPeriodStart() == null || goal.getPeriodEnd() == null) return BigDecimal.ZERO;
        java.time.Instant start = goal.getPeriodStart().atStartOfDay().toInstant(ZoneOffset.UTC);
        java.time.Instant end = goal.getPeriodEnd().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        return switch (goal.getType()) {
            case "FATURAMENTO" -> financeEntryRepository.sumByTypeAndStatusAndPeriod("receita", "pago", goal.getPeriodStart(), goal.getPeriodEnd());
            case "LEADS" -> BigDecimal.valueOf(leadRepository.countCreatedBetween(start, end));
            case "TAREFAS" -> BigDecimal.valueOf(taskRepository.countByStatusAndUpdatedAtBetweenAndActiveTrue(TaskStatus.CONCLUIDA, start, end));
            case "PROJETOS" -> BigDecimal.valueOf(projectRepository.countByStatusAndUpdatedAtBetweenAndActiveTrue(ProjectStatus.FINALIZADO, start, end));
            case "COMISSAO" -> commissionSaleRepository.sumPaidCommissionsBetween(start, end);
            default -> goal.getActual() != null ? goal.getActual() : BigDecimal.ZERO;
        };
    }

    private void apply(GoalRequest request, Goal goal) {
        goal.setName(blankToNull(request.name()));
        goal.setType(request.type() == null || request.type().isBlank() ? "FATURAMENTO" : request.type().trim());
        goal.setTarget(request.target() == null ? BigDecimal.ZERO : request.target());
        goal.setActual(request.actual() == null ? BigDecimal.ZERO : request.actual());
        goal.setDate(request.date());
        goal.setPeriodStart(request.periodStart() == null ? request.date().withDayOfMonth(1) : request.periodStart());
        goal.setPeriodEnd(request.periodEnd() == null ? request.date().withDayOfMonth(request.date().lengthOfMonth()) : request.periodEnd());
        goal.setResponsible(blankToNull(request.responsible()));
        goal.setStatus(request.status() == null || request.status().isBlank() ? "EM_ANDAMENTO" : request.status().trim());
        if (request.active() != null) {
            goal.setActive(request.active());
        }
    }

    private void auditGoalChanges(Goal goal, GoalRequest request) {
        auditService.logChange("Meta", goal.getId(), "name", goal.getName(), blankToNull(request.name()));
        auditService.logChange("Meta", goal.getId(), "type", goal.getType(), request.type());
        auditService.logChange("Meta", goal.getId(), "target", goal.getTarget(), request.target() == null ? BigDecimal.ZERO : request.target());
        auditService.logChange("Meta", goal.getId(), "actual", goal.getActual(), request.actual() == null ? BigDecimal.ZERO : request.actual());
        auditService.logChange("Meta", goal.getId(), "date", goal.getDate(), request.date());
        auditService.logChange("Meta", goal.getId(), "responsible", goal.getResponsible(), blankToNull(request.responsible()));
        auditService.logChange("Meta", goal.getId(), "status", goal.getStatus(), request.status() == null || request.status().isBlank() ? "EM_ANDAMENTO" : request.status().trim());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
