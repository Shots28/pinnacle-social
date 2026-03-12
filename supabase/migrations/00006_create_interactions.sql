-- Create interactions table
create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  type text not null check (type in ('conversation', 'activity', 'check_in', 'call', 'text', 'visit', 'other')),
  title text,
  notes text,
  occurred_at timestamptz not null default now(),
  dimension_id uuid references public.life_dimensions(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.interactions enable row level security;

create policy "Users can manage their own interactions"
on public.interactions for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Auto-update last_contact_at on people when interaction is inserted
create or replace function update_last_contact()
returns trigger language plpgsql security definer
as $$
begin
  update public.people
  set last_contact_at = new.occurred_at,
      updated_at = now()
  where id = new.person_id
    and (last_contact_at is null or last_contact_at < new.occurred_at);
  return new;
end;
$$;

create trigger on_interaction_created
  after insert on public.interactions
  for each row execute function update_last_contact();
