import { formatCurrency } from "@/lib/formatters";
import { formatTeamRole } from "@/lib/team/labels";
import type { CommissionRanking } from "@/lib/types/commissions";

type CommissionRankingProps = {
  ranking: CommissionRanking;
};

export function CommissionRankingPanel({ ranking }: CommissionRankingProps) {
  const topMembers = ranking.ranking.slice(0, 5);

  return (
    <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">Ranking</p>
          <h2 className="mt-1 text-lg font-bold text-white">Performance comercial</h2>
        </div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-zinc-300">
          Top {topMembers.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        {topMembers.map((member) => (
          <article key={member.memberId} className="rounded-xl border border-line bg-white/[0.025] p-4">
            <p className="line-clamp-1 text-sm font-bold text-white">{member.name}</p>
            <p className="mt-1 text-xs text-zinc-500">{formatTeamRole(member.role)} · Nv. {member.level}</p>
            <p className="mt-4 text-lg font-bold text-white">{formatCurrency(member.commission)}</p>
            <p className="mt-1 text-xs text-zinc-500">{member.badge}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
