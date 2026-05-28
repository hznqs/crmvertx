export type TeamMember = {
  id: string;
  userId: string | null;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  tasks: number;
  completed: number;
  performance: number;
  notes: string | null;
  taskBreakdown: string | null;
  hourlyCost: number | string;
  capacityHoursMonth: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeamPage = {
  content: TeamMember[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type TeamSummary = {
  total: number;
  tasks: number;
  completed: number;
  productivity: number;
  marketing: number;
  traffic: number;
  sdr: number;
  closer: number;
  developer: number;
  sourceUnavailable?: boolean;
};

export type TeamQuery = {
  role: string;
  search: string;
  page: number;
  size: number;
};

export type TeamSearchParams = {
  role?: string;
  search?: string;
  page?: string;
  size?: string;
};
