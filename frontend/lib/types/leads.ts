export type LeadOrigin =
  | "SITE"
  | "LANDING_PAGE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "GOOGLE_ADS"
  | "INDICACAO"
  | "WHATSAPP"
  | "PROSPECCAO_ATIVA"
  | "EVENTO"
  | "OUTRO";

export type LeadTemperature = "FRIO" | "MORNO" | "QUENTE";

export type LeadStatus = "ACTIVE" | "INACTIVE" | "CONVERTED" | "LOST";

export type CommercialStage =
  | "NOVO"
  | "CONTATO"
  | "REUNIAO"
  | "PROPOSTA"
  | "NEGOCIACAO"
  | "FECHADO"
  | "PERDIDO";

export type Lead = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  origin: LeadOrigin;
  segment: string | null;
  temperature: LeadTemperature;
  potentialValue: number;
  responsibleUserId: string | null;
  responsibleName: string | null;
  serviceInterest: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  notes: string | null;
  status: LeadStatus;
  commercialStage: CommercialStage;
  lostReason: string | null;
  convertedAt: string | null;
  convertedClientId: string | null;
  active: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadPage = {
  content: Lead[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
  loadError?: string;
};

export type LeadQuery = {
  page: number;
  size: number;
  search: string;
  commercialStage: string;
  temperature: string;
  origin: string;
  status: string;
  active: string;
};

export type LeadSearchParams = Partial<Record<keyof LeadQuery, string>>;
