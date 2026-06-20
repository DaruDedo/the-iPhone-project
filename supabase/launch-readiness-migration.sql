create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  phone text,
  address text,
  pincode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists otps_email_created_at_idx
  on public.otps(email, created_at desc);

create index if not exists otps_expires_at_idx
  on public.otps(expires_at);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text,
  phone text,
  email text,
  source text not null default 'direct',
  status text not null default 'new',
  payload jsonb not null default '{}'::jsonb,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  source text not null default 'direct',
  phone text,
  email text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_type_idx on public.leads(type);
create index if not exists leads_phone_idx on public.leads(phone);
create index if not exists leads_email_idx on public.leads(email);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists analytics_events_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_created_idx on public.analytics_events(created_at);

alter table public.users enable row level security;
alter table public.otps enable row level security;
alter table public.leads enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "Admins manage users" on public.users;
create policy "Admins manage users"
on public.users for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage otps" on public.otps;
create policy "Admins manage otps"
on public.otps for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage leads" on public.leads;
create policy "Admins manage leads"
on public.leads for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage analytics events" on public.analytics_events;
create policy "Admins manage analytics events"
on public.analytics_events for all
using (public.is_admin())
with check (public.is_admin());
