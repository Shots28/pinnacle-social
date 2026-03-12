-- Create people table (central entity)
create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete set null,
  first_name text not null,
  last_name text,
  avatar_url text,
  relationship_type text not null check (relationship_type in ('child', 'friend', 'family', 'mentee', 'colleague', 'other')),
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  status_color text not null default 'green' check (status_color in ('green', 'yellow', 'red', 'blue')),
  phone text,
  email text,
  birthday date,
  contact_rhythm_days integer,
  last_contact_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.people enable row level security;

create policy "Users can manage their own people"
on public.people for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
