-- Additive rollout: existing events, constraints, grants and read policy are preserved.
begin;

create table public.portfolio_sessions (
  session_id uuid primary key,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  referrer text,
  landing_path text,
  source text,
  medium text,
  campaign text,
  content text,
  via text,
  device_type text check (device_type in ('mobile','tablet','desktop')),
  country text,
  region text,
  is_internal boolean not null default false,
  automation_type text not null check (automation_type in ('human_candidate','search_engine','ai_training','ai_search','ai_user_fetch','social_preview','automation','unknown')),
  provider text check (provider in ('openai','anthropic','perplexity','google','microsoft','meta','other')),
  confidence text not null check (confidence in ('verified','declared','inferred')),
  evidence text not null,
  signals jsonb not null default '{}',
  -- Reserved for a future trusted server adapter; never populated from browser input.
  botid jsonb,
  constraint portfolio_sessions_times check (last_seen_at >= started_at)
);

create table public.portfolio_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null,
  method text not null check (method in ('GET','HEAD')),
  referrer text,
  country text,
  region text,
  -- NULL means not known: localStorage internal status cannot be read by proxy.
  is_internal boolean,
  automation_type text not null check (automation_type in ('human_candidate','search_engine','ai_training','ai_search','ai_user_fetch','social_preview','automation','unknown')),
  provider text check (provider in ('openai','anthropic','perplexity','google','microsoft','meta','other')),
  confidence text not null check (confidence in ('verified','declared','inferred')),
  evidence text not null,
  botid jsonb
);

alter table public.portfolio_analytics add column path text;
create index if not exists portfolio_analytics_session_created_idx on public.portfolio_analytics (session_id, created_at);
create index if not exists portfolio_analytics_created_idx on public.portfolio_analytics (created_at);
create index portfolio_sessions_started_idx on public.portfolio_sessions (started_at);
create index portfolio_requests_created_idx on public.portfolio_requests (created_at);
create index portfolio_requests_classification_idx on public.portfolio_requests (automation_type, created_at);

alter table public.portfolio_sessions enable row level security;
alter table public.portfolio_requests enable row level security;
revoke all on public.portfolio_sessions, public.portfolio_requests from anon, authenticated;
grant select on public.portfolio_sessions, public.portfolio_requests to authenticated;
grant all on public.portfolio_sessions, public.portfolio_requests to service_role;
create policy "admin reads portfolio sessions" on public.portfolio_sessions for select to authenticated
  using ((select auth.uid()) = 'b35fbaec-6bd9-4425-9193-e840dfe19eee'::uuid);
create policy "admin reads portfolio requests" on public.portfolio_requests for select to authenticated
  using ((select auth.uid()) = 'b35fbaec-6bd9-4425-9193-e840dfe19eee'::uuid);

-- Transactional, service-only write. The PK makes repeated event IDs idempotent.
-- This is deliberately SECURITY INVOKER, not a public privilege escalation path.
create function public.record_portfolio_event(p_event jsonb, p_session jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  sid uuid := (p_event->>'session_id')::uuid;
  inserted_count integer;
  eligible boolean;
begin
  -- Serialize this small portfolio's existing global emergency cap across instances.
  perform pg_advisory_xact_lock(724910228);
  if exists (select 1 from public.portfolio_analytics where id = (p_event->>'id')::uuid) then
    select not is_internal and automation_type = 'human_candidate' into eligible
      from public.portfolio_sessions where session_id = sid;
    return jsonb_build_object('human_context_allowed', coalesce(eligible, false));
  end if;
  if (select count(*) from public.portfolio_analytics where created_at >= now() - interval '1 minute') >= 240
    or (select count(*) from public.portfolio_analytics where session_id = sid and created_at >= now() - interval '1 minute') >= 30 then
    return jsonb_build_object('rate_limited', true);
  end if;

  insert into public.portfolio_analytics (id, session_id, event_type, event_data, referrer, device_type, path)
  values ((p_event->>'id')::uuid, sid, p_event->>'event_type', p_event->'event_data', p_event->>'referrer', p_event->>'device_type', p_event->>'path')
  on conflict (id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return '{}'::jsonb; end if;

  insert into public.portfolio_sessions as existing
    (session_id, referrer, landing_path, source, medium, campaign, content, via, device_type,
     country, region, is_internal, automation_type, provider, confidence, evidence, signals)
  values (sid, coalesce(p_session->>'referrer',p_event->>'referrer'), p_session->>'landing_path',
    p_session->>'source', p_session->>'medium', p_session->>'campaign', p_session->>'content', p_session->>'via',
    p_event->>'device_type', p_session->>'country', p_session->>'region',
    coalesce((p_session->>'is_internal')::boolean,false), p_session->>'automation_type', p_session->>'provider',
    p_session->>'confidence', p_session->>'evidence', coalesce(p_session->'signals','{}'::jsonb))
  on conflict (session_id) do update set
    last_seen_at = greatest(existing.last_seen_at, now()),
    -- Only fill acquisition once. Legacy events lacking a landing path cannot lock it.
    referrer = case when existing.landing_path is null then excluded.referrer else existing.referrer end,
    landing_path = coalesce(existing.landing_path, excluded.landing_path),
    source = case when existing.landing_path is null then excluded.source else existing.source end,
    medium = case when existing.landing_path is null then excluded.medium else existing.medium end,
    campaign = case when existing.landing_path is null then excluded.campaign else existing.campaign end,
    content = case when existing.landing_path is null then excluded.content else existing.content end,
    via = case when existing.landing_path is null then excluded.via else existing.via end,
    device_type = coalesce(existing.device_type, excluded.device_type),
    country = coalesce(existing.country, excluded.country),
    region = coalesce(existing.region, excluded.region),
    is_internal = existing.is_internal or excluded.is_internal,
    -- Keep detected automation sticky; later ordinary UA events cannot wash it away.
    automation_type = case when existing.automation_type in ('human_candidate','unknown') then excluded.automation_type else existing.automation_type end,
    provider = case when existing.automation_type in ('human_candidate','unknown') then excluded.provider else existing.provider end,
    confidence = case when existing.automation_type in ('human_candidate','unknown') then excluded.confidence else existing.confidence end,
    evidence = case when existing.automation_type in ('human_candidate','unknown') then excluded.evidence else existing.evidence end,
    signals = case when excluded.signals = '{}'::jsonb then existing.signals else excluded.signals end;

  select not is_internal and automation_type = 'human_candidate' into eligible
    from public.portfolio_sessions where session_id = sid;
  return jsonb_build_object('human_context_allowed', eligible);
end;
$$;
revoke all on function public.record_portfolio_event(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.record_portfolio_event(jsonb,jsonb) to service_role;

-- Unknown historical sessions remain visible in the old dashboard, not retroactively
-- labeled human. Join is on the supplied session UUID, never temporal correlation.
create view public.portfolio_human_events with (security_invoker = true) as
select e.* from public.portfolio_analytics e join public.portfolio_sessions s using (session_id)
where not s.is_internal and s.automation_type = 'human_candidate';

create view public.portfolio_journey with (security_invoker = true) as
select e.id, e.created_at, 'browser_event'::text as observation_kind, e.session_id, e.path,
  e.event_type, e.event_data, s.automation_type, s.provider, s.confidence, s.is_internal,
  s.referrer, s.source, s.medium, s.campaign, s.via
from public.portfolio_analytics e left join public.portfolio_sessions s using (session_id)
union all
select r.id, r.created_at, 'http_request', null::uuid, r.path,
  r.method, null::jsonb, r.automation_type, r.provider, r.confidence, r.is_internal,
  r.referrer, null::text, null::text, null::text, null::text
from public.portfolio_requests r;

create view public.portfolio_dwell_comparison with (security_invoker = true) as
select e.session_id, e.path, e.event_data->>'sectionId' as section_id,
  sum((e.event_data->>'seconds')::numeric) as raw_seconds,
  sum(case when e.event_data->>'dwellVersion' = '2' then (e.event_data->>'activeSeconds')::numeric end) as active_seconds,
  count(*) filter (where e.event_data->>'dwellVersion' = '2') as active_packets,
  s.is_internal, s.automation_type
from public.portfolio_analytics e left join public.portfolio_sessions s using (session_id)
where e.event_type = 'dwell_time'
group by e.session_id, e.path, e.event_data->>'sectionId', s.is_internal, s.automation_type;

revoke all on public.portfolio_human_events, public.portfolio_journey, public.portfolio_dwell_comparison from public, anon, authenticated;
grant select on public.portfolio_human_events, public.portfolio_journey, public.portfolio_dwell_comparison to authenticated, service_role;
commit;
