import type { Doc } from "./types";
import { DEFAULT_PAYMENT } from "./config";

// Database row -> Doc the UI understands.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toDoc(r: any): Doc {
  return {
    id: r.id,
    number: r.number,
    doc_type: r.doc_type,
    status: r.status,
    issued_date: String(r.issued_date).slice(0, 10),
    due_date: r.due_date ? String(r.due_date).slice(0, 10) : null,
    is_official: !!r.is_official,
    client_name: r.client_name ?? "",
    client_address: r.client_address ?? "",
    client_tin: r.client_tin ?? "",
    client_reg_no: r.client_reg_no ?? "",
    items: Array.isArray(r.items) ? r.items : [],
    notes: r.notes ?? "",
    vat_rate: Number(r.vat_rate) || 0,
    subtotal: Number(r.subtotal) || 0,
    vat_amount: Number(r.vat_amount) || 0,
    total: Number(r.total) || 0,
    payment: { ...DEFAULT_PAYMENT, ...(r.payment || {}) },
    qr_data: r.qr_data ?? null,
  };
}
