import type { ServiceBillingType, ServiceCategory } from "@/lib/types/services";

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  LANDING_PAGE: "Landing Page",
  SITE: "Site",
  CRM: "CRM",
  ERP: "ERP",
  SOCIAL_MEDIA: "Social Media",
  TRAFEGO_PAGO: "Trafego Pago",
  AUTOMACAO: "Automacao",
  SEO: "SEO",
  DESIGN: "Design",
  COPY: "Copy",
  CONSULTORIA: "Consultoria",
  OUTRO: "Outro"
};

export const serviceBillingTypeLabels: Record<ServiceBillingType, string> = {
  UNICO: "Unico",
  MENSAL: "Mensal",
  RECORRENTE: "Recorrente",
  PERSONALIZADO: "Personalizado"
};
