"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopBar({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="topbar no-print">
      <Link href="/" className="logo">
        THE SOCIAL<span>Invoices</span>
      </Link>
      <div className="right">
        {children}
        <button className="btn ghost small" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
