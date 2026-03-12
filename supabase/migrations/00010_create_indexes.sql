-- Performance indexes
create index idx_people_user_id on public.people(user_id);
create index idx_people_household_id on public.people(household_id);
create index idx_people_last_contact on public.people(user_id, last_contact_at);
create index idx_interactions_person on public.interactions(person_id, occurred_at desc);
create index idx_interactions_user on public.interactions(user_id, occurred_at desc);
create index idx_commitments_status on public.commitments(user_id, status);
create index idx_follow_ups_scheduled on public.follow_ups(user_id, scheduled_at) where not is_completed;
create index idx_goals_person on public.goals(person_id, status);
create index idx_milestones_goal on public.milestones(goal_id, sort_order);
