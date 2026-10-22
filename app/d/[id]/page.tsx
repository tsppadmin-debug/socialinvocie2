import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DocumentView from "@/components/DocumentView";
import Fit from "@/components/Fit";
import PrintButton from "@/components/PrintButton";
import { db } from "@/lib/supabase";
import { toDoc } from "@/lib/rows";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Social", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public client view. The unguessable id in the URL is the only key.
export default async function Public({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { data } = await db().from("ts_documents").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div className="public-wrap">
      <PrintButton />
      <div style={{ width: "100%" }}>
        <Fit pad={24}>
          <DocumentView doc={toDoc(data)} />
        </Fit>
      </div>
    </div>
  );
}
