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

-- No public policy is intentionally supplied. Before enabling Step 13 writes in
-- production, add narrowly scoped policies based on the future authenticated user
-- identity (for example, auth.uid() mapped to an employee record).
