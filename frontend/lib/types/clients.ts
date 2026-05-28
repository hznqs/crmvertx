export type ClientStatus = "ATIVO" | "EM_RISCO" | "INATIVO" | "ENCERRADO";

export type ClientPriority = "BAIXA" | "MEDIA" | "ALTA" | "ESTRATEGICA";

export type DocumentType = "CPF" | "CNPJ" | "OUTRO";

export type Client = {
  id: string;
  name: string;
  phase: string;
  value: number;
  months: number;
  contact: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  documentType: DocumentType | null;
  segment: string | null;
  status: ClientStatus | null;
  priority: ClientPriority | null;
  tags: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressDistrict: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZipCode: string | null;
  active: boolean;
  convertedFromLeadId: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientPage = {
  content: Client[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type ClientQuery = {
  page: number;
  size: number;
  search: string;
  phase: string;
  status: string;
  priority: string;
};

export type ClientSearchParams = Partial<Record<keyof ClientQuery, string>>;
