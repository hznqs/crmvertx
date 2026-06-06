export type BillingClient = {
  clientId: string;
  clientName: string;
  monthlyValue: number | string;
  months: number;
  totalValue: number | string;
};

export type BillingSummary = {
  totalRevenue: number | string;
  mrr: number | string;
  averageTicket: number | string;
  pendingRevenue: number | string;
  receivedRevenue: number | string;
  overdueRevenue: number | string;
  activeContracts: number;
  clients: BillingClient[];
  sourceUnavailable?: boolean;
  loadError?: string;
};
