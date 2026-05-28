import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

type SectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

type EmptyStateProps = {
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </section>
  );
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/[0.025] px-4 py-8 text-center">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}

export function SkeletonBlock() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="h-28 animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="h-28 animate-pulse rounded-xl bg-white/[0.05]" />
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-white/[0.04]" />
    </div>
  );
}
