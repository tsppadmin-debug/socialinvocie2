import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { db } from "@/lib/supabase";
import { toDoc } from "@/lib/rows";

export const dynamic = "force-dynamic";

export default async function EditDoc({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await db().from("ts_documents").select("*").eq("id", id).single();
  if (!data) notFound();
  return <Editor initial={toDoc(data)} />;
}
