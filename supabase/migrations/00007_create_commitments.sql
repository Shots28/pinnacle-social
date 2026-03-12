-- Create commitments table
create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  interaction_id uuid references public.interactions(id) on delete set null,
  title text not null,
  description text,
  committed_by text not null check (committed_by in ('me', 'them')),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed', 'overdue', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.commitments enable row level security;

create policy "Users can manage their own commitments"
on public.commitments for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
