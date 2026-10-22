import type { Doc } from "@/lib/types";
import { calc, fmtDate, money } from "@/lib/calc";

// The printable A4 page. No hooks, so it renders on the server and in the editor preview.
export default function DocumentView({ doc }: { doc: Doc }) {
  const { subtotal, vat, total } = calc(doc.items, doc.vat_rate);
  const isInvoice = doc.doc_type === "invoice";
  const rows = doc.items.filter((i) => i.description || i.note);

  return (
    <div className="sheet">
      <div className="head">
        <div className="title">{isInvoice ? "INVOICE" : "QUOTATION"}</div>
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/phnompenh.png" alt="The Social Phnom Penh" />
        </div>
      </div>

      <div className="rule" />

      <div className="meta">
        <div>
          <div className="issued-label">ISSUED TO :</div>
          <div className="client-name">{doc.client_name || "Client name"}</div>
          {doc.client_address ? <div className="client-line">{doc.client_address}</div> : null}
          {doc.is_official && doc.client_tin ? (
            <div className="client-line">VAT TIN : {doc.client_tin}</div>
          ) : null}
          {doc.is_official && doc.client_reg_no ? (
            <div className="client-line">Reg. No : {doc.client_reg_no}</div>
          ) : null}
        </div>
        <div className="meta-right">
          {doc.number ? (
            <div className="mrow">
              <span>{isInvoice ? "Invoice No" : "Quotation No"}</span>
              <i>:</i>
              <b>{doc.number}</b>
            </div>
          ) : null}
          <div className="mrow">
            <span>Issued Date</span>
            <i>:</i>
            <b>{fmtDate(doc.issued_date)}</b>
          </div>
          {isInvoice && doc.due_date ? (
            <div className="mrow">
              <span>Due Date</span>
              <i>:</i>
              <b>{fmtDate(doc.due_date)}</b>
            </div>
          ) : null}
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <div>DESCRIPTION</div>
          <div className="c">QTY</div>
          <div className="r">PRICE</div>
          <div className="r">TOTAL</div>
        </div>
        <div className="tbody">
          {rows.map((it, idx) =>
            it.type === "heading" ? (
              <div className="trow heading" key={idx}>
                <div className="d">{it.description}</div>
              </div>
            ) : (
              <div className="trow" key={idx}>
                <div className="d">
                  <div>{it.description}</div>
                  {it.note ? <small>{it.note}</small> : null}
                </div>
                <div className="c">{it.qty}</div>
                <div className="r">{money(it.price || 0)}</div>
                <div className="r">{money((it.qty || 0) * (it.price || 0))}</div>
              </div>
            )
          )}
        </div>
      </div>

      {doc.notes ? <p className="notes">{doc.notes}</p> : <div style={{ height: 24 }} />}

      <div className="bottom-rule" />
      <div className="sum">
        <div className="qr">
          {doc.qr_data ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doc.qr_data} alt="Payment QR" />
          ) : null}
        </div>
        <div className="totals">
          <div className="line">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          {doc.is_official && doc.vat_rate > 0 ? (
            <div className="line">
              <span>VAT ({doc.vat_rate}%)</span>
              <span>{money(vat)}</span>
            </div>
          ) : null}
          <div className="gap" />
          <div className="line total">
            <b>Total</b>
            <span>{money(total)}</span>
          </div>
        </div>
      </div>

      <div className="foot">
        <div>
          <div className="pay-title">PAYMENT TO :</div>
          <div className="pay">
            <div>{doc.payment.bank}</div>
            <div className="prow">
              <span>Account No.</span>
              <i>:</i>
              <span>{doc.payment.account_no}</span>
            </div>
            <div className="prow">
              <span>Account Name</span>
              <i>:</i>
              <span>{doc.payment.account_name}</span>
            </div>
          </div>
        </div>
        <div className="thanks">
          THANK YOU FOR
          <br />
          WORKING WITH US
        </div>
      </div>
    </div>
  );
}
