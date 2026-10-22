// Works on both the edge (middleware) and Node, using Web Crypto only.
const enc = new TextEncoder();

async function sign(msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.AUTH_SECRET || ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const COOKIE = "ts_session";
export const MAX_AGE = 60 * 60 * 24 * 30;

export async function makeToken(): Promise<string> {
  const exp = Date.now() + MAX_AGE * 1000;
  return `${exp}.${await sign(String(exp))}`;
}

export async function verifyToken(token?: string): Promise<boolean> {
  if (!token || !process.env.AUTH_SECRET) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(await sign(exp), sig);
}

export function checkPassword(input: string): boolean {
  const real = process.env.APP_PASSWORD || "";
  if (!real) return false;
  return safeEqual(input, real);
}
