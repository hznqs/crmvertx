export type DeliveryStatus =
  | "backlog"
  | "planejamento"
  | "producao"
  | "revisao"
  | "ajustes"
  | "aprovado"
  | "pendente";

export type Delivery = {
  id: string;
  clientId: string | null;
  projectId: string | null;
  contractId: string | null;
  serviceId: string | null;
  type: string;
  title: string;
  description: string | null;
  owner: string;
  deadline: string;
  status: DeliveryStatus;
  approvedAt: string | null;
  deliveredAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryPage = {
  content: Delivery[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type DeliverySummary = {
  pending: number;
  production: number;
  review: number;
  approved: number;
  late: number;
  sourceUnavailable?: boolean;
};

export type DeliveryQuery = {
  status: string;
  owner: string;
  clientId: string;
  page: number;
  size: number;
};

export type DeliverySearchParams = {
  status?: string;
  owner?: string;
  clientId?: string;
  page?: string;
  size?: string;
};

export type DeliverySelectOption = {
  id: string;
  label: string;
};
