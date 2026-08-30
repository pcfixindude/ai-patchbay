-- Milestone 3: observation-first updater pipeline. Adapters never write curated tables directly.

alter table public.update_runs drop constraint update_runs_status_check;
alter table public.update_runs
  add column adapter_id text,
  add column records_examined integer not null default 0 check (records_examined >= 0),
  add column observations_created integer not null default 0 check (observations_created >= 0),
  add column proposals_created integer not null default 0 check (proposals_created >= 0),
  add column proposals_auto_applied integer not null default 0 check (proposals_auto_applied >= 0),
  add column proposals_requiring_review integer not null default 0 check (proposals_requiring_review >= 0),
  add column error_count integer not null default 0 check (error_count >= 0),
  add column error_summary text,
  add column completed_at timestamptz,
  add column metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  add constraint update_runs_status_check check (status in ('queued','running','succeeded','partial','failed','cancelled'));
update public.update_runs set adapter_id = coalesce(adapter_id, 'legacy'), completed_at = finished_at where adapter_id is null;
alter table public.update_runs alter column adapter_id set not null;
create index update_runs_adapter_created_idx on public.update_runs(adapter_id, created_at desc);

alter table public.proposed_changes drop constraint proposed_changes_change_status_check;
alter table public.proposed_changes
  add column target_component_id uuid references public.components(id) on delete set null,
  add column observation_id uuid,
  add column operation text not null default 'set_component_field',
  add column field_name text,
  add column risk_classification text not null default 'medium' check (risk_classification in ('low','medium','high')),
  add column source_authority text not null default 'trusted_third_party' check (source_authority in ('official_api','official_repo','official_docs','model_card','announcement','trusted_third_party','community')),
  add column source_url text,
  add column confidence numeric(4,3) not null default 0.5 check (confidence between 0 and 1),
  add column fingerprint text,
  add column review_notes text,
  add column superseded_by uuid,
  add column failure_reason text,
  add constraint proposed_changes_change_status_check check (change_status in ('pending','auto_applied','approved','rejected','superseded','invalid','failed'));
create unique index proposed_changes_pending_fingerprint_idx on public.proposed_changes(fingerprint) where change_status = 'pending' and fingerprint is not null;
create index proposed_changes_review_queue_idx on public.proposed_changes(change_status, risk_classification, created_at desc);
create index proposed_changes_component_idx on public.proposed_changes(target_component_id, created_at desc);

create table public.component_external_refs (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  source_system text not null check (source_system in ('github','huggingface','openrouter','ollama')),
  external_id text not null,
  external_url text not null,
  canonical boolean not null default true,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_system, external_id),
  unique(component_id, source_system, external_id)
);
create index component_external_refs_component_idx on public.component_external_refs(component_id);

create table public.update_observations (
  id uuid primary key default gen_random_uuid(),
  update_run_id uuid not null references public.update_runs(id) on delete cascade,
  component_external_ref_id uuid references public.component_external_refs(id) on delete set null,
  source_system text not null,
  external_entity_id text not null,
  observation_type text not null,
  field_name text,
  observed_value jsonb not null,
  source_url text not null,
  source_timestamp timestamptz,
  retrieved_at timestamptz not null default now(),
  payload_hash text not null,
  payload_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(payload_snapshot) in ('object','array')),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  authority text not null check (authority in ('official_api','official_repo','official_docs','model_card','announcement','trusted_third_party','community')),
  fingerprint text not null,
  created_at timestamptz not null default now(),
  unique(update_run_id, fingerprint)
);
alter table public.proposed_changes add constraint proposed_changes_observation_id_fkey foreign key (observation_id) references public.update_observations(id) on delete set null;
create index update_observations_ref_field_idx on public.update_observations(component_external_ref_id, field_name, retrieved_at desc);
create index update_observations_fingerprint_idx on public.update_observations(fingerprint);

create table public.update_audit_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references public.proposed_changes(id) on delete set null,
  update_run_id uuid references public.update_runs(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('proposal_created','auto_applied','approved','rejected','superseded','failed')),
  before_value jsonb,
  after_value jsonb,
  detail jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object'),
  created_at timestamptz not null default now()
);
create index update_audit_events_proposal_idx on public.update_audit_events(proposal_id, created_at desc);

alter table public.component_external_refs enable row level security;
alter table public.update_observations enable row level security;
alter table public.update_audit_events enable row level security;

drop policy "editors manage update_sources" on public.update_sources;
drop policy "editors manage update_runs" on public.update_runs;
drop policy "editors manage proposed_changes" on public.proposed_changes;
create policy "editors read update sources" on public.update_sources for select to authenticated using (public.is_editor());
create policy "editors read update runs" on public.update_runs for select to authenticated using (public.is_editor());
create policy "editors read proposed changes" on public.proposed_changes for select to authenticated using (public.is_editor());
create policy "editors read external refs" on public.component_external_refs for select to authenticated using (public.is_editor());
create policy "editors read update observations" on public.update_observations for select to authenticated using (public.is_editor());
create policy "editors read update audit events" on public.update_audit_events for select to authenticated using (public.is_editor());

create or replace function public.review_update_proposal(p_proposal_id uuid, p_decision text, p_review_notes text default null)
returns public.proposed_changes
language plpgsql security definer set search_path = ''
as $$
declare proposal public.proposed_changes;
declare new_status text;
declare observed_timestamp timestamptz;
declare evidence_source_id uuid;
begin
  if not public.is_editor() and coalesce(auth.role(), '') <> 'service_role' then raise exception 'editor role required' using errcode = '42501'; end if;
  if p_decision not in ('approve','reject') then raise exception 'invalid review decision' using errcode = '22023'; end if;
  select * into proposal from public.proposed_changes where id = p_proposal_id for update;
  if not found then raise exception 'proposal not found' using errcode = 'P0002'; end if;
  if proposal.change_status <> 'pending' then raise exception 'proposal is no longer pending' using errcode = '55000'; end if;

  if p_decision = 'reject' then
    update public.proposed_changes set change_status = 'rejected', reviewer_id = auth.uid(), reviewed_at = now(), review_notes = p_review_notes where id = p_proposal_id returning * into proposal;
    insert into public.update_audit_events(proposal_id, actor_id, action, before_value, after_value, detail)
    values (proposal.id, auth.uid(), 'rejected', proposal.before_value, proposal.proposed_value, jsonb_build_object('notes', coalesce(p_review_notes, '')));
    return proposal;
  end if;

  if proposal.operation <> 'set_component_last_verified_at' or proposal.target_component_id is null then
    raise exception 'proposal operation requires a dedicated editorial workflow' using errcode = '22023';
  end if;
  if not exists(select 1 from public.components where id = proposal.target_component_id) then
    update public.proposed_changes set change_status = 'invalid', reviewer_id = auth.uid(), reviewed_at = now(), failure_reason = 'Target component no longer exists' where id = p_proposal_id returning * into proposal;
    return proposal;
  end if;
  observed_timestamp := coalesce((proposal.proposed_value ->> 'last_verified_at')::timestamptz, now());
  update public.components set last_verified_at = observed_timestamp, updated_at = now() where id = proposal.target_component_id;
  if proposal.source_url is not null then
    insert into public.sources(title, url, source_type, publisher, retrieved_at, notes)
    values ('Automated updater evidence', proposal.source_url, 'official_repo', coalesce(proposal.source_authority, 'Updater'), now(), proposal.rationale)
    on conflict (url) do update set retrieved_at = excluded.retrieved_at
    returning id into evidence_source_id;
    insert into public.component_sources(component_id, source_id, claim_type, notes)
    values (proposal.target_component_id, evidence_source_id, 'updater_identity', proposal.rationale)
    on conflict do nothing;
  end if;
  new_status := case when proposal.risk_classification = 'low' then 'auto_applied' else 'approved' end;
  update public.proposed_changes set change_status = new_status, reviewer_id = auth.uid(), reviewed_at = now(), applied_at = now(), review_notes = p_review_notes where id = p_proposal_id returning * into proposal;
  insert into public.update_audit_events(proposal_id, actor_id, action, before_value, after_value, detail)
  values (proposal.id, auth.uid(), case when new_status = 'auto_applied' then 'auto_applied' else 'approved' end, proposal.before_value, proposal.proposed_value, jsonb_build_object('notes', coalesce(p_review_notes, '')));
  return proposal;
end;
$$;
revoke all on function public.review_update_proposal(uuid, text, text) from public;
grant execute on function public.review_update_proposal(uuid, text, text) to authenticated;
