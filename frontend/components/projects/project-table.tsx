import { ProjectRowActions } from "@/components/projects/project-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { projectStatusLabels, projectStatusTone } from "@/lib/projects/labels";
import type { Project, ProjectPage, ProjectSelectOption } from "@/lib/types/projects";

type ProjectTableProps = {
  projectPage: ProjectPage;
  clientOptions: ProjectSelectOption[];
  serviceOptions: ProjectSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function ProjectTable({ projectPage, clientOptions, serviceOptions, actionPermissions }: ProjectTableProps) {
  if (projectPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum projeto encontrado</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre um novo projeto operacional.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Projeto</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Progresso</th>
              <th className="px-5 py-4 font-bold">SLA</th>
              <th className="px-5 py-4 font-bold">Orcamento</th>
              <th className="px-5 py-4 font-bold">Lucro</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {projectPage.content.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                clientOptions={clientOptions}
                serviceOptions={serviceOptions}
                actionPermissions={actionPermissions}
              />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {projectPage.number + 1} de {projectPage.totalPages}</span>
        <span>{projectPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function ProjectRow({
  project,
  clientOptions,
  serviceOptions,
  actionPermissions
}: {
  project: Project;
  clientOptions: ProjectSelectOption[];
  serviceOptions: ProjectSelectOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-72">
          <p className="font-semibold text-white">{project.name}</p>
          <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
            {project.description || project.teamMemberIds || "Sem descricao"}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${projectStatusTone[project.status]}`}>
          {projectStatusLabels[project.status]}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="min-w-32">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{project.progress}%</span>
            <span>{progressLabel(project.progress)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-400" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-zinc-300">{formatDate(project.slaDueDate)}</td>
      <td className="px-5 py-4 font-semibold text-white">{formatCurrency(project.budget)}</td>
      <td className="px-5 py-4 text-zinc-300">{formatCurrency(project.actualProfit ?? project.estimatedProfit)}</td>
      <td className="px-5 py-4">
        <ProjectRowActions
          project={project}
          clientOptions={clientOptions}
          serviceOptions={serviceOptions}
          actionPermissions={actionPermissions}
        />
      </td>
    </tr>
  );
}

function progressLabel(progress: number) {
  if (progress >= 100) return "done";
  if (progress >= 70) return "alta";
  if (progress >= 30) return "media";
  return "inicio";
}
