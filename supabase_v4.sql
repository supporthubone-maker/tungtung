-- An Nhiên Temple V4 demo: persistent merit / virtual Dharma names.
-- Supabase SQL Editor: run once, then enable Auth -> Providers -> Anonymous Sign-Ins.
-- Auth UID is the only identity source; NEVER send a user_id from browser RPC args.
create table if not exists public.temple_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Khách an nhiên' check (char_length(display_name) <= 24),
  gender text not null default 'female' check (gender in ('male','female')),
  merits integer not null default 0 check (merits >= 0),
  dharma_name text,
  last_reward_at timestamptz,
  rewards_today integer not null default 0,
  reward_date date,
  updated_at timestamptz not null default now()
);

alter table public.temple_profiles enable row level security;

drop policy if exists "temple_own_profile_read" on public.temple_profiles;
create policy "temple_own_profile_read" on public.temple_profiles
  for select to authenticated using (auth.uid() = user_id);

-- No direct writes. Only two narrowly-scoped, validated RPCs can edit this table.
revoke all on public.temple_profiles from anon, authenticated;
grant select on public.temple_profiles to authenticated;

create or replace function public.temple_set_profile(p_name text, p_gender text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result public.temple_profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.temple_profiles(user_id, display_name, gender)
    values (auth.uid(), left(coalesce(nullif(trim(p_name),''),'Khách an nhiên'),24),
      case when p_gender='male' then 'male' else 'female' end)
  on conflict(user_id) do update set display_name=excluded.display_name,
    gender=excluded.gender, updated_at=now();
  select * into result from public.temple_profiles where user_id=auth.uid();
  return to_jsonb(result);
end;$$;

create or replace function public.temple_award_merit(p_action text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.temple_profiles; reward_day date := (now() at time zone 'UTC')::date;
new_merits integer; names text[] := array['An Tâm','Tuệ An','Diệu Hòa','Tịnh Minh','Thiện Duyên','Minh Liên','Tâm Liên','Phúc An','Từ Tâm','An Nhiên','Tịnh Liên','Bảo Tâm'];
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_action not in ('incense','bow','flower','chant','fortune','wish') then
    raise exception 'Invalid activity';
  end if;
  select * into r from public.temple_profiles where user_id=auth.uid() for update;
  if not found then raise exception 'Please set profile first'; end if;
  -- Server-side limits reduce accidental duplicate rewards and mass calls. A
  -- determined client can still counterfeit a completion: use a server-mediated
  -- activity start/completion protocol before treating rewards as currency.
  if r.last_reward_at is not null and now()-r.last_reward_at < interval '8 seconds' then
    return to_jsonb(r) || '{"rewarded":false,"reason":"cooldown"}'::jsonb;
  end if;
  if r.reward_date=reward_day and r.rewards_today >= 100 then
    return to_jsonb(r) || '{"rewarded":false,"reason":"daily_limit"}'::jsonb;
  end if;
  new_merits := r.merits+1;
  update public.temple_profiles set
    merits = new_merits,
    rewards_today = case when r.reward_date=reward_day then r.rewards_today+1 else 1 end,
    reward_date=reward_day,
    last_reward_at=now(), updated_at=now(),
    dharma_name = case when new_merits >= 30 then
      coalesce(r.dharma_name,names[1+(get_byte(decode(md5(auth.uid()::text),'hex'),0)%array_length(names,1))])
      else null end
    where user_id=auth.uid() returning * into r;
  return to_jsonb(r) || '{"rewarded":true}'::jsonb;
end;$$;

revoke execute on function public.temple_set_profile(text,text) from public, anon, authenticated;
revoke execute on function public.temple_award_merit(text) from public, anon, authenticated;
grant execute on function public.temple_set_profile(text,text) to authenticated;
grant execute on function public.temple_award_merit(text) to authenticated;
