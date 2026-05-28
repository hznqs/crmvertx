export function CalendarPageSkeleton() {
  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-72 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-panel p-5 shadow-panel">
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl bg-panel p-4 shadow-panel">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-panel p-5 shadow-panel">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
