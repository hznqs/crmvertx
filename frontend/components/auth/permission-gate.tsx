import type { ReactNode } from "react";
import {
  canManageModule,
  canReadModule,
  canWriteModule,
  type CrmModule,
  type UserRole
} from "@/lib/auth/permissions";

type PermissionGateProps = {
  module: CrmModule;
  level: "read" | "write" | "manage";
  role: UserRole | null;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  module,
  level,
  role,
  children,
  fallback = null
}: PermissionGateProps) {
  const hasPermission = {
    read: canReadModule,
    write: canWriteModule,
    manage: canManageModule
  }[level](role, module);

  return hasPermission ? children : fallback;
}
