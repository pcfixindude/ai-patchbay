# AI Patchbay

AI Patchbay is an evidence-aware visual compatibility map for AI models, runtimes, gateways, agents, protocols, and tools. It uses a professional patch-panel metaphor: components expose typed ports, cables represent first-class compatibility records, and every important claim can carry source evidence and a trust status.

The V1 vertical slice lets a user explore a curated ecosystem, distinguish the Hermes model family from Hermes Agent, assemble a stack on a React Flow canvas, connect only compatible ports, inspect components and cables, see useful rejection explanations, auto-arrange a graph, and save or share a Zod-validated build.

## Architecture

The app is organized around six independent domain concepts:

1. `components` describe ecosystem entities and their hierarchy.
2. `ports` describe typed inputs and outputs.
3. `compatibility_edges` describe one supported or unsupported port-to-port relationship.
4. `sources` and evidence join tables preserve provenance.
5. `builds` store user-selected component instances and connections.
6. updater tables stage candidate changes for review rather than overwriting curated facts.

The compatibility engine in `src/lib/compatibility/` is storage-agnostic and made of pure functions. UI components call it; they do not implement their own connection rules. Supabase PostgreSQL is the runtime authority. Server Components load a complete typed graph through `src/lib/data/ecosystem-repository.ts`, database rows are normalized by Zod-backed mappers, and the canvas receives plain serializable domain data. `src/data/ecosystem.ts` remains only as an explicit development/test fixture.

## Stack

- Next.js App Router and React
- strict TypeScript
- Tailwind CSS plus product-specific CSS tokens
- React Flow (`@xyflow/react`) with custom nodes and real handles
- Supabase Auth and PostgreSQL with RLS
- Zod for saved builds and editor inputs
- Vitest for domain tests
- Playwright for end-to-end interactions
- ESLint and Prettier
- pnpm

## Prerequisites

- Node.js 20.9 or newer
- pnpm 11 or newer
- Docker Desktop and Supabase CLI for the local database workflow

## Install and run

```bash
pnpm install
cp .env.example .env.local
pnpm supabase:start
pnpm db:reset
pnpm dev
```

Copy the local URL and publishable key printed by the CLI into `.env.local`, then open `http://localhost:3000`. Runtime reads default to Supabase and database failures surface as errors. To use the fixture during isolated development, set `AI_PATCHBAY_DATA_SOURCE=bootstrap`; this mode is rejected when `NODE_ENV=production`.

## Local Supabase

The project-local Supabase CLI is installed as a dev dependency. Start and reset the stack with:

```bash
pnpm supabase:start
pnpm db:reset
```

`supabase db reset` applies the append-only migrations and the ordered seed paths `supabase/seed.sql` and `supabase/seed_catalog.sql`. The latter is a bounded, reviewable curated catalog—not a vendor scrape. Copy the local API URL and publishable/anon key printed by the CLI into `.env.local`.

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: public project API URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public browser-safe key.
- `SUPABASE_SERVICE_ROLE_KEY`: optional server-only privileged key. Never expose or commit it.
- `AI_PATCHBAY_DATA_SOURCE`: `supabase` by default; `bootstrap` is an explicit non-production fixture mode.
- `NEXT_PUBLIC_SITE_URL`: trusted canonical site origin used by metadata; defaults to localhost.

Useful lifecycle commands:

```bash
pnpm supabase:stop
pnpm supabase:start
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm catalog:audit
```

`pnpm db:types` regenerates `src/lib/database.types.ts` from the running local schema. Use `pnpm db:types:check` in verification to detect drift without changing the file.

## Automated updater and editorial review

The updater is observation-first: GitHub, Hugging Face, OpenRouter, and optional local Ollama adapters normalize external facts into `update_observations`. They never write components, ports, model metadata, compatibility edges, or trust state directly. `component_external_refs` provides explicit `source_system + external_id` mappings, so display names are never used to match an external record.

`update_runs` records each adapter attempt. A deterministic fingerprint prevents repeated payloads from creating duplicate observations or pending proposals. Changed facts create `proposed_changes`, which retain the source URL, authority, confidence, normalized snapshot, reason, and risk class. The Update Center is visible only to authenticated editors/admins; it uses an RLS-protected, transactional review function and audit events.

- Low risk: objective repository/catalog timestamps, release tags, and exact external IDs. Official API/repository observations may be auto-applied with evidence and an audit entry.
- Medium risk: capability flags, family assignment, and deprecation signals. These always require review.
- High risk: compatibility, trust, recommendations, hardware/performance assertions, and removals. These are never auto-applied. Catalog presence is not compatibility evidence.

Freshness is centralized: identity facts age after 180 days, provider availability and pricing after 30 days, and compatibility after 90 days. Aging or stale data is not automatically treated as false.

Commands:

```bash
# Store runs, observations, proposals, and safe auto-applies locally.
pnpm update:run
pnpm update:github
pnpm update:huggingface
pnpm update:openrouter

# Opt-in network check: prints a small set of normalized observations, no database writes.
pnpm update:smoke
```

For a local Supabase URL, the command obtains the local service-role key in-process from the project-local CLI; it never prints or writes that value. Hosted deployments must set `SUPABASE_SERVICE_ROLE_KEY` only on the server. `GITHUB_TOKEN`, `HUGGINGFACE_TOKEN`, and `OPENROUTER_API_KEY` are optional and improve authenticated quota where a vendor supports them. Ollama is disabled by default and uses `OLLAMA_ENDPOINT` only when explicitly enabled in `update_sources`.

Future hosted scheduling should invoke the same runner from a Supabase Cron-triggered Edge Function or a server job with service-role credentials. Keep the schedule narrow, retain the retry/backoff limits, and never expose an updater endpoint without authentication.

## Editor authentication and scheduling

`/login` uses Supabase Auth email/password through the browser client, with cookie-backed SSR session refresh in `src/proxy.ts`. `/admin` always evaluates the authenticated user and `profiles.role` on the server; a signed-in viewer gets a helpful access state, while editors and admins receive the Update Center. Use the visible sign-out control to clear the browser session.

Provision local users intentionally (never through public signup): set a local server-only service-role key, then run `pnpm user:provision editor@example.test a-long-local-password editor` (or `admin`). The script creates the auth user and upserts the role without printing credentials. Remove or change roles through Supabase Studio or a service-role SQL session; there is no public role-assignment route.

The Update Center has a pending queue, search/status/risk filters, individual proposal details with normalized observation and immutable audit history, recent run summaries, stale records, and transactional approve/reject actions. Manual evidence and compatibility writes are backed by database functions: evidence requires URL/title/publisher/source type, and verified compatibility requires evidence; public clients cannot call privileged APIs without an editor session.

`supabase/functions/ecosystem-update/` is a deliberately undeployed, service-to-service Edge dispatcher. It checks `ECOSYSTEM_UPDATE_SHARED_SECRET` and forwards only to a separately authenticated server-only runner. `supabase/cron/ecosystem-update.sql` is a disabled hosted template showing `pg_cron` + `pg_net` + Vault. Do not apply it locally. A unique active-run index prevents overlapping runs per source; unchanged observations retain the existing deduplication guarantee. Local collection remains `pnpm update:run`.

To add an adapter: add a Zod-validated normalizer in `src/lib/updater/`, add its source configuration and explicit external refs, include sanitized fixture tests, classify fields through `policy.ts`, and keep all curated mutations inside the proposal/review path.

## Database design and migrations

The initial migration includes:

- extensible component categories via `component_types`
- hierarchical `components` and `component_aliases`
- model-only `model_metadata` with inheritance
- typed `ports`
- first-class `compatibility_edges`
- `sources` plus component, model-field, and edge evidence joins
- versioned JSON `builds` scoped to owners
- editor/admin profiles
- `update_sources`, `update_runs`, and reviewable `proposed_changes`
- indexes for component hierarchy, tags, full-text search, ports, and graph traversal
- RLS on every exposed table

Public clients can read published ecosystem records and source evidence. Users can manage only their own builds. Editor and admin writes are authorized through `profiles.role` and the `is_editor()` security-definer helper. Privileged updater and editor operations must stay on the server.

Create a new timestamped SQL file in `supabase/migrations/` for every schema change. Do not edit a migration that has already been applied in a shared environment.

## Tests

```bash
pnpm verify
```

The full command resets and seeds the local database, runs pgTAP RLS tests, checks generated-type drift, runs lint/type checking/unit tests, exercises the live Supabase-backed UI with Playwright, and creates a production build. Individual commands remain available through `pnpm check`, `pnpm db:test`, `pnpm test:e2e`, and `pnpm build`.

Unit coverage includes database mapping, valid and invalid connections, wrong protocols, deprecated and unverified edges, compatible-target highlighting, constrained pathfinding, path ranking, build validation, and safe serialization. pgTAP verifies anonymous read access and viewer/editor/admin write boundaries against real PostgreSQL. Playwright covers the live-data Hermes taxonomy, example build, cable evidence, local save, data-source status, and unauthorized admin boundary.

## V1 release and deployment

The primary public routes are `/explore`, `/build`, `/recommend`, and `/about`. Setup is reached from a saved, shared, or recommended build; `/admin` is protected and intentionally omitted from public navigation.

For a hosted release, configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`. Keep `SUPABASE_SERVICE_ROLE_KEY`, updater tokens, and `ECOSYSTEM_UPDATE_SHARED_SECRET` server-only. Apply the append-only migrations to the target Supabase project; seed data is appropriate for a new V1 environment, not a routine production reset. Configure Supabase Auth redirect URLs for the deployed site before enabling editor accounts. The updater Edge dispatcher and cron template remain intentionally undeployed; scheduling is a post-launch operational decision.

Run `pnpm catalog:audit`, `pnpm setup:audit`, and `pnpm update:smoke` before release. `pnpm verify` is the canonical check. In this environment its long parent process may be externally terminated; when that happens, run every listed stage with `node scripts/verify.mjs --only <stage>` and require each to pass.

## Manual V1 smoke checklist

- Open `/`, then Explore; expand a branch, search for a hidden record, and inspect its sources.
- Open a component page, Build a valid connection, and confirm invalid connections explain the issue.
- Get a recommendation, open it in Patchbay, then open Setup and check a source-backed step.
- Check login/admin protection, light and dark themes, a narrow viewport, and an invalid shared-build URL.

## Curated catalog and evidence status

The deterministic catalog seed is split so the original V1 fixture remains readable and `supabase/seed_catalog.sql` holds the Milestone 5 curated expansion. It currently represents 129 canonical components across creators, model families and selected variants, runtimes, gateways/providers, agents, frameworks/SDKs, protocols, and neutral tools. It intentionally does not ingest a full provider or model-hub catalog.

Run `pnpm catalog:audit` against local Supabase to report type counts, compatibility trust distribution, source and external-reference coverage, missing component evidence, official-link coverage, local-brand coverage, hierarchy depth, and fully connected compatibility records. All published branded/catalog records with an official resource receive a first-party `component_sources` link. Generic neutral tools intentionally have no fabricated branding or official-product claim.

Brand presentation is centralized in `src/data/brand-assets.ts`. Vetted, unmodified official assets live under `public/brand-assets/` with source metadata; all other records use a documented neutral monogram fallback. The app does not hotlink arbitrary logos.

All `verified_official` and `verified_first_party` database edges include official documentation or official repository sources. Generic MCP tool records are explicitly marked `unverified`; they demonstrate typed tool boundaries without asserting that a particular server implementation was validated. They must not be promoted until a specific official or otherwise acceptable source is reviewed. The app never treats matching protocol labels alone as proof of compatibility.

Dates indicate when a source was retrieved or a claim was last verified. A stale date means “not recently rechecked,” not “false.”

## Adding ecosystem data

### 1. Add a component

Insert a `components` row with a stable slug, category, description, status, visibility, official URLs, capability flags, and `last_verified_at`. Use `parent_component_id` for taxonomy and `organization_id` for ownership. Put model-only facts in `model_metadata`. Add aliases separately.

### 2. Add a port

Insert a `ports` row belonging to the component. Choose an explicit direction, protocol, transport, and data type. Port slugs are unique within a component. Describe what the port actually consumes or emits; do not use a generic port when a format or protocol is known.

### 3. Add a compatibility edge

Connect an output/bidirectional source port to an input/bidirectional target port. Record status, level, confidence, configuration, limitations, versions, platform constraints, and verification date. API shape compatibility is not the same as full behavior compatibility; record limitations where appropriate.

### 4. Attach a source

Add a canonical URL to `sources`, then link it through `compatibility_edge_sources`, `component_sources`, or `model_metadata_sources`. Prefer official product documentation, official repositories, official model cards, and first-party announcements in that order. Search snippets are not evidence.

### 5. Add a logo

Prefer an official brand asset or official repository asset and store it locally or in controlled storage. Record `logo_source_url` and licensing notes. Do not hotlink arbitrary images. If licensing is unclear, use the neutral monogram fallback already supported by the UI.

## Update architecture

Updater adapters should follow `fetch → normalize → detect → validate → propose → review → apply`. Objective low-risk changes may be auto-approved later; compatibility claims and interpretive changes require review. External responses must be validated before they reach proposal storage. Scrapers should never silently rewrite curated compatibility data.

Recommended first adapters are official GitHub releases, Hugging Face model cards, vendor model-list APIs, and documentation availability checks. Respect service terms and rate limits.

## Deployment

1. Create a Supabase project and apply migrations through the Supabase CLI.
2. Load only reviewed seed data.
3. Configure the public URL/publishable key and server-only service-role key in the deployment platform.
4. Run `pnpm check` and `pnpm build`.
5. Deploy the Next.js app to a platform that supports the App Router runtime.
6. Verify RLS with anon, normal user, editor, and admin sessions before enabling editor workflows.

Do not deploy with a service-role key in any `NEXT_PUBLIC_` variable.

## Contribution rules

- Keep ecosystem data out of JSX.
- Do not conflate organizations, models, agents, protocols, and tools.
- Never merge the Hermes model family and Hermes Agent.
- Require provenance for important facts.
- Visually and semantically distinguish inferred, unverified, and deprecated edges.
- Keep saved-build schema versions backward compatible when practical.
- Run domain tests after changing port or edge semantics.
