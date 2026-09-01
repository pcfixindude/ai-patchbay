-- The server-only provisioning script resolves an existing Auth user and
-- creates or updates only that user's profile. DELETE is not part of this
-- workflow and is deliberately not granted.
grant select, insert, update on table public.profiles to service_role;
