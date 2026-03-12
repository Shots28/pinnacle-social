-- Create follow-ups table
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  title text not null,
  notes text,
  scheduled_at timestamptz not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.follow_ups enable row level security;

create policy "Users can manage their own follow-ups"
on public.follow_ups for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
