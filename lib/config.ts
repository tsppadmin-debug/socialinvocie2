import type { Doc } from "./types";

export const DEFAULT_NOTES =
  "Recurring brand visibility and community integration across The Social's events and digital channels. Includes event presence, content exposure, and community engagement opportunities.";

export const DEFAULT_PAYMENT = {
  bank: "ABA Bank",
  account_no: "017 714 171",
  account_name: "LAO SEAV P. & TEP CHAN..",
};

export function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function blankDoc(): Doc {
  return {
    doc_type: "quotation",
    status: "draft",
    issued_date: today(),
    due_date: null,
    is_official: false,
    client_name: "",
    client_address: "",
    client_tin: "",
    client_reg_no: "",
    items: [{ type: "item", description: "", qty: 1, price: 0 }],
    notes: DEFAULT_NOTES,
    vat_rate: 0,
    payment: { ...DEFAULT_PAYMENT },
    qr_data: null,
  };
}
