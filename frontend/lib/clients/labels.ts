import type { ClientPriority, ClientStatus, DocumentType } from "@/lib/types/clients";

export const clientPhaseLabels: Record<string, string> = {
  prospeccao: "Prospeccao",
  negociacao: "Negociacao",
  fechado: "Contrato fechado",
  followup: "Follow-up",
  perdido: "Perdido"
};

export const clientStatusLabels: Record<ClientStatus, string> = {
  ATIVO: "Ativo",
  EM_RISCO: "Em risco",
  INATIVO: "Inativo",
  ENCERRADO: "Encerrado"
};

export const clientPriorityLabels: Record<ClientPriority, string> = {
  BAIXA: "Baixa",
  MEDIA: "Media",
  ALTA: "Alta",
  ESTRATEGICA: "Estrategica"
};

export const documentTypeLabels: Record<DocumentType, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  OUTRO: "Outro"
};
