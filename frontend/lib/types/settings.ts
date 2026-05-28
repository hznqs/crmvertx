export type CrmSettings = {
  id: string;
  companyName: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyDocument: string | null;
  companyWebsite: string | null;
  companyAddress: string | null;
  defaultRevenueGoal: number | string | null;
  defaultProfitMargin: number | string | null;
  defaultCurrency: string | null;
  defaultTimezone: string | null;
  defaultTaxRate: number | string | null;
  defaultCommissionRate: number | string | null;
  agencyRevenueGoal: number | string | null;
  agencyNewClientsGoal: number | null;
  agencyAverageTicketGoal: number | string | null;
  agencyRetentionGoal: number | string | null;
  agencyProposalsGoal: number | null;
  agencyMeetingsGoal: number | null;
  preferences: string | null;
  crmRules: string | null;
  updatedAt: string | null;
};

export type Organization = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  document: string | null;
  website: string | null;
  address: string | null;
  updatedAt: string | null;
};
