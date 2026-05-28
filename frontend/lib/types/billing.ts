export type BillingClient = {
  clientId: string;
  clientName: string;
  monthlyValue: number | string;
  months: number;
  totalValue: number | string;
};

export type BillingSummary = {
  totalRevenue: number | string;
  averageTicket: number | string;
  activeContracts: number;
  clients: BillingClient[];
  sourceUnavailable?: boolean;
};
