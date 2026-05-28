export const teamRoleLabels: Record<string, string> = {
  admin: "Admin",
  gestor: "Gestor",
  marketing: "Marketing",
  trafego: "Trafego",
  sdr: "SDR",
  closer: "Closer",
  dev: "Desenvolvedor",
  designer: "Designer",
  social_media: "Social media",
  financeiro: "Financeiro",
  suporte: "Suporte"
};

export const teamRoleOptions = Object.entries(teamRoleLabels).map(([value, label]) => ({
  value,
  label
}));

export function formatTeamRole(role: string) {
  return teamRoleLabels[role] ?? role;
}
