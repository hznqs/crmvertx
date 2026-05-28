export type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  metadata: string | null;
  createdAt: string;
};

export type AuditPage = {
  content: AuditLog[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
  unauthorized?: boolean;
};

export type AuditQuery = {
  userId: string;
  action: string;
  entity: string;
  from: string;
  to: string;
  page: number;
  size: number;
};
