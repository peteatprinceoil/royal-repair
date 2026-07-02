-- ─── Parts Catalog ────────────────────────────────────────────────────────────
create table public.parts (
  id         uuid primary key default gen_random_uuid(),
  sku        text not null unique,
  name       text not null,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index parts_sku_idx on public.parts(sku);
alter table public.parts enable row level security;

create policy "parts: read" on public.parts
  for select to authenticated using (true);

create policy "parts: admin write" on public.parts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create trigger parts_updated_at before update on public.parts
  for each row execute procedure public.set_updated_at();

-- ─── Job Assignment ────────────────────────────────────────────────────────────
alter table public.jobs
  add column assigned_to uuid references public.profiles(id) on delete set null;

create index jobs_assigned_to_idx on public.jobs(assigned_to);

-- Replace the tech-own SELECT policy to include assigned and unassigned jobs
drop policy "jobs: tech own" on public.jobs;

create policy "jobs: tech own" on public.jobs
  for select using (
    public.is_admin()
    or created_by = auth.uid()
    or assigned_to = auth.uid()
    or (
      assigned_to is null
      and exists(
        select 1 from public.profiles
        where id = auth.uid() and role = 'tech'
      )
    )
  );

-- Allow admins to insert jobs (created_by = their own id is still enforced by existing policy)
drop policy "jobs: tech insert" on public.jobs;

create policy "jobs: tech insert" on public.jobs
  for insert with check (
    created_by = auth.uid()
  );
