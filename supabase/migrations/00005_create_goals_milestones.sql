-- Create goals table
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  dimension_id uuid references public.life_dimensions(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'paused', 'abandoned')),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goals enable row level security;

create policy "Users can manage their own goals"
on public.goals for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Create milestones table
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  description text,
  sort_order smallint not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.milestones enable row level security;

-- Helper function for milestone ownership check
create or replace function private_goal_owner(p_goal_id uuid)
returns uuid language sql security definer stable
as $$ select user_id from public.goals where id = p_goal_id $$;

create policy "Users can manage milestones on their goals"
on public.milestones for all
to authenticated
using (private_goal_owner(goal_id) = (select auth.uid()))
with check (private_goal_owner(goal_id) = (select auth.uid()));
