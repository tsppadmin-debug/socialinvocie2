import type { Doc, Item } from "./types";
import { calc } from "./calc";
import { DEFAULT_PAYMENT } from "./config";

const s = (v: unknown, max = 500) => String(v ?? "").slice(0, max).trim();

// Turns whatever the browser sends into a safe row for the database.
export function cleanDoc(input: Partial<Doc>) {
  const items: Item[] = (Array.isArray(input.items) ? input.items : [])
    .slice(0, 60)
    .map((i) => ({
      type: i.type === "heading" ? ("heading" as const) : ("item" as const),
      description: s(i.description, 200),
      note: s(i.note, 200),
      qty: i.type === "heading" ? undefined : Math.max(0, Number(i.qty) || 0),
      price: i.type === "heading" ? undefined : Math.max(0, Number(i.price) || 0),
    }))
    .filter((i) => i.description || i.note);

  const isOfficial = !!input.is_official;
  const vatRate = isOfficial ? Math.min(100, Math.max(0, Number(input.vat_rate) || 0)) : 0;
  const { subtotal, vat, total } = calc(items, vatRate);

  const qr = typeof input.qr_data === "string" && input.qr_data.startsWith("data:image/")
    ? input.qr_data.slice(0, 400_000)
    : null;

  return {
    doc_type: input.doc_type === "invoice" ? "invoice" : "quotation",
    status: ["draft", "sent", "paid"].includes(String(input.status)) ? input.status : "draft",
    issued_date: s(input.issued_date, 10) || new Date().toISOString().slice(0, 10),
    due_date: input.due_date ? s(input.due_date, 10) : null,
    is_official: isOfficial,
    client_name: s(input.client_name, 150),
    client_address: s(input.client_address, 300),
    client_tin: isOfficial ? s(input.client_tin, 50) : "",
    client_reg_no: isOfficial ? s(input.client_reg_no, 50) : "",
    items,
    notes: s(input.notes, 1000),
    vat_rate: vatRate,
    subtotal,
    vat_amount: vat,
    total,
    payment: {
      bank: s(input.payment?.bank, 80) || DEFAULT_PAYMENT.bank,
      account_no: s(input.payment?.account_no, 40) || DEFAULT_PAYMENT.account_no,
      account_name: s(input.payment?.account_name, 80) || DEFAULT_PAYMENT.account_name,
    },
    qr_data: qr,
  };
}
