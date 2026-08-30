begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(8);

select cmp_ok((select count(*) from public.components where status in ('published','deprecated')), '>='::text, 100::bigint, 'curated catalog contains at least 100 published or historical components');
select cmp_ok((select count(*) from public.components where component_type='organization'), '>='::text, 15::bigint, 'major creators are represented');
select cmp_ok((select count(*) from public.components where component_type in ('model_family','model','model_variant')), '>='::text, 35::bigint, 'model families and selected variants are represented');
select cmp_ok((select count(*) from public.components where component_type in ('runtime','inference_provider','gateway','hosting_platform')), '>='::text, 20::bigint, 'runtimes and hosted providers are represented');
select cmp_ok((select count(*) from public.components where component_type in ('agent','coding_agent','agent_framework','sdk','protocol')), '>='::text, 25::bigint, 'agents, frameworks, SDKs, and protocols are represented');
select is_empty($$select c.slug from public.components c where c.component_type in ('organization','model_family','model','model_variant','runtime','inference_provider','gateway','hosting_platform','agent','coding_agent','agent_framework','sdk','protocol') and c.status='published' and not exists(select 1 from public.component_sources cs where cs.component_id=c.id)$$, 'branded and catalog-relevant records have a first-party resource source');
select is_empty($$select c.slug from public.components c where c.component_type in ('model','model_variant') and c.parent_component_id is null$$, 'models and variants preserve a parent hierarchy');
select is_empty($$select e.id from public.compatibility_edges e where e.status in ('verified_official','verified_first_party','verified_community','tested_internal') and not exists(select 1 from public.compatibility_edge_sources es where es.compatibility_edge_id=e.id)$$, 'verified compatibility edges retain evidence');

select * from finish();
rollback;
