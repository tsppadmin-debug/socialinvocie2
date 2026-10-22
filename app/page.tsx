import Link from "next/link";
import TopBar from "@/components/TopBar";
import ListActions from "@/components/ListActions";
import { db } from "@/lib/supabase";
import { fmtDate, money } from "@/lib/calc";

export const dynamic = "force-dynamic";

export default async function Home() {
  let rows: any[] = [];
  let error = "";
  try {
    const { data, error: e } = await db()
      .from("ts_documents")
      .select("id, number, doc_type, status, issued_date, client_name, is_official, total")
      .order("created_at", { ascending: false })
      .limit(200);
    if (e) error = e.message;
    rows = data || [];
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <>
      <TopBar>
        <Link className="btn small" href="/new">New document</Link>
      </TopBar>
      <div className="page">
        <h1>Documents</h1>
        <p className="sub">Quotations and invoices, newest first.</p>

        {error ? (
          <div className="list">
            <div className="empty">
              Database not ready: {error}
              <br />
              Run supabase/schema.sql and set the environment variables.
            </div>
          </div>
        ) : (
          <div className="list">
            <div className="lrow h">
              <div>Number</div>
              <div>Client</div>
              <div className="hide-m">Date</div>
              <div>Total</div>
              <div />
            </div>
            {rows.length === 0 ? <div className="empty">Nothing here yet. Hit New document.</div> : null}
            {rows.map((r) => (
              <div className="lrow" key={r.id}>
                <div>
                  <div className="num">{r.number}</div>
                  <span className={"badge " + r.status}>{r.status}</span>
                </div>
                <div>
                  {r.client_name}
                  <div style={{ color: "var(--muted)", fontSize: 12.5 }}>
                    {r.doc_type === "invoice" ? "Invoice" : "Quotation"} · {r.is_official ? "Registered" : "Not registered"}
                  </div>
                </div>
                <div className="hide-m">{fmtDate(r.issued_date)}</div>
                <div style={{ fontWeight: 600 }}>{money(Number(r.total))}</div>
                <ListActions id={r.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
