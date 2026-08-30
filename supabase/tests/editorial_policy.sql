begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(32);

insert into auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('91000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','viewer-policy@patchbay.test','',now(),now(),now()),
('91000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','editor-policy@patchbay.test','',now(),now(),now()),
('91000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin-policy@patchbay.test','',now(),now(),now());
insert into public.profiles(id,role) values
('91000000-0000-4000-8000-000000000001','viewer'),('91000000-0000-4000-8000-000000000002','editor'),('91000000-0000-4000-8000-000000000003','admin');

-- Isolated records exercise evidence classes and updater locking without changing seed facts.
insert into public.sources (id,title,url,source_type,publisher,retrieved_at) values
('92000000-0000-4000-8000-000000000001','Community evidence','https://policy.test/community','community','Patchbay community',now()),
('92000000-0000-4000-8000-000000000002','Internal test evidence','https://policy.test/internal','internal_test','Patchbay QA',now());
insert into public.compatibility_edges (id,source_port_id,target_port_id,status,compatibility_level,confidence,notes) values
('93000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000013','verified_community','compatible',0.8,'Community evidence fixture'),
('93000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000015','tested_internal','compatible',0.8,'Internal evidence fixture'),
('93000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000018','unverified','compatible',0.5,'Unverified fixture');
insert into public.compatibility_edge_sources (compatibility_edge_id,source_id) values
('93000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001'),
('93000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000002'),
('93000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000009');

insert into public.update_runs (id,update_source_id,adapter_id,status,started_at) values
('94000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','github','running',now()),
('94000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000003','openrouter','succeeded',now());
insert into public.proposed_changes (id,update_run_id,entity_table,entity_id,target_component_id,operation,field_name,risk_classification,source_authority,source_url,confidence,objective_change,proposed_value,rationale,fingerprint) values
('95000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000003','components','00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','set_component_last_verified_at','last_verified_at','low','official_api','https://policy.test/low',1,true,'{"last_verified_at":"2026-08-29T00:00:00Z"}','Safe bulk approval fixture','policy-low'),
('95000000-0000-4000-8000-000000000002','94000000-0000-4000-8000-000000000003','compatibility_edges',null,'00000000-0000-4000-8000-000000000003','candidate_compatibility','status','high','official_api','https://policy.test/high',1,false,'{"status":"verified_official"}','High-risk bulk fixture','policy-high'),
('95000000-0000-4000-8000-000000000003','94000000-0000-4000-8000-000000000003','components','00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','set_component_last_verified_at','last_verified_at','low','official_api','https://policy.test/mixed',1,true,'{"last_verified_at":"2026-08-29T00:00:00Z"}','Mixed-selection fixture','policy-mixed');

set local role anon;
select throws_ok($$select public.attach_compatibility_source('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001')$$,'42501','editor role required','anon cannot attach compatibility evidence');
select throws_ok($$select public.detach_compatibility_source('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001')$$,'42501','editor role required','anon cannot detach compatibility evidence');
select throws_ok($$select public.bulk_review_update_proposals(array['00000000-0000-4000-8000-000000000001'::uuid],'reject')$$,'42501','editor role required','anon cannot bulk review');

reset role; set local role authenticated;
select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.attach_compatibility_source('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001')$$,'42501','editor role required','viewer cannot attach compatibility evidence');
select throws_ok($$select public.bulk_review_update_proposals(array['00000000-0000-4000-8000-000000000001'::uuid],'reject')$$,'42501','editor role required','viewer cannot bulk review');

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000002',true);
select lives_ok($$select public.attach_compatibility_source('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001')$$,'editor attachment is idempotent');
select results_eq($$select count(*)::bigint from public.compatibility_edge_sources where compatibility_edge_id='30000000-0000-4000-8000-000000000001' and source_id='20000000-0000-4000-8000-000000000001'$$,array[1::bigint],'duplicate attachment does not duplicate evidence relationship');
select throws_ok($$select public.detach_compatibility_source('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001')$$,'22023','downgrade trust status before detaching the last qualifying evidence source','final official evidence cannot be detached');
select ok(exists(select 1 from public.update_audit_events where action='compatibility_saved'),'evidence attachment writes immutable audit event');
select throws_ok($$insert into public.compatibility_edges(source_port_id,target_port_id,status,compatibility_level,confidence,notes) values('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','unverified','compatible',0.5,'duplicate')$$,'23505',null,'exact typed-port edge uniqueness is enforced');
select throws_ok($$select public.attach_compatibility_source('93000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001')$$,'22023','community compatibility requires community evidence','community trust rejects first-party-only evidence');
select throws_ok($$select public.attach_compatibility_source('93000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001')$$,'22023','tested internal compatibility requires internal-test evidence','tested internal trust rejects non-test evidence');
select throws_ok($$select public.detach_compatibility_source('93000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001')$$,'22023','downgrade trust status before detaching the last qualifying evidence source','final community evidence cannot be detached');
select throws_ok($$select public.detach_compatibility_source('93000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000002')$$,'22023','downgrade trust status before detaching the last qualifying evidence source','final internal-test evidence cannot be detached');
select lives_ok($$select public.detach_compatibility_source('93000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000009')$$,'unverified compatibility may detach supporting evidence');
select throws_ok($$select public.save_compatibility_with_evidence('10000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000005','verified_official','compatible',0.8,'Missing proof',null,null,null)$$,'22023','verified compatibility requires supporting evidence','verified official compatibility requires an evidence URL');
select lives_ok($$select public.save_compatibility_with_evidence('10000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000005','inferred','partial',0.4,'Explicitly inferred',null,null,null)$$,'inferred compatibility can be recorded without evidence');
select lives_ok($$select public.bulk_review_update_proposals(array['95000000-0000-4000-8000-000000000001'::uuid],'approve')$$,'safe low-risk bulk approval succeeds');
select results_eq($$select change_status from public.proposed_changes where id='95000000-0000-4000-8000-000000000001'$$,array['auto_applied'::text],'safe bulk approval retains the auto-applied outcome');
select throws_ok($$select public.bulk_review_update_proposals(array['95000000-0000-4000-8000-000000000002'::uuid],'approve')$$,'22023','selection includes a review-required high-risk or unsupported change','high-risk bulk approval is rejected');
select throws_ok($$select public.bulk_review_update_proposals(array['95000000-0000-4000-8000-000000000002'::uuid],'approve')$$,'22023','selection includes a review-required high-risk or unsupported change','compatibility proposal bulk approval is rejected');
select throws_ok($$select public.bulk_review_update_proposals(array['95000000-0000-4000-8000-000000000003'::uuid,'95000000-0000-4000-8000-000000000002'::uuid],'approve')$$,'22023','selection includes a review-required high-risk or unsupported change','mixed selections cannot bypass bulk-approval policy');
select results_eq($$select change_status from public.proposed_changes where id='95000000-0000-4000-8000-000000000003'$$,array['pending'::text],'mixed-selection rejection leaves otherwise-safe proposals unprocessed');
select lives_ok($$select public.bulk_review_update_proposals(array['95000000-0000-4000-8000-000000000002'::uuid],'reject')$$,'bulk rejection succeeds for a review-required proposal');
select results_eq($$select change_status from public.proposed_changes where id='95000000-0000-4000-8000-000000000002'$$,array['rejected'::text],'bulk rejection records the rejected outcome');
select throws_ok($$select public.bulk_review_update_proposals(array_fill('95000000-0000-4000-8000-000000000001'::uuid,array[51]),'reject')$$,'22023','select between 1 and 50 proposals','bulk review rejects selections above 50 proposals');
select lives_ok($$update public.compatibility_edges set notes='editorial policy test update' where id='30000000-0000-4000-8000-000000000010'$$,'editor can edit unverified compatibility');
select is_empty($$delete from public.update_audit_events where action='compatibility_saved' returning id$$,'editors cannot delete audit history');

select set_config('request.jwt.claim.sub','91000000-0000-4000-8000-000000000003',true);
select lives_ok($$update public.compatibility_edges set notes='admin editorial policy test update' where id='30000000-0000-4000-8000-000000000011'$$,'admin can edit compatibility');
reset role;
select throws_ok($$insert into public.update_runs(id,update_source_id,adapter_id,status) values('94000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000001','github','queued')$$,'23505',null,'active runs lock a single adapter');
select lives_ok($$insert into public.update_runs(id,update_source_id,adapter_id,status) values('94000000-0000-4000-8000-000000000004','40000000-0000-4000-8000-000000000002','huggingface','queued')$$,'different adapters may run concurrently');
select results_eq($$select count(*)::bigint from public.update_runs where status in ('running','queued') group by update_source_id having count(*) > 1$$,array[]::bigint[],'active-run uniqueness has no duplicate active adapter rows');

select * from finish();
rollback;
