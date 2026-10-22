import Editor from "@/components/Editor";
import { blankDoc, today } from "@/lib/config";
import { db } from "@/lib/supabase";
import { toDoc } from "@/lib/rows";

export const dynamic = "force-dynamic";

export default async function NewDoc({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial = blankDoc();

  // "Copy" on the list opens a fresh document pre-filled from an old one.
  if (from) {
    const { data } = await db().from("ts_documents").select("*").eq("id", from).single();
    if (data) {
      const d = toDoc(data);
      initial = { ...d, id: undefined, number: undefined, status: "draft", issued_date: today(), due_date: null };
    }
  }
  return <Editor initial={initial} />;
}
