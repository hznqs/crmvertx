export type TaskPriority = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type TaskStatus =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "EM_REVISAO"
  | "CONCLUIDA"
  | "ATRASADA"
  | "CANCELADA";

export type Task = {
  id: string;
  projectId: string;
  deliveryId: string | null;
  clientId: string | null;
  contractId: string | null;
  serviceId: string | null;
  responsibleUserId: string | null;
  title: string;
  description: string | null;
  checklist: string | null;
  comments: string | null;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  overdue: boolean;
  completedAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskPage = {
  content: Task[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
  loadError?: string;
};

export type TaskQuery = {
  search: string;
  projectId: string;
  deliveryId: string;
  responsibleUserId: string;
  priority: string;
  status: string;
  dueFrom: string;
  dueTo: string;
  active: string;
  page: number;
  size: number;
};

export type TaskSearchParams = {
  search?: string;
  projectId?: string;
  deliveryId?: string;
  responsibleUserId?: string;
  priority?: string;
  status?: string;
  dueFrom?: string;
  dueTo?: string;
  active?: string;
  page?: string;
  size?: string;
};

export type TaskProjectOption = {
  id: string;
  label: string;
};
