export default function Loading() {
  return (
    <main className="space-y-6">
      <section className="space-y-3">
        <div className="h-4 w-56 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/10" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-panel p-5 shadow-panel">
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 h-8 w-24 animate-pulse rounded-lg bg-white/10" />
            <div className="mt-4 h-3 w-36 animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <PanelSkeleton />
        <PanelSkeleton />
      </section>

      <PanelSkeleton />
    </main>
  );
}

function PanelSkeleton() {
  return (
    <div className="rounded-xl bg-panel p-5 shadow-panel">
      <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="mt-4 h-24 animate-pulse rounded-xl bg-white/10" />
      ))}
    </div>
  );
}
