-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Settings ────────────────────────────────────────────────────────────────
create table public.settings (
  key   text primary key,
  value text not null
);

insert into public.settings (key, value) values
  ('onsite_discount_pct', '10'),
  ('stripe_onsite_coupon_id', '');

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('tech', 'admin')) default 'tech',
  full_name   text not null default '',
  created_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'tech'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Customers ────────────────────────────────────────────────────────────────
create table public.customers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null,
  email           text not null,
  service_address text not null,
  created_by      uuid not null references public.profiles(id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Jobs ─────────────────────────────────────────────────────────────────────
create table public.jobs (
  id                          uuid primary key default gen_random_uuid(),
  customer_id                 uuid not null references public.customers(id) on delete restrict,
  created_by                  uuid not null references public.profiles(id) on delete restrict,
  title                       text not null default '',
  line_items                  jsonb not null default '[]',
  subtotal                    numeric(10,2) not null default 0,
  discount_pct                numeric(5,2) not null default 0,
  discount_amount             numeric(10,2) not null default 0,
  total                       numeric(10,2) not null default 0,
  payment_type                text not null check (payment_type in ('onsite','remote')) default 'onsite',
  status                      text not null check (status in ('draft','pending','paid','cancelled')) default 'draft',
  payment_token               uuid unique not null default gen_random_uuid(),
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  sent_at                     timestamptz,
  paid_at                     timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger customers_updated_at before update on public.customers
  for each row execute procedure public.set_updated_at();

create trigger jobs_updated_at before update on public.jobs
  for each row execute procedure public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.customers enable row level security;
alter table public.jobs      enable row level security;
alter table public.settings  enable row level security;

-- Helper: is admin
create or replace function public.is_admin()
returns boolean language sql security definer
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

-- Profiles: own row + admin sees all
create policy "profiles: own row" on public.profiles
  for all using (id = auth.uid() or public.is_admin());

-- Customers: tech sees own, admin sees all
create policy "customers: tech own" on public.customers
  for select using (created_by = auth.uid() or public.is_admin());

create policy "customers: tech insert" on public.customers
  for insert with check (created_by = auth.uid());

create policy "customers: tech update" on public.customers
  for update using (created_by = auth.uid() or public.is_admin());

-- Jobs: tech sees own, admin sees all
create policy "jobs: tech own" on public.jobs
  for select using (created_by = auth.uid() or public.is_admin());

create policy "jobs: tech insert" on public.jobs
  for insert with check (created_by = auth.uid());

create policy "jobs: tech update" on public.jobs
  for update using (created_by = auth.uid() or public.is_admin());

-- Settings: admin only
create policy "settings: admin read" on public.settings
  for select using (public.is_admin());

create policy "settings: admin write" on public.settings
  for all using (public.is_admin());

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index jobs_customer_id_idx on public.jobs(customer_id);
create index jobs_created_by_idx  on public.jobs(created_by);
create index jobs_status_idx      on public.jobs(status);
create index jobs_payment_token_idx on public.jobs(payment_token);
create index customers_created_by_idx on public.customers(created_by);
