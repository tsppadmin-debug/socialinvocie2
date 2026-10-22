"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ListActions({ id }: { id: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${location.origin}/d/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      prompt("Copy this link", url);
    }
  }

  async function del() {
    if (!confirm("Delete this document for good?")) return;
    const r = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (r.ok) router.refresh();
  }

  return (
    <div className="acts">
      <Link className="btn ghost small" href={`/edit/${id}`}>Open</Link>
      <button className="btn ghost small" onClick={copy}>{copied ? "Copied" : "Link"}</button>
      <Link className="btn ghost small" href={`/new?from=${id}`}>Copy</Link>
      <button className="btn danger small" onClick={del} aria-label="Delete">×</button>
    </div>
  );
}
