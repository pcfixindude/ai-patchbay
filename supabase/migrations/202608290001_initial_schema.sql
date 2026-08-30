create extension if not exists pgcrypto;

create table public.component_types (
  key text primary key check (key ~ '^[a-z][a-z0-9_]*$'),
  label text not null,
  display_order integer not null default 100,
  created_at timestamptz not null default now()
);

insert into public.component_types (key, label, display_order) values
  ('organization','Organization',10), ('creator','Creator',20), ('model_family','Model family',30),
  ('model','Model',40), ('model_variant','Model variant',50), ('runtime','Runtime',60),
  ('inference_provider','Inference provider',70), ('gateway','Gateway',80), ('router','Router',90),
  ('agent','Agent',100), ('coding_agent','Coding agent',110), ('agent_framework','Agent framework',120),
  ('sdk','SDK',130), ('interface','Interface',140), ('ide','IDE',150), ('cli','CLI',160),
  ('protocol','Protocol',170), ('tool','Tool',180), ('data_source','Data source',190),
  ('observability','Observability',200), ('workflow_builder','Workflow builder',210), ('hosting_platform','Hosting platform',220);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer','editor','admin')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.components (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  short_name text not null,
  component_type text not null references public.component_types(key),
  subtype text,
  parent_component_id uuid references public.components(id) on delete set null,
  organization_id uuid references public.components(id) on delete set null,
  description text not null,
  long_description text,
  status text not null default 'draft' check (status in ('draft','published','deprecated')),
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  official_website_url text,
  docs_url text,
  github_url text,
  huggingface_url text,
  pricing_url text,
  logo_path text,
  logo_url text,
  logo_source_url text,
  logo_license_notes text,
  open_source boolean,
  open_weights boolean,
  local_capable boolean,
  cloud_capable boolean,
  cli_available boolean,
  gui_available boolean,
  vision_capable boolean,
  coding_capable boolean,
  tool_calling_capable boolean,
  multimodal boolean,
  operating_systems jsonb not null default '[]'::jsonb check (jsonb_typeof(operating_systems) = 'array'),
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags) = 'array'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  first_seen_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index components_type_idx on public.components(component_type);
create index components_public_catalog_idx on public.components(status, visibility, component_type);
create index components_parent_idx on public.components(parent_component_id);
create index components_organization_idx on public.components(organization_id);
create index components_last_verified_idx on public.components(last_verified_at);
create index components_tags_gin on public.components using gin(tags);
create index components_search_idx on public.components using gin(to_tsvector('english', name || ' ' || description));

create table public.component_aliases (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  alias text not null,
  normalized_alias text generated always as (lower(alias)) stored,
  unique(component_id, normalized_alias)
);

create table public.model_metadata (
  component_id uuid primary key references public.components(id) on delete cascade,
  inherits_from_component_id uuid references public.components(id) on delete set null,
  parameter_count bigint,
  active_parameter_count bigint,
  architecture text,
  context_window integer,
  maximum_output_tokens integer,
  modalities jsonb not null default '[]'::jsonb,
  vision_support boolean,
  audio_support boolean,
  tool_calling boolean,
  reasoning boolean,
  coding_specialization boolean,
  quantization text,
  weight_format text,
  approximate_file_size_bytes bigint,
  minimum_ram_bytes bigint,
  recommended_ram_bytes bigint,
  accelerator_notes text,
  apple_silicon_notes text,
  license text,
  release_date date,
  deprecated_date date,
  assumptions text,
  updated_at timestamptz not null default now()
);

create table public.ports (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  name text not null,
  slug text not null,
  direction text not null check (direction in ('input','output','bidirectional')),
  protocol_type text not null,
  transport_type text not null,
  data_type text not null,
  cardinality text not null default 'many' check (cardinality in ('one','many')),
  required boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(component_id, slug)
);
create index ports_component_idx on public.ports(component_id);
create index ports_protocol_idx on public.ports(protocol_type, data_type);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  source_type text not null check (source_type in ('official_docs','official_repo','model_card','announcement','community','internal_test')),
  publisher text not null,
  publication_date date,
  retrieved_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.compatibility_edges (
  id uuid primary key default gen_random_uuid(),
  source_port_id uuid not null references public.ports(id) on delete cascade,
  target_port_id uuid not null references public.ports(id) on delete cascade,
  status text not null check (status in ('verified_official','verified_first_party','verified_community','tested_internal','inferred','unverified','incompatible','deprecated')),
  compatibility_level text not null check (compatibility_level in ('native','compatible','partial','none')),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  notes text not null,
  limitations text,
  minimum_version text,
  maximum_version text,
  platform_constraints jsonb not null default '[]'::jsonb,
  configuration_required boolean not null default false,
  configuration_notes text,
  last_verified_at timestamptz,
  deprecated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_port_id <> target_port_id),
  unique(source_port_id, target_port_id)
);
create index compatibility_source_idx on public.compatibility_edges(source_port_id);
create index compatibility_target_idx on public.compatibility_edges(target_port_id);
create index compatibility_status_idx on public.compatibility_edges(status);
create index compatibility_last_verified_idx on public.compatibility_edges(last_verified_at);

create table public.component_sources (
  component_id uuid not null references public.components(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  claim_type text not null default 'general',
  notes text,
  primary key(component_id, source_id, claim_type)
);
create table public.model_metadata_sources (
  component_id uuid not null references public.model_metadata(component_id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  field_name text not null,
  assumptions text,
  primary key(component_id, source_id, field_name)
);
create table public.compatibility_edge_sources (
  compatibility_edge_id uuid not null references public.compatibility_edges(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  evidence_notes text,
  primary key(compatibility_edge_id, source_id)
);

create table public.builds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  schema_version integer not null default 1,
  graph jsonb not null check (jsonb_typeof(graph) = 'object'),
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index builds_owner_idx on public.builds(owner_id);

create table public.update_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  adapter_type text not null,
  base_url text,
  enabled boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.update_runs (
  id uuid primary key default gen_random_uuid(),
  update_source_id uuid not null references public.update_sources(id),
  status text not null check (status in ('queued','running','completed','failed')),
  started_at timestamptz,
  finished_at timestamptz,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);
create table public.proposed_changes (
  id uuid primary key default gen_random_uuid(),
  update_run_id uuid not null references public.update_runs(id) on delete cascade,
  entity_table text not null,
  entity_id uuid,
  change_status text not null default 'pending' check (change_status in ('pending','approved','rejected','applied')),
  objective_change boolean not null default false,
  before_value jsonb,
  proposed_value jsonb not null,
  rationale text,
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role in ('editor','admin')); $$;
revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to anon, authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.component_types enable row level security;
alter table public.profiles enable row level security;
alter table public.components enable row level security;
alter table public.component_aliases enable row level security;
alter table public.model_metadata enable row level security;
alter table public.ports enable row level security;
alter table public.sources enable row level security;
alter table public.compatibility_edges enable row level security;
alter table public.component_sources enable row level security;
alter table public.model_metadata_sources enable row level security;
alter table public.compatibility_edge_sources enable row level security;
alter table public.builds enable row level security;
alter table public.update_sources enable row level security;
alter table public.update_runs enable row level security;
alter table public.proposed_changes enable row level security;

create policy "public reads types" on public.component_types for select to anon, authenticated using (true);
create policy "public reads published components" on public.components for select to anon, authenticated using (status in ('published','deprecated') and visibility = 'public');
create policy "public reads published aliases" on public.component_aliases for select to anon, authenticated using (exists(select 1 from public.components c where c.id = component_id and c.status in ('published','deprecated') and c.visibility = 'public'));
create policy "public reads published model metadata" on public.model_metadata for select to anon, authenticated using (exists(select 1 from public.components c where c.id = component_id and c.status in ('published','deprecated') and c.visibility = 'public'));
create policy "public reads published ports" on public.ports for select to anon, authenticated using (exists(select 1 from public.components c where c.id = component_id and c.status in ('published','deprecated') and c.visibility = 'public'));
create policy "public reads published compatibility" on public.compatibility_edges for select to anon, authenticated using (
  exists (
    select 1
    from public.ports source_port
    join public.components source_component on source_component.id = source_port.component_id
    join public.ports target_port on target_port.id = target_port_id
    join public.components target_component on target_component.id = target_port.component_id
    where source_port.id = source_port_id
      and source_component.status in ('published','deprecated') and source_component.visibility = 'public'
      and target_component.status in ('published','deprecated') and target_component.visibility = 'public'
  )
);
create policy "public reads published component evidence" on public.component_sources for select to anon, authenticated using (exists(select 1 from public.components c where c.id = component_id and c.status in ('published','deprecated') and c.visibility = 'public'));
create policy "public reads published model evidence" on public.model_metadata_sources for select to anon, authenticated using (exists(select 1 from public.components c where c.id = component_id and c.status in ('published','deprecated') and c.visibility = 'public'));
create policy "public reads published compatibility evidence" on public.compatibility_edge_sources for select to anon, authenticated using (exists(select 1 from public.compatibility_edges edge where edge.id = compatibility_edge_id));
create policy "public reads attached sources" on public.sources for select to anon, authenticated using (
  exists(select 1 from public.component_sources link where link.source_id = id)
  or exists(select 1 from public.model_metadata_sources link where link.source_id = id)
  or exists(select 1 from public.compatibility_edge_sources link where link.source_id = id)
);
create policy "users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "users read own builds or published builds" on public.builds for select to anon, authenticated using (owner_id = auth.uid() or visibility in ('public','unlisted'));
create policy "users create own builds" on public.builds for insert to authenticated with check (owner_id = auth.uid());
create policy "users update own builds" on public.builds for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "users delete own builds" on public.builds for delete to authenticated using (owner_id = auth.uid());

create policy "admins manage component types" on public.component_types for all to authenticated using (public.is_admin()) with check (public.is_admin());

do $$
declare table_name text;
begin
  foreach table_name in array array['components','component_aliases','model_metadata','ports','sources','compatibility_edges','component_sources','model_metadata_sources','compatibility_edge_sources','update_sources','update_runs','proposed_changes']
  loop
    execute format('create policy "editors manage %1$s" on public.%1$I for all to authenticated using (public.is_editor()) with check (public.is_editor())', table_name);
  end loop;
end $$;
