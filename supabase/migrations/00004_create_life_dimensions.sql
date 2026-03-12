-- Create life dimensions table
create table public.life_dimensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  sort_order smallint not null default 0,
  created_at timestamptz default now()
);

alter table public.life_dimensions enable row level security;

create policy "Users can manage their own life dimensions"
on public.life_dimensions for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
