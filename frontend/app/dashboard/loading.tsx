import { BrandedLoading } from "@/components/brand/branded-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="space-y-6">
      <BrandedLoading label="Preparando dashboard executivo" />
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-10 w-72 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-11 w-40 rounded-lg" />
          <Skeleton className="h-11 w-40 rounded-lg" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-panel p-5 shadow-panel">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="mt-5 h-8 w-32 rounded-lg" />
            <Skeleton className="mt-4 h-3 w-40 rounded-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-panel p-5 shadow-panel">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="mt-5 h-9 w-16 rounded-lg" />
            <Skeleton className="mt-4 h-3 w-28 rounded-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="h-96 rounded-xl bg-panel p-5 shadow-panel">
          <Skeleton className="h-full rounded-xl" />
        </div>
        <div className="h-96 rounded-xl bg-panel p-5 shadow-panel">
          <Skeleton className="h-full rounded-xl" />
        </div>
      </section>
    </main>
  );
}
