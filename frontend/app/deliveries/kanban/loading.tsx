import { Skeleton } from "@/components/ui/skeleton";

export default function DeliveriesKanbanLoading() {
  return (
    <main className="space-y-6">
      <Skeleton className="h-48 rounded-3xl" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28" />)}
      </section>
      <Skeleton className="h-64 rounded-2xl" />
      <section className="grid min-w-[1480px] grid-cols-6 gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[620px] rounded-2xl" />)}
      </section>
    </main>
  );
}
