# Ecosystem update scheduled entrypoint

This Edge Function is a service-to-service dispatcher. It requires `x-ecosystem-update-secret` to equal `ECOSYSTEM_UPDATE_SHARED_SECRET`, then forwards to the server-only updater runner at `ECOSYSTEM_UPDATE_RUNNER_URL` using a distinct `ECOSYSTEM_UPDATE_RUNNER_SECRET`.

The runner endpoint must validate its secret and invoke `runUpdater` with a service-role client. Do not point it at a browser route and do not deploy this function during local development.
