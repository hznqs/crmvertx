import { crmTheme } from "@/lib/theme/tokens";

export const chartColors = {
  brand: crmTheme.charts.brand,
  primary: crmTheme.charts.primary,
  success: crmTheme.charts.success,
  warning: crmTheme.charts.warning,
  danger: crmTheme.charts.danger,
  muted: crmTheme.colors.muted,
  grid: "rgba(255,255,255,.055)",
  cursor: "rgba(234,89,220,.09)",
  panel: "color-mix(in srgb, var(--brand-black) 92%, white)"
} as const;
