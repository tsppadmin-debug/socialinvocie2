import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth";

// Everything is private except the login page and the shareable /d/<id> client links.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const open =
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname.startsWith("/d/");
  if (open) return NextResponse.next();

  if (await verifyToken(req.cookies.get(COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|phnompenh.png).*)"],
};
