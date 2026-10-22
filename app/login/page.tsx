"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setErr("Wrong password");
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1>The Social Invoices</h1>
        <input
          className="inp"
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        {err ? <div style={{ color: "#b42318", fontSize: 14 }}>{err}</div> : null}
        <button className="btn" disabled={busy || !pw}>
          {busy ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
