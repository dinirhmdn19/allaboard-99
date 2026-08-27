-- Optional, one-time migration for Step 13. Run through a reviewed Supabase migration.
-- Do not use a service-role key in this application.
create table if not exists public.onboarding_reflections (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  question text not null,
  answer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists onboarding_reflections_employee_id_idx on public.onboarding_reflections(employee_id);
alter table public.onboarding_reflections enable row level security;

-- Narrow policy: allow only the signed-in employee record owner to read/write
-- their own reflections.
create policy onboarding_reflections_own_records
on public.onboarding_reflections
for all
to authenticated
using (
  exists (
    select 1
    from public.onboarding_employees oe
    where oe.id = employee_id
      and lower(oe.email) = lower(auth.email())
  )
)
with check (
  exists (
    select 1
    from public.onboarding_employees oe
    where oe.id = employee_id
      and lower(oe.email) = lower(auth.email())
  )
);
