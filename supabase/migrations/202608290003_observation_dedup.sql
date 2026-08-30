-- Observations are retained once per exact external fact; repeat polling records the run summary without duplicating payload snapshots.
create unique index update_observations_external_fact_idx
  on public.update_observations(source_system, external_entity_id, field_name, payload_hash);
