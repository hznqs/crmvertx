import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { projectStatusLabels, projectStatusTone } from "@/lib/projects/labels";
import type { Project } from "@/lib/types/projects";

type OperationalProjectsProps = {
  projects: Project[];
};

export function OperationalProjects({ projects }: OperationalProjectsProps) {
  return (
    <section className="rounded-xl bg-panel/95 p-5 shadow-panel">
      <PanelHeader title="Projetos em execucao" href="/projects" />
      <div className="mt-4 space-y-3">
        {projects.length ? projects.map((project) => (
          <article key={project.id} className="rounded-xl border border-line bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{project.name}</p>
                <p className="mt-1 text-xs text-zinc-500">SLA {formatDate(project.slaDueDate)} · {formatCurrency(project.budget)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${projectStatusTone[project.status]}`}>
                {projectStatusLabels[project.status]}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-400" style={{ width: `${project.progress}%` }} />
            </div>
          </article>
        )) : <EmptyState text="Nenhum projeto em execucao no recorte atual." />}
      </div>
    </section>
  );
}

function PanelHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <Link href={href} className="text-sm font-bold text-brand-400 hover:text-brand-300">Abrir</Link>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{text}</div>;
}
