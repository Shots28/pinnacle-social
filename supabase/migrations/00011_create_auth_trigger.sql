-- Auto-create profile and seed life dimensions on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );

  insert into public.life_dimensions (user_id, name, icon, color, sort_order) values
    (new.id, 'Physical', 'heart-pulse', '#ef4444', 0),
    (new.id, 'Spiritual', 'sparkles', '#8b5cf6', 1),
    (new.id, 'Intellectual', 'brain', '#3b82f6', 2),
    (new.id, 'Social', 'users', '#f59e0b', 3),
    (new.id, 'Career & Financial', 'briefcase', '#10b981', 4),
    (new.id, 'Emotional', 'heart', '#ec4899', 5);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
