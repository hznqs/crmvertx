import { PermissionGate } from "@/components/auth/permission-gate";
import { ProjectCreateButton } from "@/components/projects/project-create-button";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectMetrics } from "@/components/projects/project-metrics";
import { ProjectTable } from "@/components/projects/project-table";
import { fetchClients } from "@/lib/api/clients";
import { fetchProjects } from "@/lib/api/projects";
import { fetchServices } from "@/lib/api/services";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildClientQuery } from "@/lib/clients/query";
import { buildProjectQuery } from "@/lib/projects/query";
import { buildServiceQuery } from "@/lib/services/query";
import type { ProjectSearchParams, ProjectSelectOption } from "@/lib/types/projects";

type ProjectsPageProps = {
  searchParams: Promise<ProjectSearchParams>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "PROJECTS");
  const query = buildProjectQuery(resolvedSearchParams);
  const [projectPage, clientPage, servicePage] = await Promise.all([
    fetchProjects(query),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" })),
    fetchServices(buildServiceQuery({ size: "100", active: "true" }))
  ]);
  const clientOptions = clientPage.content.map(toClientOption);
  const serviceOptions = servicePage.content.map(toServiceOption);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Operacao
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Projetos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Execucao de projetos com cliente, servico, SLA, progresso, custos
            e lucratividade acompanhados em uma unica visao operacional.
          </p>
        </div>
        <PermissionGate module="PROJECTS" level="write" role={user?.role ?? null}>
          <ProjectCreateButton clientOptions={clientOptions} serviceOptions={serviceOptions} />
        </PermissionGate>
      </section>

      <ProjectMetrics projects={projectPage.content} totalElements={projectPage.totalElements} />

      {projectPage.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar os projetos reais.
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <ProjectFilters query={query} clientOptions={clientOptions} serviceOptions={serviceOptions} />
        <ProjectTable
          projectPage={projectPage}
          clientOptions={clientOptions}
          serviceOptions={serviceOptions}
          actionPermissions={actionPermissions}
        />
      </section>
    </main>
  );
}

function toClientOption(client: { id: string; name: string }): ProjectSelectOption {
  return { id: client.id, label: client.name };
}

function toServiceOption(service: { id: string; name: string }): ProjectSelectOption {
  return { id: service.id, label: service.name };
}
