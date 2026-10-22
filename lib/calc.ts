import type { Item } from "./types";

const r2 = (n: number) => Math.round(n * 100) / 100;

export function calc(items: Item[], vatRate: number) {
  const subtotal = r2(
    items.reduce(
      (s, i) => (i.type === "heading" ? s : s + (Number(i.qty) || 0) * (Number(i.price) || 0)),
      0
    )
  );
  const vat = r2((subtotal * (Number(vatRate) || 0)) / 100);
  return { subtotal, vat, total: r2(subtotal + vat) };
}

export function money(n: number): string {
  const v = Number(n) || 0;
  const s = Number.isInteger(v)
    ? v.toLocaleString("en-US")
    : v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + s;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
