import type {
  CommercialStage,
  LeadOrigin,
  LeadStatus,
  LeadTemperature
} from "@/lib/types/leads";

export const leadOriginLabels: Record<LeadOrigin, string> = {
  SITE: "Site",
  LANDING_PAGE: "Landing Page",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  GOOGLE_ADS: "Google Ads",
  INDICACAO: "Indicacao",
  WHATSAPP: "WhatsApp",
  PROSPECCAO_ATIVA: "Prospeccao ativa",
  EVENTO: "Evento",
  OUTRO: "Outro"
};

export const leadTemperatureLabels: Record<LeadTemperature, string> = {
  FRIO: "Frio",
  MORNO: "Morno",
  QUENTE: "Quente"
};

export const commercialStageLabels: Record<CommercialStage, string> = {
  NOVO: "Novo",
  CONTATO: "Contato",
  REUNIAO: "Reuniao",
  PROPOSTA: "Proposta",
  NEGOCIACAO: "Negociacao",
  FECHADO: "Fechado",
  PERDIDO: "Perdido"
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  CONVERTED: "Convertido",
  LOST: "Perdido"
};
