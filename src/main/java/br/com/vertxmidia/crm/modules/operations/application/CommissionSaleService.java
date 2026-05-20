package br.com.vertxmidia.crm.modules.operations.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.operations.domain.CommissionSale;
import br.com.vertxmidia.crm.modules.operations.domain.TeamMember;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionMemberStatsResponse;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionRankingResponse;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionSaleRequest;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionSaleResponse;
import br.com.vertxmidia.crm.modules.operations.dto.CommissionSalesMetricsResponse;
import br.com.vertxmidia.crm.modules.operations.infrastructure.CommissionSaleRepository;
import br.com.vertxmidia.crm.modules.operations.infrastructure.TeamMemberRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommissionSaleService {

    private final CommissionSaleRepository repository;
    private final TeamMemberRepository teamMemberRepository;
    private final AuditService auditService;

    public CommissionSaleService(CommissionSaleRepository repository, TeamMemberRepository teamMemberRepository, AuditService auditService) {
        this.repository = repository;
        this.teamMemberRepository = teamMemberRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<CommissionSaleResponse> search(UUID memberId, Pageable pageable) {
        Specification<CommissionSale> spec = Specification.where(OperationSpecifications.equalsUuid("memberId", memberId));
        return repository.findAll(spec, pageable).map(CommissionSaleResponse::from);
    }

    @Transactional(readOnly = true)
    public CommissionSaleResponse findById(UUID id) {
        return CommissionSaleResponse.from(get(id));
    }

    @Transactional(readOnly = true)
    public CommissionSalesMetricsResponse metrics(UUID memberId) {
        return new CommissionSalesMetricsResponse(
                repository.countByMemberFilter(memberId),
                repository.totalRevenue(memberId),
                repository.totalCommission(memberId)
        );
    }

    @Transactional(readOnly = true)
    public CommissionRankingResponse ranking() {
        Map<UUID, MemberCommissionAggregate> salesByMember = repository.memberStats().stream()
                .map(MemberCommissionAggregate::from)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(MemberCommissionAggregate::memberId, Function.identity()));

        List<CommissionMemberStatsResponse> ranked = teamMemberRepository.findAll(Sort.by("name").ascending()).stream()
                .map(member -> toMemberStats(member, salesByMember.get(member.getId())))
                .sorted(Comparator.comparingLong(CommissionMemberStatsResponse::xp).reversed()
                        .thenComparing(CommissionMemberStatsResponse::name, String.CASE_INSENSITIVE_ORDER))
                .toList();

        BigDecimal averageGoalProgress = averageCommercialGoalProgress(ranked);
        return new CommissionRankingResponse(
                ranked,
                topByRole(ranked, "closer"),
                topByRole(ranked, "sdr"),
                topByRole(ranked, "trafego"),
                topByRole(ranked, "marketing"),
                averageGoalProgress
        );
    }

    @Transactional
    public CommissionSaleResponse create(CommissionSaleRequest request) {
        CommissionSale sale = new CommissionSale();
        apply(request, sale);
        CommissionSale saved = repository.save(sale);
        auditService.log("CREATE", "Comissao", saved.getId());
        return CommissionSaleResponse.from(saved);
    }

    @Transactional
    public CommissionSaleResponse update(UUID id, CommissionSaleRequest request) {
        CommissionSale sale = get(id);
        auditCommissionChanges(sale, request);
        apply(request, sale);
        CommissionSale saved = repository.save(sale);
        auditService.log("UPDATE", "Comissao", saved.getId());
        return CommissionSaleResponse.from(saved);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Comissao nao encontrada");
        }
        repository.deleteById(id);
        auditService.log("DELETE", "Comissao", id);
    }

    private CommissionSale get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Comissao nao encontrada"));
    }

    private void apply(CommissionSaleRequest request, CommissionSale sale) {
        sale.setMemberId(request.memberId());
        sale.setClient(blankToNull(request.client()));
        sale.setValue(request.value() == null ? BigDecimal.ZERO : request.value());
        sale.setPercent(request.percent() == null ? BigDecimal.ZERO : request.percent());
        sale.setGoal(request.goal() == null ? 0 : request.goal());
    }

    private void auditCommissionChanges(CommissionSale sale, CommissionSaleRequest request) {
        auditService.logChange("Comissao", sale.getId(), "memberId", sale.getMemberId(), request.memberId());
        auditService.logChange("Comissao", sale.getId(), "client", sale.getClient(), blankToNull(request.client()));
        auditService.logChange("Comissao", sale.getId(), "value", sale.getValue(), request.value() == null ? BigDecimal.ZERO : request.value());
        auditService.logChange("Comissao", sale.getId(), "percent", sale.getPercent(), request.percent() == null ? BigDecimal.ZERO : request.percent());
        auditService.logChange("Comissao", sale.getId(), "goal", sale.getGoal(), request.goal() == null ? 0 : request.goal());
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private CommissionMemberStatsResponse toMemberStats(TeamMember member, MemberCommissionAggregate aggregate) {
        MemberCommissionAggregate stats = aggregate == null ? MemberCommissionAggregate.empty(member.getId()) : aggregate;
        int completed = safeInt(member.getCompleted());
        int performance = safeInt(member.getPerformance());
        int productivity = productivity(member);
        long xp = (completed * 80L) + (performance * 20L) + (stats.sales() * 250L);
        return new CommissionMemberStatsResponse(
                member.getId(),
                member.getName(),
                member.getRole(),
                stats.sales(),
                stats.revenue(),
                stats.commission(),
                stats.goal(),
                goalProgress(stats.sales(), stats.goal()),
                xp,
                levelFromXp(xp),
                badgeFromXp(xp),
                productivity
        );
    }

    private BigDecimal averageCommercialGoalProgress(List<CommissionMemberStatsResponse> ranked) {
        List<CommissionMemberStatsResponse> commercial = ranked.stream()
                .filter(member -> isRole(member.role(), "sdr") || isRole(member.role(), "closer"))
                .toList();
        if (commercial.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = commercial.stream()
                .map(CommissionMemberStatsResponse::goalProgress)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(commercial.size()), 0, RoundingMode.HALF_UP);
    }

    private String topByRole(List<CommissionMemberStatsResponse> ranked, String role) {
        return ranked.stream()
                .filter(member -> isRole(member.role(), role))
                .findFirst()
                .map(CommissionMemberStatsResponse::name)
                .orElse(null);
    }

    private boolean isRole(String actual, String expected) {
        return actual != null && actual.equalsIgnoreCase(expected);
    }

    private BigDecimal goalProgress(long sales, int goal) {
        if (goal <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal progress = BigDecimal.valueOf(sales)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(goal), 2, RoundingMode.HALF_UP);
        return progress.min(BigDecimal.valueOf(100));
    }

    private int productivity(TeamMember member) {
        int tasks = safeInt(member.getTasks());
        if (tasks <= 0) {
            return safeInt(member.getPerformance());
        }
        return (int) Math.round((safeInt(member.getCompleted()) * 100.0) / tasks);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private long levelFromXp(long xp) {
        return Math.max(1, Math.floorDiv(xp, 500) + 1);
    }

    private String badgeFromXp(long xp) {
        if (xp >= 6000) return "Lenda VertX";
        if (xp >= 3500) return "Elite";
        if (xp >= 1800) return "Performance Pro";
        if (xp >= 800) return "Em crescimento";
        return "Iniciante";
    }

    private static BigDecimal money(Object value) {
        if (value instanceof BigDecimal number) {
            return number;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return BigDecimal.ZERO;
    }

    private static long longValue(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private static int intValue(Object value) {
        return value instanceof Number number ? number.intValue() : 0;
    }

    private record MemberCommissionAggregate(
            UUID memberId,
            long sales,
            BigDecimal revenue,
            BigDecimal commission,
            int goal
    ) {
        private static MemberCommissionAggregate from(Object[] row) {
            if (row == null || row.length < 5 || !(row[0] instanceof UUID memberId)) {
                return null;
            }
            return new MemberCommissionAggregate(
                    memberId,
                    longValue(row[1]),
                    money(row[2]),
                    money(row[3]),
                    intValue(row[4])
            );
        }

        private static MemberCommissionAggregate empty(UUID memberId) {
            return new MemberCommissionAggregate(memberId, 0, BigDecimal.ZERO, BigDecimal.ZERO, 0);
        }
    }
}
