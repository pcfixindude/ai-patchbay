# AI Patchbay agent guide

- Preserve the typed-port architecture. Connections are always port-to-port, never merely component-to-component.
- Keep ecosystem records in structured data or the database; never hard-code the ecosystem into UI components.
- Treat Supabase as the runtime authority. Route reads through `src/lib/data/ecosystem-repository.ts`; fixture fallback must be explicit and must never activate silently in production.
- Regenerate `src/lib/database.types.ts` after schema changes and keep database tests aligned with RLS policy changes.
- Updater adapters are side-effect-light: normalize external facts into observations only. Never bypass proposal review for high-risk compatibility, trust, recommendation, hardware, or performance claims.
- Preserve source authority and explicit external references; never infer compatibility from catalog presence or match external records by display name.
- Deduplicate observations/proposals with stable fingerprints and test external response normalization from sanitized fixtures.
- Never fabricate compatibility claims. Important claims require source metadata and an explicit trust status.
- Keep factual compatibility separate from editorial recommendations.
- Keep SQL migrations reproducible and append-only once shared.
- Preserve RLS and admin authorization boundaries. Never expose a service-role key in browser code.
- Validate all external, admin, updater, and saved-build inputs with Zod.
- Maintain backward compatibility for saved-build schemas where practical; version serialized formats.
- Avoid unnecessary dependencies and large client-state libraries.
- Run lint, type checking, unit tests, and the production build before handoff.
- Update README and architecture notes after meaningful domain, persistence, or security changes.
- Never bypass server-side authorization or grant an editor role merely because a user signed up.
- Scheduled updater execution must remain idempotent; review-required claims remain review-required in every runtime.
- New external mappings require an exact upstream ID and a checked source; updater credentials remain server-only.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
