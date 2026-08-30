-- Milestone 4: editorial evidence, compatibility guardrails, and scheduler-safe run locking.

create unique index update_runs_one_active_adapter_idx on public.update_runs(update_source_id)
  where status in ('queued', 'running');

alter table public.update_audit_events drop constraint update_audit_events_action_check;
alter table public.update_audit_events add constraint update_audit_events_action_check
  check (action in ('proposal_created','auto_applied','approved','rejected','superseded','failed','manual_evidence_attached','compatibility_saved','run_locked'));

create or replace function public.attach_component_evidence(
  p_component_id uuid, p_url text, p_title text, p_publisher text, p_source_type text,
  p_publication_date date default null, p_notes text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare evidence_id uuid;
begin
  if not public.is_editor() then raise exception 'editor role required' using errcode = '42501'; end if;
  if p_url !~ '^https?://' or length(trim(p_title)) < 2 or length(trim(p_publisher)) < 2 then raise exception 'valid evidence metadata is required' using errcode = '22023'; end if;
  if p_source_type not in ('official_docs','official_repo','model_card','announcement','community','internal_test') then raise exception 'invalid source type' using errcode = '22023'; end if;
  if not exists(select 1 from public.components where id = p_component_id) then raise exception 'component not found' using errcode = 'P0002'; end if;
  insert into public.sources(title,url,source_type,publisher,publication_date,retrieved_at,notes)
  values (trim(p_title),trim(p_url),p_source_type,trim(p_publisher),p_publication_date,now(),nullif(trim(coalesce(p_notes,'')),''))
  on conflict(url) do update set retrieved_at=excluded.retrieved_at, title=excluded.title, publisher=excluded.publisher
  returning id into evidence_id;
  insert into public.component_sources(component_id,source_id,claim_type,notes)
  values(p_component_id,evidence_id,'editorial_evidence',p_notes) on conflict do nothing;
  update public.components set last_verified_at=now(), updated_at=now() where id=p_component_id;
  insert into public.update_audit_events(actor_id,action,after_value,detail)
  values(auth.uid(),'manual_evidence_attached',jsonb_build_object('component_id',p_component_id,'source_id',evidence_id),jsonb_build_object('notes',coalesce(p_notes,'')));
  return evidence_id;
end $$;
revoke all on function public.attach_component_evidence(uuid,text,text,text,text,date,text) from public;
grant execute on function public.attach_component_evidence(uuid,text,text,text,text,date,text) to authenticated;

create or replace function public.save_compatibility_with_evidence(
  p_source_port_id uuid, p_target_port_id uuid, p_status text, p_level text, p_confidence numeric,
  p_notes text, p_limitations text, p_configuration_notes text, p_evidence_url text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare edge_id uuid; declare evidence_id uuid;
begin
  if not public.is_editor() then raise exception 'editor role required' using errcode = '42501'; end if;
  if p_status not in ('verified_official','verified_first_party','verified_community','tested_internal','inferred','unverified','incompatible','deprecated') or p_level not in ('native','compatible','partial','none') or p_confidence < 0 or p_confidence > 1 then raise exception 'invalid compatibility data' using errcode = '22023'; end if;
  if p_status in ('verified_official','verified_first_party','verified_community') and (p_evidence_url is null or p_evidence_url !~ '^https?://') then raise exception 'verified compatibility requires supporting evidence' using errcode = '22023'; end if;
  insert into public.compatibility_edges(source_port_id,target_port_id,status,compatibility_level,confidence,notes,limitations,configuration_required,configuration_notes,last_verified_at)
  values(p_source_port_id,p_target_port_id,p_status,p_level,p_confidence,trim(p_notes),nullif(trim(coalesce(p_limitations,'')),''),p_configuration_notes is not null,nullif(trim(coalesce(p_configuration_notes,'')),''),now())
  on conflict(source_port_id,target_port_id) do update set status=excluded.status, compatibility_level=excluded.compatibility_level, confidence=excluded.confidence, notes=excluded.notes, limitations=excluded.limitations, configuration_required=excluded.configuration_required, configuration_notes=excluded.configuration_notes, last_verified_at=excluded.last_verified_at, updated_at=now()
  returning id into edge_id;
  if p_evidence_url is not null then
    insert into public.sources(title,url,source_type,publisher,retrieved_at) values('Editorial compatibility evidence',p_evidence_url,case when p_status='verified_community' then 'community' else 'official_docs' end,'Editorial review',now()) on conflict(url) do update set retrieved_at=excluded.retrieved_at returning id into evidence_id;
    insert into public.compatibility_edge_sources(compatibility_edge_id,source_id,evidence_notes) values(edge_id,evidence_id,'Attached during editorial compatibility review') on conflict do nothing;
  end if;
  insert into public.update_audit_events(actor_id,action,after_value,detail) values(auth.uid(),'compatibility_saved',jsonb_build_object('edge_id',edge_id,'status',p_status),jsonb_build_object('source_port_id',p_source_port_id,'target_port_id',p_target_port_id));
  return edge_id;
end $$;
revoke all on function public.save_compatibility_with_evidence(uuid,uuid,text,text,numeric,text,text,text,text) from public;
grant execute on function public.save_compatibility_with_evidence(uuid,uuid,text,text,numeric,text,text,text,text) to authenticated;
