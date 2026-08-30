-- Milestone 4B: enforce bulk-review policy and manage compatibility evidence atomically.

create or replace function public.attach_compatibility_source(p_edge_id uuid, p_source_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare edge_status text; evidence_type text;
begin
  if not public.is_editor() then raise exception 'editor role required' using errcode = '42501'; end if;
  select status into edge_status from public.compatibility_edges where id=p_edge_id;
  select source_type into evidence_type from public.sources where id=p_source_id;
  if edge_status is null or evidence_type is null then raise exception 'edge or source not found' using errcode='P0002'; end if;
  if edge_status in ('verified_official','verified_first_party') and evidence_type not in ('official_docs','official_repo','model_card','announcement') then raise exception 'official compatibility requires first-party evidence' using errcode='22023'; end if;
  if edge_status='verified_community' and evidence_type <> 'community' then raise exception 'community compatibility requires community evidence' using errcode='22023'; end if;
  if edge_status='tested_internal' and evidence_type <> 'internal_test' then raise exception 'tested internal compatibility requires internal-test evidence' using errcode='22023'; end if;
  insert into public.compatibility_edge_sources(compatibility_edge_id,source_id,evidence_notes) values(p_edge_id,p_source_id,'Attached in compatibility editor') on conflict do nothing;
  insert into public.update_audit_events(actor_id,action,after_value,detail) values(auth.uid(),'compatibility_saved',jsonb_build_object('edge_id',p_edge_id),jsonb_build_object('evidence_added',p_source_id));
end $$;
revoke all on function public.attach_compatibility_source(uuid,uuid) from public;
grant execute on function public.attach_compatibility_source(uuid,uuid) to authenticated;

create or replace function public.detach_compatibility_source(p_edge_id uuid, p_source_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare edge_status text; remaining_qualifying integer;
begin
  if not public.is_editor() then raise exception 'editor role required' using errcode = '42501'; end if;
  select status into edge_status from public.compatibility_edges where id=p_edge_id for update;
  if edge_status in ('verified_official','verified_first_party','verified_community','tested_internal') then
    select count(*) into remaining_qualifying from public.compatibility_edge_sources ces join public.sources s on s.id=ces.source_id where ces.compatibility_edge_id=p_edge_id and ces.source_id<>p_source_id and ((edge_status in ('verified_official','verified_first_party') and s.source_type in ('official_docs','official_repo','model_card','announcement')) or (edge_status='verified_community' and s.source_type='community') or (edge_status='tested_internal' and s.source_type='internal_test'));
    if remaining_qualifying=0 then raise exception 'downgrade trust status before detaching the last qualifying evidence source' using errcode='22023'; end if;
  end if;
  delete from public.compatibility_edge_sources where compatibility_edge_id=p_edge_id and source_id=p_source_id;
  insert into public.update_audit_events(actor_id,action,after_value,detail) values(auth.uid(),'compatibility_saved',jsonb_build_object('edge_id',p_edge_id),jsonb_build_object('evidence_removed',p_source_id));
end $$;
revoke all on function public.detach_compatibility_source(uuid,uuid) from public;
grant execute on function public.detach_compatibility_source(uuid,uuid) to authenticated;

create or replace function public.bulk_review_update_proposals(p_proposal_ids uuid[], p_decision text, p_review_notes text default null)
returns integer language plpgsql security definer set search_path = '' as $$
declare proposal_id uuid; proposal public.proposed_changes; reviewed integer:=0;
begin
  if not public.is_editor() then raise exception 'editor role required' using errcode='42501'; end if;
  if coalesce(array_length(p_proposal_ids,1),0)=0 or array_length(p_proposal_ids,1)>50 then raise exception 'select between 1 and 50 proposals' using errcode='22023'; end if;
  if p_decision not in ('approve','reject') then raise exception 'invalid decision' using errcode='22023'; end if;
  if p_decision='approve' and exists(select 1 from public.proposed_changes where id=any(p_proposal_ids) and change_status='pending' and (risk_classification='high' or operation <> 'set_component_last_verified_at')) then raise exception 'selection includes a review-required high-risk or unsupported change' using errcode='22023'; end if;
  foreach proposal_id in array p_proposal_ids loop
    select * into proposal from public.proposed_changes where id=proposal_id;
    if found and proposal.change_status='pending' then perform public.review_update_proposal(proposal_id,p_decision,p_review_notes); reviewed:=reviewed+1; end if;
  end loop;
  return reviewed;
end $$;
revoke all on function public.bulk_review_update_proposals(uuid[],text,text) from public;
grant execute on function public.bulk_review_update_proposals(uuid[],text,text) to authenticated;
