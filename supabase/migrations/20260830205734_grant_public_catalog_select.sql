-- The Data API requires table privileges in addition to RLS policies. These
-- grants expose no additional rows: every table below already has an RLS
-- policy that limits anonymous/authenticated reads to the public catalog.
grant select on table
  public.components,
  public.model_metadata,
  public.ports,
  public.compatibility_edges,
  public.sources,
  public.component_sources,
  public.model_metadata_sources,
  public.compatibility_edge_sources,
  public.component_external_refs
to anon, authenticated;
