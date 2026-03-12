-- Create households table
create table public.households (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.households enable row level security;

create policy "Users can manage their own households"
on public.households for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
