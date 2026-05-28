import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
};

const toneClassName = {
  brand: "from-brand-400/24",
  success: "from-emerald-400/18",
  warning: "from-amber-400/18",
  danger: "from-rose-400/18",
  neutral: "from-white/[0.08]"
};

export function MetricCard({ label, value, helper, tone = "neutral" }: MetricCardProps) {
  return (
    <Card className={`bg-gradient-to-br ${toneClassName[tone]} to-transparent p-5 transition duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-glow`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{helper}</p>
    </Card>
  );
}
