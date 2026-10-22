-- The Social invoice app. Safe to run in a shared Supabase project (all names prefixed ts_).

create table if not exists public.ts_doc_counters (
  key text primary key,
  last int not null default 0
);

create or replace function public.ts_next_doc_number(p_prefix text)
returns text
language plpgsql
as $$
declare n int;
begin
  insert into public.ts_doc_counters (key, last) values (p_prefix, 1)
  on conflict (key) do update set last = public.ts_doc_counters.last + 1
  returning last into n;
  return p_prefix || lpad(n::text, 3, '0');
end;
$$;

create table if not exists public.ts_documents (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  doc_type text not null check (doc_type in ('quotation', 'invoice')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  issued_date date not null,
  due_date date,
  is_official boolean not null default false,
  client_name text not null,
  client_address text,
  client_tin text,
  client_reg_no text,
  items jsonb not null default '[]'::jsonb,
  notes text,
  vat_rate numeric not null default 0,
  subtotal numeric not null default 0,
  vat_amount numeric not null default 0,
  total numeric not null default 0,
  payment jsonb not null default '{}'::jsonb,
  qr_data text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ts_documents_created_idx on public.ts_documents (created_at desc);

-- Lock the tables down. The app only talks to them with the service role key on the server.
alter table public.ts_documents enable row level security;
alter table public.ts_doc_counters enable row level security;
