export interface TxnView {
  id: string;
  description: string;
  category: string;
  direction: "credit" | "debit";
  signedRupees: number;
  occurredOn: string;
  dateLabel: string;
}
