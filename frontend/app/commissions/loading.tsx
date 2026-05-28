export default function Loading() {
  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-44 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-56 animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-11 w-36 animate-pulse rounded-lg bg-white/10" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-panel p-5 shadow-panel">
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 h-8 w-28 animate-pulse rounded-lg bg-white/10" />
            <div className="mt-4 h-3 w-36 animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_140px]">
          <div className="h-11 animate-pulse rounded-lg bg-white/10" />
          <div className="h-11 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="overflow-hidden rounded-xl border border-line">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid gap-4 border-b border-line px-5 py-4 md:grid-cols-7">
              <div className="h-5 animate-pulse rounded bg-white/10 md:col-span-2" />
              <div className="h-5 animate-pulse rounded bg-white/10" />
              <div className="h-5 animate-pulse rounded bg-white/10" />
              <div className="h-5 animate-pulse rounded bg-white/10" />
              <div className="h-5 animate-pulse rounded bg-white/10" />
              <div className="h-5 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
