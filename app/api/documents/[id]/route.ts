import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { cleanDoc } from "@/lib/clean";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const row = cleanDoc(body);
  if (!row.client_name) return NextResponse.json({ error: "Client name is required" }, { status: 400 });

  // The number is never changed on edit, even if the type switches.
  const { data, error } = await db()
    .from("ts_documents")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, number")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { error } = await db().from("ts_documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
