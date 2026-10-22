import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { cleanDoc } from "@/lib/clean";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const row = cleanDoc(body);
  if (!row.client_name) return NextResponse.json({ error: "Client name is required" }, { status: 400 });

  const year = row.issued_date.slice(0, 4);
  const prefix = `${row.doc_type === "invoice" ? "INV" : "QT"}-${year}-`;

  const sb = db();
  const { data: number, error: nErr } = await sb.rpc("ts_next_doc_number", { p_prefix: prefix });
  if (nErr) return NextResponse.json({ error: nErr.message }, { status: 500 });

  const { data, error } = await sb
    .from("ts_documents")
    .insert({ ...row, number: number as string })
    .select("id, number")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
