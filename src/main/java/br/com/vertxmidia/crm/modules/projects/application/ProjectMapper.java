package br.com.vertxmidia.crm.modules.projects.application;

import br.com.vertxmidia.crm.modules.projects.domain.Project;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectRequest;
import br.com.vertxmidia.crm.modules.projects.dto.ProjectResponse;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public Project toEntity(ProjectRequest request) {
        Project project = new Project();
        updateEntity(request, project);
        project.setActive(request.active() == null || request.active());
        return project;
    }

    public void updateEntity(ProjectRequest request, Project project) {
        project.setClientId(request.clientId());
        project.setContractId(request.contractId());
        project.setServiceId(request.serviceId());
        project.setName(request.name().trim());
        project.setDescription(normalizeNullable(request.description()));
        project.setStatus(request.status());
        project.setResponsibleUserId(request.responsibleUserId());
        project.setTeamMemberIds(normalizeNullable(request.teamMemberIds()));
        project.setProgress(request.progress());
        project.setSlaDueDate(request.slaDueDate());
        project.setBudget(defaultNumber(request.budget()));
        project.setEstimatedCost(defaultNumber(request.estimatedCost()));
        project.setActualCost(defaultNumber(request.actualCost()));
        if (request.active() != null) {
            project.setActive(request.active());
        }
    }

    public ProjectResponse toResponse(Project project) {
        BigDecimal estimatedProfit = project.getBudget().subtract(project.getEstimatedCost());
        BigDecimal actualProfit = project.getBudget().subtract(project.getActualCost());
        return new ProjectResponse(
                project.getId(),
                project.getClientId(),
                project.getContractId(),
                project.getServiceId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getResponsibleUserId(),
                project.getTeamMemberIds(),
                project.getProgress(),
                project.getSlaDueDate(),
                project.getBudget(),
                project.getEstimatedCost(),
                project.getActualCost(),
                estimatedProfit,
                actualProfit,
                project.isActive(),
                project.getCreatedBy(),
                project.getUpdatedBy(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private BigDecimal defaultNumber(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
