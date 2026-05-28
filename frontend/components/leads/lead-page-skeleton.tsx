export function LeadPageSkeleton() {
  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-panel p-5 shadow-panel">
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-panel p-5 shadow-panel">
        <div className="grid gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
      </section>
    </main>
  );
}
