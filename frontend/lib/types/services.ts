export type ServiceCategory =
  | "LANDING_PAGE"
  | "SITE"
  | "CRM"
  | "ERP"
  | "SOCIAL_MEDIA"
  | "TRAFEGO_PAGO"
  | "AUTOMACAO"
  | "SEO"
  | "DESIGN"
  | "COPY"
  | "CONSULTORIA"
  | "OUTRO";

export type ServiceBillingType = "UNICO" | "MENSAL" | "RECORRENTE" | "PERSONALIZADO";

export type ServiceOffering = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  billingType: ServiceBillingType;
  basePrice: number;
  slaDays: number;
  estimatedHours: number;
  defaultChecklist: string | null;
  deliveryStages: string | null;
  commissionPercentage: number;
  grossMarginPercentage: number;
  active: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServicePage = {
  content: ServiceOffering[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type ServiceQuery = {
  page: number;
  size: number;
  search: string;
  category: string;
  billingType: string;
  active: string;
};

export type ServiceSearchParams = Partial<Record<keyof ServiceQuery, string>>;
