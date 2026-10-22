export type Item = {
  type: "item" | "heading";
  description: string;
  note?: string;
  qty?: number;
  price?: number;
};

export type Payment = {
  bank: string;
  account_no: string;
  account_name: string;
};

export type Doc = {
  id?: string;
  number?: string;
  doc_type: "quotation" | "invoice";
  status: "draft" | "sent" | "paid";
  issued_date: string; // yyyy-mm-dd
  due_date?: string | null;
  is_official: boolean;
  client_name: string;
  client_address?: string | null;
  client_tin?: string | null;
  client_reg_no?: string | null;
  items: Item[];
  notes: string;
  vat_rate: number;
  subtotal?: number;
  vat_amount?: number;
  total?: number;
  payment: Payment;
  qr_data?: string | null;
};
