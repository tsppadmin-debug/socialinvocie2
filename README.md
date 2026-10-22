# The Social Invoices

Quotations and invoices in The Social design. Password protected, saved in Supabase, shareable client links, print to A4 PDF.

## Set up

1. Supabase: run `supabase/schema.sql` in the SQL editor. Tables are prefixed `ts_`, so it can share a project with other apps.
2. Copy `.env.example` to `.env.local` and fill it in. Locally: `npm install && npm run dev`.
3. Vercel: import the project, add the same four environment variables, deploy.

## Environment variables

- `APP_PASSWORD`: the password your team types in
- `AUTH_SECRET`: long random string (`openssl rand -hex 32`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose it)

## How it works

- Registered business: adds VAT TIN, registration number and optional 10% VAT.
- Not registered: just a name and optional address. Same layout.
- Numbers run QT-2026-001 and INV-2026-001, counted separately per year.
- "Copy client link" gives a read-only page at `/d/<id>` with a Download PDF button. No login needed for clients.
- PDF uses the browser print dialog (Save as PDF), so text stays sharp.
- Payment QR is uploaded per document. The QR from the ABA screenshot has a fixed amount baked in, so upload one that matches the total.
