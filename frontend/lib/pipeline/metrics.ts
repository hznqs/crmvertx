import type { CommercialStage, Lead } from "@/lib/types/leads";

export const pipelineStages: CommercialStage[] = [
  "NOVO",
  "CONTATO",
  "REUNIAO",
  "PROPOSTA",
  "NEGOCIACAO",
  "FECHADO",
  "PERDIDO"
];

export function groupLeadsByStage(leads: Lead[]) {
  return pipelineStages.reduce<Record<CommercialStage, Lead[]>>((groups, stage) => {
    groups[stage] = leads.filter((lead) => lead.commercialStage === stage);
    return groups;
  }, {} as Record<CommercialStage, Lead[]>);
}

export function sumPotentialValue(leads: Lead[]) {
  return leads.reduce((total, lead) => total + Number(lead.potentialValue ?? 0), 0);
}
