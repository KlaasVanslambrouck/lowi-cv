-- Run after migration as a database owner. All fixtures roll back.
begin;
do $$
declare
  sid uuid := gen_random_uuid();
  eid uuid := gen_random_uuid();
  ev jsonb;
  ctx jsonb;
  result jsonb;
begin
  ev := jsonb_build_object('id',eid,'session_id',sid,'event_type','dwell_time',
    'event_data',jsonb_build_object('sectionId','qa','seconds',326,'activeSeconds',41,'dwellVersion',2),'path','/nidus');
  ctx := jsonb_build_object('landing_path','/','source','linkedin','campaign','qa',
    'referrer','https://app.tellent.com','is_internal',false,
    'automation_type','human_candidate','confidence','inferred','evidence','test');
  result := public.record_portfolio_event(ev,ctx);
  if result->>'human_context_allowed' is distinct from 'true' then raise exception 'human eligibility failed'; end if;
  perform public.record_portfolio_event(ev,ctx);
  if (select count(*) from public.portfolio_analytics where session_id=sid) <> 1 then raise exception 'deduplication failed'; end if;
  perform public.record_portfolio_event(ev || jsonb_build_object('id',gen_random_uuid()),
    ctx || '{"landing_path":"/nidus","source":"other","is_internal":true,"automation_type":"automation","evidence":"client:webdriver"}'::jsonb);
  perform public.record_portfolio_event(ev || jsonb_build_object('id',gen_random_uuid()),ctx);
  if not exists (select 1 from public.portfolio_sessions where session_id=sid and source='linkedin'
    and landing_path='/' and is_internal and automation_type='automation') then raise exception 'attribution/sticky exclusions failed'; end if;
  if exists (select 1 from public.portfolio_human_events where session_id=sid) then raise exception 'human filter failed'; end if;
  if not exists (select 1 from public.portfolio_dwell_comparison where session_id=sid and raw_seconds=978 and active_seconds=123) then raise exception 'dwell comparison failed'; end if;
  if has_function_privilege('anon','public.record_portfolio_event(jsonb,jsonb)','EXECUTE')
    or has_function_privilege('authenticated','public.record_portfolio_event(jsonb,jsonb)','EXECUTE') then raise exception 'public writer access'; end if;
  if has_table_privilege('anon','public.portfolio_sessions','SELECT')
    or has_table_privilege('authenticated','public.portfolio_requests','INSERT') then raise exception 'public table access'; end if;
  if exists (select 1 from pg_class where relname in ('portfolio_journey','portfolio_human_events','portfolio_dwell_comparison')
    and not ('security_invoker=true' = any(reloptions))) then raise exception 'view bypasses RLS'; end if;
end $$;
rollback;
select 'PASS: fixtures rolled back' as result;
