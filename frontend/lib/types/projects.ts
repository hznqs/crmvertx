export type ProjectStatus =
  | "PLANEJAMENTO"
  | "EM_EXECUCAO"
  | "EM_REVISAO"
  | "AGUARDANDO_CLIENTE"
  | "FINALIZADO"
  | "PAUSADO"
  | "CANCELADO";

export type Project = {
  id: string;
  clientId: string;
  contractId: string | null;
  serviceId: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  responsibleUserId: string | null;
  teamMemberIds: string | null;
  progress: number;
  slaDueDate: string | null;
  budget: number | string;
  estimatedCost: number | string;
  actualCost: number | string;
  estimatedProfit: number | string;
  actualProfit: number | string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectPage = {
  content: Project[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type ProjectQuery = {
  search: string;
  clientId: string;
  contractId: string;
  serviceId: string;
  status: string;
  responsibleUserId: string;
  slaFrom: string;
  slaTo: string;
  active: string;
  page: number;
  size: number;
};

export type ProjectSearchParams = {
  search?: string;
  clientId?: string;
  contractId?: string;
  serviceId?: string;
  status?: string;
  responsibleUserId?: string;
  slaFrom?: string;
  slaTo?: string;
  active?: string;
  page?: string;
  size?: string;
};

export type ProjectSelectOption = {
  id: string;
  label: string;
};
