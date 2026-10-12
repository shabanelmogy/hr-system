# Web/API Readiness Review

Status: foundation gate reviewed 2026-09-13. This review covers `web-next` against
the current ASP.NET Core API before business module delivery.

## Contract baseline

The generated API description was captured from the running API after the
foundation migrations: v1 exposes 297 paths and 345 operations; v2 currently
exposes 2 paths and 2 operations (Categories). The web route registry covers
the targeted, currently consumed API routes behind the same-origin `/api`
boundary and uses the API's canonical file and role routes; it is not a
one-to-one mirror of every Swagger path. The BFF maps the health and
account-information aliases explicitly and keeps backend origin selection
server-authoritative. An exhaustive generated contract diff remains a future
release-gate feature.

## Fixed priorities

- P0 SSRF: backend overrides are disabled by default, canonical-origin only,
  and allowlisted on both the browser and server. `BACKEND_URL` cannot contain
  credentials, a path, query, or fragment.
- P0 proxy transport: user supplied `x-forwarded-for` is not forwarded;
  replayable bodies are bounded at 10 MiB by default; JSON and `+json`
  responses preserve safe metadata and generated failures use RFC 9457-shaped
  Problem Details.
- P1 parity: role detail uses `/api/v1/Roles/Get/{id}`; file routes use the
  API's stored-filename path segments and are URL encoded; client upload
  validation mirrors the server extension/MIME pairs and 50 MiB/10-file limits.
- P1 ownership: feature services own HTTP calls; TSX presentation code is
  guarded by the architecture check. The strict TypeScript project includes
  every source `.ts` and `.tsx` file.
- P1 localization: `check:i18n` performs a full TypeScript AST scan of every
  non-test TS/TSX/JS/JSX source file for static translation keys and every
  non-test TSX/JSX file for visible literals. The current source is clean; all
  user-facing text and supported literal attributes use keys present in both
  English and Arabic catalogs, and ineffective `t(...) || fallback` expressions
  are rejected.

## Platform decisions

Tenant/company context remains owned by `SessionContext` and the API client
generation gate. `MainShell` remounts the query client on identity changes, so
previous-company data cannot be published into the new context. Server session,
permissions, and module entitlements remain authoritative.

Contacts has no web surface by design in the current product contract and is
classified as `Excluded`. Contacts/Party Management remains a business bounded
context separate from Tenant Management: the API owns party revisions and
integration contracts, while a web workflow will be added only when its product
journeys are approved. No unused route, permission, or placeholder UI is exposed.

The existing HR home and analytics widgets still render development data from
feature-local datasets. Replacing those datasets with business queries and
authoritative calculations belongs to the HR dashboard business scope; those
figures are not evidence of API contract parity and must not ship as operational
reporting.

## Readiness matrix

| Area | Automated status | Release evidence / manual journey |
| --- | --- | --- |
| Authentication and cookies | Green: BFF refresh, secure origin cookies, CSRF site checks, and logout contracts are covered by tests. | Verify login, refresh after expiry, logout, and an HTTPS browser session. |
| RBAC and module entitlements | Green: route permissions and entitlement-aware navigation remain server-authoritative; API contract tests pass. | Exercise an allowed and denied role for each enabled module. |
| Tenant/company isolation and cache | Green: request context headers, company-switch generation, and query-client remount prevent cross-context cache reuse. | Switch tenant and company, then verify list, detail, and dashboard data all change. |
| API versioning and contracts | Green for the targeted consumed route set: corrected role/file routes and versioned BFF handling are covered; the registry is not a one-to-one copy of Swagger (v1 297 paths/345 operations; v2 2 paths/2 operations). | Smoke a versioned route and confirm the generated API description used for the deployment. An exhaustive generated contract diff is a future release gate. |
| ProblemDetails and error mapping | Green: RFC 9457 proxy responses, top-level error codes, field errors, trace IDs, and `application/*+json` parsing are tested. | Confirm one validation error, one 401/403, and one unavailable dependency render the shared error state. |
| Files and media | Green: canonical routes, encoded stored filenames, upload size/count and extension/MIME policy are tested; unfinished Notes/Bookmarks controls are removed. | Upload an allowed file, reject a mismatched type, download/range stream it, and verify image/video/document viewers. |
| Observability and health | Green: correlation metadata is preserved and health/API endpoint contracts are registered. | Check deployed health/readiness endpoints and confirm correlation IDs reach logs/traces. |
| Performance, caching, and background work | Green with enforced baseline budgets: bounded proxy bodies, streaming paths, React Query ownership, no-store context-sensitive responses, and CI limits of 26 MiB total JavaScript, 12 MiB per chunk, and 4.5 MiB uncompressed first-load JavaScript per route. | Review representative slow-network behavior and background refresh under production telemetry; lower the baseline budgets as business screens are optimized. |
| Tests, CI, and deployment | Green: strict TypeScript, architecture, i18n, unit/integration tests, build, audit, module generator, bundle measurement, and documentation checks are wired. | Run the authenticated release checklist against the deployed origin. |
| Future module ownership | Green foundation: ownership conventions and service-boundary scaffolding are ready; Accounting, POS, CRM, Inventory, and other business web surfaces remain module-scoped work. | Approve each new module's contract, entitlement, schema/migration, and optional web/mobile surfaces before implementation. |

With the automated checks green, there is no known foundational web/API blocker
before business logic work begins. The manual rows above are release evidence,
not deferred foundation defects.

## Verification

Required automated checks are `npm run check`, `npm test`, `npm run build` with
an origin-only `BACKEND_URL`, `npm run test:module-generator`,
`npm run measure:build`, `npm audit --omit=dev --audit-level=high`, and the
documentation generator check. The release checklist also requires a real
authenticated browser run covering login, company switch, role detail, upload,
download/range streaming, logout, and a 409 concurrency response.
