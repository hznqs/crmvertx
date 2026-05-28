export default function Loading() {
  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-44 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-52 animate-pulse rounded-lg bg-white/10" />
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
        <div className="mb-5 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
        <div className="grid min-w-[1180px] grid-cols-7 gap-4 overflow-hidden">
          {Array.from({ length: 7 }).map((_, columnIndex) => (
            <div key={columnIndex} className="min-h-[520px] rounded-xl border border-line bg-white/[0.025] p-3">
              <div className="h-12 animate-pulse rounded-lg bg-white/10" />
              {Array.from({ length: 4 }).map((_, cardIndex) => (
                <div key={cardIndex} className="mt-3 h-28 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
