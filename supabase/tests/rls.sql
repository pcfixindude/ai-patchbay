begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(30);

select has_table('public', 'components', 'components exists');
select has_table('public', 'compatibility_edges', 'compatibility_edges exists');
select has_index('public', 'components', 'components_public_catalog_idx', 'public catalog index exists');
select has_index('public', 'compatibility_edges', 'compatibility_status_idx', 'compatibility status index exists');
select has_table('public', 'component_external_refs', 'external refs exist');
select has_table('public', 'update_observations', 'update observations exist');
select has_index('public', 'proposed_changes', 'proposed_changes_pending_fingerprint_idx', 'proposal dedup index exists');
select policies_are('public', 'components', array['public reads published components','editors manage components'], 'component policies are explicit');
select policies_are('public', 'builds', array['users read own builds or published builds','users create own builds','users update own builds','users delete own builds'], 'build ownership policies are explicit');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('90000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','editor@patchbay.test','',now(),now(),now()),
  ('90000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin@patchbay.test','',now(),now(),now());
insert into public.profiles (id, role, display_name) values
  ('90000000-0000-4000-8000-000000000001','editor','Test Editor'),
  ('90000000-0000-4000-8000-000000000002','admin','Test Admin');
insert into public.update_runs (id, update_source_id, adapter_id, status, started_at, completed_at) values
  ('90000000-0000-4000-8000-000000000020','40000000-0000-4000-8000-000000000001','github','succeeded',now(),now());
insert into public.proposed_changes (id, update_run_id, entity_table, entity_id, target_component_id, operation, field_name, risk_classification, source_authority, source_url, confidence, objective_change, proposed_value, rationale, fingerprint) values
  ('90000000-0000-4000-8000-000000000021','90000000-0000-4000-8000-000000000020','components','00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','set_component_last_verified_at','github_updated_at','low','official_api','https://github.com/ollama/ollama',1,true,'{"last_verified_at":"2026-08-29T00:00:00Z"}','Test low-risk updater proposal.','test-updater-proposal');
insert into public.proposed_changes (id, update_run_id, entity_table, entity_id, target_component_id, operation, field_name, risk_classification, source_authority, source_url, confidence, objective_change, proposed_value, rationale, fingerprint) values
  ('90000000-0000-4000-8000-000000000022','90000000-0000-4000-8000-000000000020','compatibility_edges',null,'00000000-0000-4000-8000-000000000003','candidate_compatibility','compatibility_edge_status','high','official_api','https://example.com',1,false,'{"status":"verified_official"}','High-risk proposal must be rejected.','test-high-risk-proposal');

set local role anon;
select results_eq(
  $$select count(*)::bigint from public.components where slug in ('nous-research','hermes-model-family','hermes-agent')$$,
  array[3::bigint],
  'anonymous users read published components'
);
select cmp_ok(
  (select count(*) from public.sources), '>='::text, 13::bigint,
  'anonymous users read all evidence attached to published records'
);
select cmp_ok(
  (select count(*) from public.compatibility_edges), '>='::text, 12::bigint,
  'anonymous users read all published compatibility edges'
);
select throws_ok(
  $$insert into public.components (slug,name,short_name,component_type,description) values ('anon-insert','Anon Insert','Anon','tool','Must be rejected by RLS.')$$,
  '42501',
  'new row violates row-level security policy for table "components"',
  'anonymous users cannot insert components'
);
select is_empty(
  $$update public.components set name = 'Compromised' where slug = 'ollama' returning id$$,
  'anonymous users cannot update components'
);
select is_empty(
  $$delete from public.components where slug = 'ollama' returning id$$,
  'anonymous users cannot delete components'
);
select throws_ok(
  $$insert into public.compatibility_edges (source_port_id,target_port_id,status,compatibility_level,confidence,notes) values ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','verified_official','native',1,'Unauthorized claim')$$,
  '42501',
  'new row violates row-level security policy for table "compatibility_edges"',
  'anonymous users cannot create compatibility claims'
);
select throws_ok(
  $$insert into public.profiles (id,role) values ('90000000-0000-4000-8000-000000000099','admin')$$,
  '42501',
  'new row violates row-level security policy for table "profiles"',
  'anonymous users cannot grant privileged roles'
);
select is_empty($$select id from public.update_runs$$, 'anonymous users cannot read updater runs');
select throws_ok(
  $$insert into public.update_runs (update_source_id,adapter_id,status) values ('40000000-0000-4000-8000-000000000001','github','queued')$$,
  '42501',
  'new row violates row-level security policy for table "update_runs"',
  'anonymous users cannot create update runs'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
select lives_ok(
  $$insert into public.components (id,slug,name,short_name,component_type,description,status,visibility) values ('90000000-0000-4000-8000-000000000010','editor-component','Editor Component','Editor','tool','Created by the authorized editor test.','draft','private')$$,
  'editors can create curated records'
);
select results_eq($$select count(*)::bigint from public.update_runs$$, array[1::bigint], 'editors can read updater runs');
select throws_ok(
  $$insert into public.update_observations (update_run_id,source_system,external_entity_id,observation_type,field_name,observed_value,source_url,payload_hash,payload_snapshot,confidence,authority,fingerprint) values ('90000000-0000-4000-8000-000000000020','github','owner/repo','repository','github_updated_at','"now"','https://example.com','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','{}',1,'official_api','test')$$,
  '42501',
  'new row violates row-level security policy for table "update_observations"',
  'editors cannot write updater observations directly'
);
select is_empty(
  $$update public.profiles set role = 'admin' where id = '90000000-0000-4000-8000-000000000001' returning id$$,
  'editors cannot grant themselves admin'
);

select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
select results_eq(
  $$update public.profiles set role = 'admin' where id = '90000000-0000-4000-8000-000000000001' returning id$$,
  $$values ('90000000-0000-4000-8000-000000000001'::uuid)$$,
  'admins can manage profile roles'
);
select ok(public.is_admin(), 'admin helper recognizes an admin session');
select lives_ok(
  $$select public.review_update_proposal('90000000-0000-4000-8000-000000000021','approve','reviewed in pgTAP')$$,
  'admin can transactionally apply a low-risk proposal'
);
select results_eq(
  $$select change_status from public.proposed_changes where id = '90000000-0000-4000-8000-000000000021'$$,
  $$values ('auto_applied'::text)$$,
  'approved low-risk proposal is recorded as auto applied'
);
select results_eq(
  $$select count(*)::bigint from public.update_audit_events where proposal_id = '90000000-0000-4000-8000-000000000021'$$,
  array[1::bigint],
  'review produces immutable audit history'
);
select lives_ok(
  $$select public.review_update_proposal('90000000-0000-4000-8000-000000000022','reject','Compatibility needs editorial evidence')$$,
  'admin can reject a high-risk proposal without applying it'
);
select results_eq(
  $$select change_status from public.proposed_changes where id = '90000000-0000-4000-8000-000000000022'$$,
  $$values ('rejected'::text)$$,
  'rejected proposal preserves production data and history'
);

select * from finish();
rollback;
