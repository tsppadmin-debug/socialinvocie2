"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Doc, Item } from "@/lib/types";
import { calc, money } from "@/lib/calc";
import DocumentView from "./DocumentView";
import Fit from "./Fit";
import TopBar from "./TopBar";

const QR_KEY = "ts_last_qr";

export default function Editor({ initial }: { initial: Doc }) {
  const router = useRouter();
  const [doc, setDoc] = useState<Doc>(initial);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);

  const set = <K extends keyof Doc>(k: K, v: Doc[K]) => setDoc((d) => ({ ...d, [k]: v }));
  const setPay = (k: keyof Doc["payment"], v: string) =>
    setDoc((d) => ({ ...d, payment: { ...d.payment, [k]: v } }));

  function say(msg: string, err = false) {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 2600);
  }

  // Remember the last QR so a new quotation does not need it uploaded again.
  useEffect(() => {
    if (!initial.id && !initial.qr_data) {
      try {
        const q = localStorage.getItem(QR_KEY);
        if (q) setDoc((d) => ({ ...d, qr_data: q }));
      } catch {}
    }
  }, [initial.id, initial.qr_data]);

  function setItem(i: number, patch: Partial<Item>) {
    setDoc((d) => ({ ...d, items: d.items.map((it, n) => (n === i ? { ...it, ...patch } : it)) }));
  }
  function move(i: number, dir: -1 | 1) {
    setDoc((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.items.length) return d;
      const items = [...d.items];
      [items[i], items[j]] = [items[j], items[i]];
      return { ...d, items };
    });
  }
  function remove(i: number) {
    setDoc((d) => ({ ...d, items: d.items.filter((_, n) => n !== i) }));
  }

  function onQr(file?: File) {
    if (!file) return;
    if (file.size > 250_000) return say("QR image is too big. Keep it under 250 KB.", true);
    const fr = new FileReader();
    fr.onload = () => {
      const data = String(fr.result);
      set("qr_data", data);
      try {
        localStorage.setItem(QR_KEY, data);
      } catch {}
    };
    fr.readAsDataURL(file);
  }

  async function save(): Promise<string | null> {
    if (!doc.client_name.trim()) {
      say("Add a client name first", true);
      return null;
    }
    setBusy(true);
    const res = await fetch(doc.id ? `/api/documents/${doc.id}` : "/api/documents", {
      method: doc.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      say(data.error || "Could not save", true);
      return null;
    }
    say(`Saved ${data.number}`);
    if (!doc.id) {
      setDoc((d) => ({ ...d, id: data.id, number: data.number }));
      router.replace(`/edit/${data.id}`);
    }
    return data.id as string;
  }

  async function copyLink() {
    const id = (await save()) || doc.id;
    if (!id) return;
    const url = `${location.origin}/d/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      say("Client link copied");
    } catch {
      say(url);
    }
  }

  async function print() {
    const id = await save();
    if (id) setTimeout(() => window.print(), 250);
  }

  const { total } = calc(doc.items, doc.vat_rate);
  const isInvoice = doc.doc_type === "invoice";

  return (
    <>
      <TopBar />
      <div className="editor">
        <div className="form no-print">
          <div className="fsec">
            <h3>Document</h3>
            <div className="seg">
              <button className={!isInvoice ? "on" : ""} onClick={() => set("doc_type", "quotation")}>
                Quotation
              </button>
              <button className={isInvoice ? "on" : ""} onClick={() => set("doc_type", "invoice")}>
                Invoice
              </button>
            </div>
            <div className="two" style={{ marginTop: 10 }}>
              <div className="field">
                <label>Issued date</label>
                <input
                  className="inp"
                  type="date"
                  value={doc.issued_date}
                  onChange={(e) => set("issued_date", e.target.value)}
                />
              </div>
              {isInvoice ? (
                <div className="field">
                  <label>Due date</label>
                  <input
                    className="inp"
                    type="date"
                    value={doc.due_date || ""}
                    onChange={(e) => set("due_date", e.target.value || null)}
                  />
                </div>
              ) : (
                <div className="field">
                  <label>Status</label>
                  <select className="inp" value={doc.status} onChange={(e) => set("status", e.target.value as Doc["status"])}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Accepted / paid</option>
                  </select>
                </div>
              )}
            </div>
            {isInvoice ? (
              <div className="field">
                <label>Status</label>
                <select className="inp" value={doc.status} onChange={(e) => set("status", e.target.value as Doc["status"])}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            ) : null}
            {doc.number ? <p className="hint">Number: {doc.number}</p> : <p className="hint">Number is assigned when you save.</p>}
          </div>

          <div className="fsec">
            <h3>Client</h3>
            <div className="seg">
              <button className={!doc.is_official ? "on" : ""} onClick={() => set("is_official", false)}>
                Not registered
              </button>
              <button className={doc.is_official ? "on" : ""} onClick={() => set("is_official", true)}>
                Registered business
              </button>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Name</label>
              <input className="inp" value={doc.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Jiang Lab" />
            </div>
            <div className="field">
              <label>Address (optional)</label>
              <input className="inp" value={doc.client_address || ""} onChange={(e) => set("client_address", e.target.value)} />
            </div>
            {doc.is_official ? (
              <>
                <div className="two">
                  <div className="field">
                    <label>VAT TIN</label>
                    <input className="inp" value={doc.client_tin || ""} onChange={(e) => set("client_tin", e.target.value)} placeholder="K001-..." />
                  </div>
                  <div className="field">
                    <label>Registration no.</label>
                    <input className="inp" value={doc.client_reg_no || ""} onChange={(e) => set("client_reg_no", e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label>VAT</label>
                  <select className="inp" value={doc.vat_rate} onChange={(e) => set("vat_rate", Number(e.target.value))}>
                    <option value={0}>No VAT</option>
                    <option value={10}>10% VAT</option>
                  </select>
                </div>
              </>
            ) : null}
          </div>

          <div className="fsec">
            <h3>Line items</h3>
            {doc.items.map((it, i) => (
              <div className="item" key={i}>
                <div className="row1">
                  <input
                    className="inp"
                    placeholder={it.type === "heading" ? "Section title, e.g. Event Activation" : "Description"}
                    value={it.description}
                    onChange={(e) => setItem(i, { description: e.target.value })}
                  />
                  <div className="tools">
                    <button className="iconbtn" onClick={() => move(i, -1)} title="Move up">↑</button>
                    <button className="iconbtn" onClick={() => move(i, 1)} title="Move down">↓</button>
                    <button className="iconbtn" onClick={() => remove(i)} title="Delete">×</button>
                  </div>
                </div>
                {it.type === "item" ? (
                  <>
                    <input
                      className="inp"
                      placeholder="Small note under it (optional)"
                      value={it.note || ""}
                      onChange={(e) => setItem(i, { note: e.target.value })}
                    />
                    <div className="row2">
                      <input
                        className="inp"
                        type="number"
                        min={0}
                        step="any"
                        placeholder="Qty"
                        value={it.qty ?? ""}
                        onChange={(e) => setItem(i, { qty: e.target.value === "" ? undefined : Number(e.target.value) })}
                      />
                      <input
                        className="inp"
                        type="number"
                        min={0}
                        step="any"
                        placeholder="Price"
                        value={it.price ?? ""}
                        onChange={(e) => setItem(i, { price: e.target.value === "" ? undefined : Number(e.target.value) })}
                      />
                      <div className="inp" style={{ background: "#f4f4f5", textAlign: "right" }}>
                        {money((it.qty || 0) * (it.price || 0))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn ghost small" onClick={() => set("items", [...doc.items, { type: "item", description: "", qty: 1, price: 0 }])}>
                + Item
              </button>
              <button className="btn ghost small" onClick={() => set("items", [...doc.items, { type: "heading", description: "" }])}>
                + Section title
              </button>
            </div>
            <p className="hint" style={{ marginTop: 10 }}>Total: {money(total)}</p>
          </div>

          <div className="fsec">
            <h3>Note under the table</h3>
            <textarea className="inp" value={doc.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <div className="fsec">
            <h3>Payment</h3>
            <div className="field">
              <label>Bank</label>
              <input className="inp" value={doc.payment.bank} onChange={(e) => setPay("bank", e.target.value)} />
            </div>
            <div className="two">
              <div className="field">
                <label>Account no.</label>
                <input className="inp" value={doc.payment.account_no} onChange={(e) => setPay("account_no", e.target.value)} />
              </div>
              <div className="field">
                <label>Account name</label>
                <input className="inp" value={doc.payment.account_name} onChange={(e) => setPay("account_name", e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Payment QR (optional)</label>
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => onQr(e.target.files?.[0])} />
              <p className="hint">
                Upload a QR that already carries the right amount, cropped to just the code. A QR from a different
                amount will make clients pay the wrong sum.
              </p>
              {doc.qr_data ? (
                <button className="btn ghost small" style={{ width: "fit-content" }} onClick={() => set("qr_data", null)}>
                  Remove QR
                </button>
              ) : null}
            </div>
          </div>

          {doc.id ? (
            <button
              className="btn danger small"
              onClick={async () => {
                if (!confirm("Delete this document for good?")) return;
                const r = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
                if (r.ok) {
                  router.push("/");
                  router.refresh();
                } else say("Could not delete", true);
              }}
            >
              Delete document
            </button>
          ) : null}
        </div>

        <div className="preview">
          <Fit pad={48}>
            <DocumentView doc={doc} />
          </Fit>
        </div>

        <div className="savebar no-print">
          <button className="btn" onClick={() => save()} disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
          <button className="btn ghost" onClick={copyLink} disabled={busy}>
            Copy client link
          </button>
          <button className="btn ghost" onClick={print} disabled={busy}>
            PDF
          </button>
        </div>
      </div>
      {toast ? <div className={"toast" + (toast.err ? " err" : "")}>{toast.msg}</div> : null}
    </>
  );
}
