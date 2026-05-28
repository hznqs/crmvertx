export const queryKeys = {
  session: ["session"] as const,
  dashboard: (from: string, to: string) => ["dashboard", from, to] as const,
  clients: (params: string) => ["clients", params] as const,
  billing: ["billing"] as const,
  uploads: (params: string) => ["uploads", params] as const,
  audit: (params: string) => ["audit", params] as const
};
