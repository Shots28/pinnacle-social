-- Dashboard stats function
create or replace function public.get_dashboard_stats(p_user_id uuid)
returns jsonb language plpgsql security definer stable
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_people', (
      select count(*) from public.people
      where user_id = p_user_id and status = 'active'
    ),
    'overdue_checkins', (
      select count(*) from public.people
      where user_id = p_user_id
        and status = 'active'
        and contact_rhythm_days is not null
        and (
          last_contact_at is null
          or last_contact_at < now() - (contact_rhythm_days || ' days')::interval
        )
    ),
    'pending_commitments', (
      select count(*) from public.commitments
      where user_id = p_user_id and status = 'pending'
    ),
    'todays_follow_ups', (
      select count(*) from public.follow_ups
      where user_id = p_user_id
        and not is_completed
        and scheduled_at::date = current_date
    ),
    'weekly_interactions', (
      select count(*) from public.interactions
      where user_id = p_user_id
        and occurred_at >= date_trunc('week', current_date)
    ),
    'recent_milestones', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', m.id,
        'title', m.title,
        'completed_at', m.completed_at,
        'goal_title', g.title,
        'person_name', p.first_name
      )), '[]'::jsonb)
      from public.milestones m
      join public.goals g on g.id = m.goal_id
      join public.people p on p.id = g.person_id
      where g.user_id = p_user_id
        and m.is_completed = true
        and m.completed_at >= now() - interval '7 days'
      order by m.completed_at desc
      limit 5
    )
  ) into result;

  return result;
end;
$$;
