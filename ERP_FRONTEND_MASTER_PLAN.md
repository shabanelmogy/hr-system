# ERP Frontend Foundation — Master Hardening Plan

**Project:** `/erpsystem/web-next`
**Goal:** Build a strong, scalable ERP frontend foundation in Next.js — not just isolated fixes.

---

## 1. Architecture Goal

The frontend foundation should follow these rules:

- `src/app` stays a **thin App Router layer** for routing, layouts, metadata, loading/error boundaries, and composition only.
- Business ownership lives under `src/modules`.
- Platform capabilities live under `src/platform`.
- Application shell/navigation/dashboard composition lives under `src/shell`.
- Shared generic UI and utilities live under `src/shared`.
- Public URLs must remain stable.
- Route Groups may reorganize code ownership without changing URLs.
- Route ownership should be explicit and enforceable.
- Cross-module access must go through public APIs.
- Business logic should not leak into App Router files.
- The architecture should support long-term ERP growth: more modules, more companies/tenants, permissions, reporting, and real-time features.
- Demo Login remains available in both development and Production for the current
  product policy. Its removal is not a Production-readiness requirement unless a
  future explicit product decision changes that policy.

---

# Phase 0 — Green Baseline & Architecture Foundation ✅

## Objective

Before deeper hardening, establish a clean baseline so later changes are measurable and safe.

## Scope

### App Router organization

```text
src/app/
├── (auth)/
├── (main)/
│   ├── (shell)/
│   ├── (platform)/
│   ├── (modules)/
│   │   ├── (hr)/
│   │   ├── (accounting)/
│   │   ├── (crm)/
│   │   ├── (reference-data)/
│   │   └── (reporting)/
│   └── ...
├── api/
├── .well-known/
└── hangfire/
```

### Ownership rules

- HR business routes → HR module.
- Accounting routes → Accounting.
- CRM routes → CRM.
- Geographic/reference data → Reference Data.
- Crystal Reports → Reporting.
- Authentication/system capabilities → Platform.
- Home/dashboard/module launch → Shell.

### Typed routes

Centralize routes in `src/config/routes.ts`.

```text
appRoutes.auth.*
appRoutes.shell.*
appRoutes.platform.*
appRoutes.modules.*
```

Avoid scattered route literals.

### Architecture enforcement

Strengthen `scripts/check-architecture.mjs` to verify:

- route ownership;
- duplicate URLs after stripping Route Groups;
- one owner per route;
- thin App Router adapters;
- no inappropriate `"use client"` route pages;
- no deep imports into another module/platform area;
- public APIs for cross-owner access;
- dependency direction;
- circular dependency detection;
- compatibility-shim protection.

### Dependency/type baseline

Target/current baseline:

- Next.js `16.3.5`
- React `19.3.0`
- ReactDOM `19.3.0`
- TypeScript `5.9.3`

Fix dependency-upgrade regressions centrally, not with unsafe casts.

Examples already addressed:

- React Hook Form `Promise<unknown>` submit contract.
- MUI X DataGrid callback typing changes.

## Exit gates

```bash
npm run type-check
npm run lint
npm run check:architecture
npm test
npm audit
```

## Status

✅ **Completed / green baseline closed**

Closure evidence on 2026-09-17:

- Route Group ownership, thin App Router adapters, public APIs, dependency
  direction, cycle detection, compatibility shims, navigation/runtime safety and
  route collisions are enforced by `check:architecture` and the gate passes.
- The post-runtime boundary cleanup removed the remaining direct App/Shell imports
  into Platform internals. Auth route adapters, `MainShell`, module registration,
  route authorization, dashboard composition, module translations and token
  revocation now cross narrow feature-scoped `index.ts` public surfaces instead
  of broad Platform barrels. This keeps the architecture gate green without
  re-expanding protected-route bundle graphs.
- normal and strict TypeScript checks pass;
- i18n static/parity checks pass;
- the documentation source/manifests are synchronized and the generated
  documentation check passes for all `77` recipes;
- `npm audit --audit-level=high` reports `0 vulnerabilities`.

The foundation baseline is therefore no longer a cleanup workstream. Future
architecture changes must preserve these gates rather than reopening Phase 0.

---

# Phase 1 — Business Safety 🔴

## Objective

Prevent frontend infrastructure from accidentally duplicating ERP business operations.

ERP write operations are not automatically safe to replay.

Examples:

- creating employees;
- posting invoices;
- approving requests;
- creating fiscal periods;
- inventory movements;
- payments;
- workflow transitions.

A backend may successfully commit while the browser loses the response. Automatic mutation retry can then create duplicates.

## Changes

### Disable global mutation retries

`src/shared/config/queryClient.ts`

```ts
mutations: {
  retry: 0
}
```

Queries may retain safe read retry behavior.

### Regression test

Verify:

- mutation retry default is `0`;
- failed mutations execute their mutation function only once.

## Future rule

Retries for writes are allowed only when an endpoint explicitly supports idempotency.

Potential future mechanism:

```text
Idempotency-Key
```

or another backend-supported idempotency contract.

## Status

✅ **Completed**

---

# Phase 2 — Authentication & BFF Hardening 🔴

## Objective

Make the Next.js BFF a trustworthy security boundary between browser traffic and the backend.

## 2.1 Shared proxy security policy

Create:

```text
src/lib/api/proxy-security.ts
```

Responsibilities:

- reject unsafe backend path segments;
- reject traversal/delimiter abuse;
- protect state-changing endpoints from cross-site requests;
- define which forwarding headers may be trusted.

## 2.2 Generic BFF hardening

File:

```text
src/app/api/[...path]/route.ts
```

Requirements:

- validate backend path;
- reject cross-site mutations;
- do not trust browser-provided network identity;
- preserve refresh-token behavior safely;
- use request-context-aware backend routing.

## 2.3 SignalR BFF hardening

File:

```text
src/app/api/hubs/[...path]/route.ts
```

Do **not** trust caller-controlled headers such as:

```text
x-forwarded-for
forwarded
x-forwarded-host
x-forwarded-proto
x-real-ip
cf-connecting-ip
```

Apply:

- safe path validation;
- same-origin mutation protection;
- controlled forwarding headers only.

## 2.4 Hangfire BFF hardening

File:

```text
src/app/hangfire/[[...path]]/route.ts
```

Requirements:

- safe path handling;
- remove untrusted forwarding headers;
- prevent an old/stale 401 response from deleting cookies created by a newer company/session switch.

## 2.5 Logout hardening

File:

```text
src/app/api/auth/logout/route.ts
```

Requirements:

- resolve backend origin from the current request;
- support backend override correctly;
- use a short upstream logout timeout;
- clear local cookies even when upstream logout is temporarily unavailable;
- reject cross-site logout.

## 2.6 Session/company transition safety

Maintain strong isolation between:

```text
user
tenant
company
query cache
in-flight requests
```

When company/session context changes:

- abort stale requests;
- invalidate request context;
- cancel React Query work;
- clear old query cache;
- avoid replaying old-screen writes with new company cookies.

## 2.7 Demo Login

**Keep Demo Login enabled in development and Production for the current product policy.**

- User Demo Login stays.
- Admin Demo Login stays.
- Super Admin Demo Login stays.
- Current login behavior stays.
- Do not make Production readiness depend on removing Demo Login. Revisit only
  after an explicit product decision changes this requirement.

## Previous verification

```text
58/58 focused security tests
138 test files
471 tests
```

## Status

✅ **Completed**

---

# Phase 3 — Next.js Runtime Architecture 🟠

## Objective

Use Next.js 16 runtime architecture correctly rather than treating the entire ERP as request-dynamic.

Target:

```text
Static shell
+
Partial Prerendering
+
small request-dependent runtime islands
```

## 3.1 Cache Components

`next.config.ts`

```ts
cacheComponents: true
reactStrictMode: true
typedRoutes: true
poweredByHeader: false
```

Do **not** disable Cache Components just to hide runtime issues.

## 3.2 Static Root Layout

Remove direct request APIs such as:

```ts
await cookies()
```

from `src/app/layout.tsx`.

Target:

```text
RootLayout
  └── static shell
      └── Suspense
          └── RuntimePreferencesBoundary
```

## 3.3 Runtime preferences boundary

Files:

```text
src/app/runtime-preferences.ts
src/app/RuntimePreferencesBoundary.tsx
```

Responsibilities:

- theme;
- language;
- direction;
- cookie normalization.

## 3.4 Partial Prerendering

Expected production classification:

```text
○ Static
◐ Partial Prerender
ƒ Dynamic
```

Desired result:

- most ERP screens: `◐ Partial Prerender`;
- BFF/API routes: `ƒ Dynamic`;
- `.well-known`: `○ Static`.

## 3.5 Remove incompatible route flags

Avoid broad:

```ts
export const dynamic = "force-dynamic";
```

Already removed where unnecessary from:

```text
/api/[...path]
/api/hubs/[...path]
/hangfire/[[...path]]
/.well-known/apple-app-site-association
/.well-known/assetlinks.json
```

## 3.6 Client-only dynamic components

Components using:

```ts
dynamic(..., { ssr: false })
```

must not interfere with Instant Navigation validation.

Already isolated behind Suspense where needed:

```text
NotificationRealtimeBridge
RealtimeEntityBridge
ReactQueryDevtools
```

## 3.7 Instant Navigation compatibility

The shared `(main)` shell must not prevent the target App Router segment from reaching Next.js Instant Navigation validation boundaries.

Current resolved direction:

- the target route subtree must remain renderable during initial session bootstrap;
- business/dashboard content remains protected until session state is known;
- never disable Instant Navigation globally;
- never turn off Cache Components to hide the issue.

Dashboard behavior:

- show `RouteLoading` during session bootstrap;
- do not start accessible-module/dashboard queries before the session state is known.

Development diagnostic rule established 2026-09-17:

- a long-running Turbopack process can retain stale Instant Navigation validation
  state across structural shell/instrumentation edits;
- when `/` renders normally but the validation path reports `target segment was
  prevented from rendering`, reproduce both modes before changing route behavior;
- if a clean restart makes both normal and validation requests return `200`, treat
  the stale dev/HMR state as the cause rather than adding `instant = false`;
- Next's Navigation Inspector testing cookie is localhost-domain scoped rather
  than port scoped, so clear/close the Inspector when switching between local Next
  projects if its validation state leaks between them.

## 3.8 Security layering

Authorization remains layered:

```text
Browser UI authorization
+
BFF/session protection
+
Backend authorization
```

Client guards improve UX but are not the sole security boundary.

## 3.9 Runtime verification

Verify:

```text
/
apps
module pages
auth flows
company switch
logout
super admin
normal user
navigation between PPR routes
```

Watch for:

```text
Could not validate instant
instant UI
blocking prerender
BailoutToCSR
hydration mismatch
```

## Exit gates

```bash
npm run type-check
npm run lint
npm run check:architecture
npm test
npm run build
```

## Status

✅ **Completed / runtime architecture verified**

Completed:

- Next `16.3.5`;
- React `19.3.0`;
- Cache Components;
- static-root/runtime-preference split;
- PPR production build previously succeeded;
- first realtime Instant UI issue fixed;
- `/` Instant Navigation root cause identified and route/session boundary corrected;
- regression tests added;
- normal and strict TypeScript checks passed;
- architecture and lint gates passed;
- full Vitest suite passed during final runtime closure;
- production build and `measure:build` completed successfully;
- authenticated Admin and Super Admin browser smoke completed without the
  original Instant Navigation validation failure;
- company/session/realtime startup behavior was verified after the protected
  QueryClient and SignalR startup fixes.

Any future SignalR diagnostics or transport tuning belongs to Phase 6 and must
not reopen the completed Cache Components / PPR / Instant Navigation baseline.

---

# Phase 4 — Provider & Client Runtime Optimization ✅

## Objective

Reduce root/provider cost and stop heavy client libraries from becoming global dependencies.

## 4.1 i18n lazy loading

Target:

- avoid eagerly loading every translation namespace;
- load namespaces per feature/module;
- preserve SSR/hydration language correctness;
- avoid render-time global language mutation where possible.

Applied:

- the root i18n instance eagerly loads only the shared `core` namespace;
- EN/AR feature bundles are registered synchronously at route/feature scopes;
- nested `I18nextProvider` scopes preserve existing bare `useTranslation()` consumers;
- feature namespaces fall back to shared `core` keys;
- route-local translation resources no longer make every ERP route pay for the complete catalog.

## 4.2 Date provider scoping

Review the global date adapter/provider.

Target:

- only date-heavy areas load date-picker runtime;
- avoid making every ERP route pay for it.

Applied:

- `LocalizationProvider` is local to `MyDateTimeField`;
- `AdapterDayjs` and MUI X date-picker runtime load only where a date control is a real consumer;
- date controls inside lazy forms inherit the form interaction boundary and do not load at route entry.

## 4.3 Syncfusion isolation

Load Syncfusion only when the first consuming feature is entered.

Target:

```text
feature enters
→ bootstrap/import Syncfusion
```

not:

```text
application starts
→ load Syncfusion globally
```

Applied:

- Syncfusion viewer/bootstrap work is isolated to the first consuming viewer path;
- it is not part of root application startup.

## 4.4 Other heavy client packages

Audit:

- FullCalendar;
- charts;
- XLSX;
- PDF viewers;
- document viewers;
- reporting engines;
- drag/drop;
- maps.

Rules:

- load at first consumer;
- keep client boundaries local;
- avoid pushing heavy packages into the shared shell bundle.

Applied runtime policy:

- route entry contains only first-paint UI;
- local interaction-only `*Form` and `*Dialog` components use dynamic boundaries;
- lazy components are not mounted while closed, because `open={false}` can still request their chunk;
- optional tabs/views, charts, reporting, file upload/viewer surfaces, and similar heavy UI load at first consumer;
- `check:architecture` rejects static local `*Form` / `*Dialog` imports from feature `*Page.tsx` files;
- primary first-paint forms such as authentication pages remain static by design.

Representative applied areas:

- Fiscal Years;
- Workforce Planning;
- Countries / States / Districts / Address Types;
- Recruitment;
- Attendance Devices;
- Organizational Structure;
- Users / Roles / Invitations;
- Crystal Reports;
- File Manager.

Measured after the runtime-boundary pass:

- `/finance/fiscal-years`: about `2.78 MiB` First Load, versus the earlier documented baseline of about `3.76 MiB`;
- largest measured First Load route: about `3.10 MiB`;
- Recruitment: about `2.96 MiB`.

These measurements are point-in-time build evidence, not permanent route budgets.

## Status

✅ **Runtime policy implemented**

Follow-up dependency/package cleanup remains part of the dependency strategy and
performance-engineering phases; it is not required for the Phase 4 runtime-loading
contract to remain enforced.

---

# Phase 5 — Navigation & Mobile Runtime Safety ✅

## Objective

Make navigation reliable for ERP forms and mobile/PWA-style usage.

## 5.1 Unsaved changes

Preserve protection for:

- internal links;
- browser history;
- refresh/close;
- company/module navigation.

Avoid double navigation and stale form writes.

## 5.2 Pull-to-refresh safety

Audit `pulltorefreshjs`.

Requirements:

- no activation while editing;
- no conflict with data-grid scrolling;
- no activation inside dialogs;
- no replaying writes;
- refresh queries intentionally, not blindly.

## 5.3 Navigation transition consistency

Ensure these all respect unsaved changes, request cancellation, query isolation, and Instant Navigation:

```text
Link navigation
router.push
company switch
module switch
logout
authorization redirect
```

## Applied closure

The protected shell now has one explicit navigation-safety contract:

- `UnsavedChangesProvider` intercepts same-origin application links before
  navigation, protects refresh/close through `beforeunload`, and protects
  same-document Back/Forward through the cancelable Navigation API traversal
  guard without rewriting browser history;
- sidebar navigation, global search, notification actions, file viewing,
  profile navigation, module switching, company switching and user-initiated
  logout all call `requestDiscard()` before leaving the current editing context;
- forced authentication/session/security redirects are intentionally exempt from
  dirty-form confirmation because an expired or invalid session must not remain
  on protected content;
- a genuine company switch cancels/invalidates the previous session request
  generation and unmounts the protected QueryClient boundary, preventing stale
  company results from publishing into the new context;
- pull-to-refresh is touch/coarse-pointer only, loaded during browser idle time,
  disabled for dirty/busy forms, pending mutations, focused editors, grids,
  tree-grids and modal/dialog surfaces, and refreshes active read queries only;
  it never retries/replays mutations;
- `check:architecture` rejects protected `router.push`, `router.replace` or
  `router.refresh` call sites that bypass `requestDiscard`, unless the file is an
  explicitly documented forced/system redirect, and keeps `pulltorefreshjs`
  centralized in `MainClientBootstrap`.

Focused closure verification on 2026-09-17 passed `56/56` tests across history
traversal, unsaved-change registry, pull-to-refresh policy, company switching,
company verification, platform navigation and navigation composition, in
addition to the full frontend suite already passing `496/496` tests.

## Status

✅ **Completed / navigation and mobile runtime safety closed**

---

# Phase 6 — Observability & Production Diagnostics 🟡

## Objective

Establish production diagnostics before the ERP grows further.

## 6.1 OpenTelemetry

Use Next instrumentation to trace:

```text
frontend request
BFF request
backend call
duration
status
correlation ID
tenant/company context where safe
```

Never log secrets or tokens.

## 6.2 Error telemetry

Capture:

- global errors;
- route errors;
- BFF failures;
- timeout failures;
- SignalR failures;
- session revalidation failures.

## 6.3 Performance telemetry

Measure:

```text
navigation latency
route rendering
API latency
bundle growth
large client chunks
slow dashboard queries
```

## 6.4 SignalR diagnostics

Current warnings to investigate independently:

```text
Failed to fetch
Failed to complete negotiation
Failed to start the connection
Connection delayed
```

Target:

- clear failure classification;
- bounded reconnect strategy;
- no noisy repeated console errors;
- no impact on page rendering.

## Applied foundation — 2026-09-17

The first Phase 6 slice is now implemented on the server/BFF/realtime path:

- Next.js server instrumentation registers OpenTelemetry as `ErpSystem.Web` when
  `WEB_OTEL_ENABLED=true`, with the `ErpSystem` service namespace. Registration is
  opt-in; when it is enabled in self-hosted production, startup now requires an
  explicit OTLP endpoint and explicit sampler instead of inheriting
  `@vercel/otel`'s localhost/100%-sampling fallbacks. Vercel-managed telemetry is
  allowed to own the exporter. Endpoint, protocol and ratio-sampler values are
  validated before registration, and trace-context propagation is restricted to
  configured ERP backend origins rather than arbitrary third-party fetches.
- The generic API BFF and SignalR BFF now create a trusted server-owned
  `X-Correlation-ID`, forward it to the backend, and return the same identifier to
  the browser. Caller-supplied correlation headers are not trusted as the BFF
  operation identity.
- BFF backend calls create ERP-specific spans with correlation ID, stable route
  pattern, method, response status and transport-failure classification. Raw
  bearer tokens, entity-specific catch-all paths and exception messages are not
  added as custom telemetry attributes.
- Next.js `onRequestError` marks the active span as failed and records only safe
  request/error metadata while retaining the existing sanitized server log.
- SignalR client diagnostics classify failures (`network`, `negotiation`,
  `transport`, `timeout`, `token`, `unauthorized`, `unknown`), suppress repeated
  identical warnings for a bounded window, and never print the raw SignalR error
  string that could contain a URL or token.
- Manual SignalR restart backoff is now `5s -> 15s -> 30s -> 60s` with a 60-second
  ceiling, resetting after a successful connection or an explicit online/session
  transition rather than retrying every five seconds indefinitely.
- The SignalR BFF converts any `access_token` query parameter into an Authorization
  header before the backend fetch and removes it from the URL so access tokens do
  not enter server access logs or telemetry URL attributes.
- Tenant/company trace enrichment is applied only after the existing
  `resolveSession()` path has returned validated `SessionClaims`. The session and
  realtime-token routes may therefore add stable tenant/company identifiers to
  their active server span without a second lookup. Generic catch-all BFF routes
  deliberately do not decode bearer-token payloads, trust browser scope headers,
  or add an extra session-validation round trip just to enrich telemetry.
- The production dashboard/alert contract is documented in the canonical frontend
  architecture reference. Provider choice, retention, numeric SLO thresholds and
  alert destinations remain deployment inputs and must be proven in the target
  environment rather than hard-coded into the application.
- Client-side observability now exports safe global/route errors, Web Vitals,
  navigation commit timing, session-revalidation failures and throttled SignalR
  diagnostics through a bounded same-origin ingestion contract. The browser sends
  no raw error text, stacks, URLs/query strings, tenant/company IDs, cookies or
  bearer tokens, and the server normalizes the allowlist again before creating an
  `ErpSystem.Web.ClientTelemetry` span.
- Production configuration rejects a client/server telemetry flag mismatch,
  unsupported OTLP settings, an exporter-disable override while telemetry is
  enabled, service-name drift away from `ErpSystem.Web`, and propagator settings
  that would break W3C trace-context continuity.

The source-level Phase 6 contract is closed. Before an external production launch,
the selected hosting environment must still provision the documented operational
dashboards/alerts and run the Collector smoke gate with real routing, retention,
SLO thresholds and alert destinations. Those are deployment release gates rather
than frontend source changes.

## Status

✅ **Complete — source observability and production-diagnostics contract closed**

---

# Phase 7 — Browser Security Hardening ✅

## Objective

Move from basic security headers to a production-grade browser security posture.

Existing headers include:

```text
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
X-Frame-Options
Strict-Transport-Security
```

## 7.1 CSP Report-Only

Start with:

```text
Content-Security-Policy-Report-Only
```

Inventory sources required by:

- Next.js;
- MUI/Emotion;
- Google auth;
- SignalR;
- reports;
- workers;
- blobs;
- images/fonts.

## 7.2 CSP enforcement

```text
report-only
→ fix violations
→ enforce CSP
```

## 7.3 Production Demo Login policy

For the current product policy, Demo Login remains intentionally available in
Production:

- User Demo Login stays;
- Admin Demo Login stays;
- Super Admin Demo Login stays;
- release readiness must not fail merely because Demo Login is present.

If this requirement changes later, treat removal as a separate explicit product
decision and security hardening task rather than an assumed release step.

## Applied and enforced — 2026-09-17

Phase 7 is now implemented without weakening the completed PPR/Cache Components
runtime architecture:

- `src/config/browserSecurity.ts` owns one CSP source inventory and
  `next.config.ts` emits it as enforced `Content-Security-Policy`;
- the policy contains no broad host wildcards and accounts explicitly for Google
  Identity Services, the current Syncfusion PDF resource CDN, configured report
  and SignalR origins, same-origin application traffic, and the required
  `blob:`/`data:` report/media paths;
- local `@fontsource` assets mean external Google Fonts origins are not admitted;
- the policy preserves the current PPR architecture instead of introducing
  request nonces: Next `16.3.5` documents nonce CSP as dynamically rendered and
  incompatible with PPR;
- Google popup auth is paired with
  `Cross-Origin-Opener-Policy: same-origin-allow-popups` rather than weakening the
  existing referrer or framing policy;
- `/api/security/csp-report` accepts bounded legacy/Reporting-API violation
  payloads and strips document/source/referrer/full-URL/query data before logging
  the normalized directive/source classification;
- modern `Reporting-Endpoints`/`report-to` is enabled only when the deployment
  supplies a secure absolute `WEB_PUBLIC_ORIGIN`; same-origin `report-uri` remains
  the compatibility fallback;
- the enforced policy intentionally retains the inline script/style allowances
  required by the current Next/MUI/Emotion runtime model while
  `script-src-attr 'none'` continues to reject inline event-handler attributes;
- a real Chrome HTTPS smoke loaded the login surface, Next development runtime,
  MUI/Emotion styling and the Google GIS client under enforcement with no observed
  CSP blocks; the sanitized collector also accepted an enforced violation and
  retained only the external origin/classification;
- the production `next start` path returns `Content-Security-Policy` with no stale
  Report-Only header, no production `'unsafe-eval'`, no development-wide `ws:` /
  `wss:` allowances, and with `upgrade-insecure-requests` enabled;
- focused browser-security coverage passes `12/12`; the full frontend suite passes
  `155/155` files and `542/542` tests; normal/strict TypeScript, architecture,
  i18n, lint, module-generator and dependency-audit gates are green;
- the production build succeeds for `68/68` pages, keeps application routes in
  Partial Prerender (`◐`) while the CSP collector remains dynamic (`ƒ`), and the
  bundle measurement stays inside all configured budgets.

The source/browser-security contract is therefore closed. Authenticated smoke of
real deployment-only SignalR/report/PDF/file/Hangfire data remains a production
release check because it requires the target environment, a valid account/session
and representative data. That release smoke may identify a new legitimate origin,
but it does not keep the source phase in Report-Only. Any such finding must update
the centralized allowlist and tests rather than adding a wildcard. Demo Login
remains intentionally enabled in Production under the current product policy.

## Status

✅ **Complete — enforced CSP active, PPR preserved; authenticated deployment smoke remains a release gate**

---

# Phase 8 — Testing Strategy ✅

## Objective

Move from mainly unit/regression coverage to a complete ERP confidence model.

## 8.1 Unit tests

Continue testing:

- parsers;
- route policies;
- validation;
- security helpers;
- pure UI logic.

## 8.2 Integration tests

Cover:

```text
SessionProvider
company switch
query cache isolation
BFF refresh
authorization
forms
mutation failures
runtime preferences
```

## 8.3 Playwright E2E

Critical flows:

### Authentication

```text
login
demo login
logout
session expiration
```

### Company context

```text
login
select/switch company
old queries canceled
new context loaded
```

### Authorization

```text
allowed route
denied route
super-admin boundaries
```

### Business smoke

```text
open module
open list
filter/search
open form
create/update safe flow
validation failure
API failure
```

### Runtime

```text
client navigation
back/forward
hard refresh
PPR route
Instant Navigation
```

## 8.4 Coverage thresholds

Introduce thresholds gradually, prioritizing:

```text
auth
security
routing
query safety
business-critical shared infrastructure
```

## Applied closure — 2026-09-18

Phase 8 is now closed at source/CI level with a deterministic Playwright suite
that exercises the real Next.js browser/BFF path without production credentials
or a persistent customer database.

- Playwright owns `21` browser tests across authentication, authorization,
  company/tenant transitions, representative business smoke, runtime navigation,
  RTL and mobile Chromium coverage.
- Authentication coverage includes Demo Login, tenant/company selection, logout,
  successful refresh, terminal expiry and the `503` recovery surface.
- Company switching verifies the revalidated session and proves old-company data
  is dropped before new-company data is exposed.
- Authorization coverage includes authenticated `403` and super-admin-only
  Countries access.
- Countries covers search, validation, create/update, recoverable API failure and
  unsaved browser-history traversal. Fiscal Years covers create/update through the
  shared tenant-scoped form pattern. Appointments and HR organizational structure
  provide browser-level ownership-boundary smoke.
- Runtime coverage includes Back/Forward, hard refresh, App Router `404`, live RTL
  switching and a same-document assertion for PPR/Instant Navigation.
- Mobile Chromium covers both login controls and the authenticated launcher/company
  context.
- `vitest.config.ts` excludes `e2e/**`, keeping the `155` Vitest files / `544`
  source tests separate from Playwright ownership.
- `.github/workflows/web-ci.yml` installs Chromium after the production build,
  runs `npm run test:e2e`, and uploads Playwright failure artifacts.
- Final closure evidence on 2026-09-18: production build generated `68/68` routes
  with application routes still in PPR, full Vitest passed `155/155` files and
  `544/544` tests, and the final CI-mode Playwright run passed `21/21` against
  `next start` with the deterministic upstream fixture.

## Status

✅ **Complete — browser critical journeys and CI E2E gate closed**

---

# Phase 9 — TypeScript & Code Quality ✅

## Objective

Gradually move toward a stricter and safer ERP codebase.

## 9.1 Strict TypeScript baseline

Use one canonical strict gate:

```bash
npm run type-check
```

`tsconfig.json` now has `strict: true` and `noImplicitAny: true`, so the normal
editor, CI and production-build configuration all share the same strict baseline.
The temporary `tsconfig.strict.json` migration gate has been removed rather than
keeping two divergent TypeScript policies.

## 9.2 Remove unsafe escape hatches

Avoid:

```text
any
as unknown as ...
unverified API casts
silent parsing assumptions
```

Prefer:

```text
Zod parsing
typed adapters
shared contracts
narrowing
```

## 9.3 Boundary enforcement

Keep strengthening architecture rules when new violation categories appear.

## Closure — 2026-09-18

Phase 9 is closed with one strict compile-time policy plus explicit runtime
validation at the highest-risk frontend trust boundaries:

- strict TypeScript is the normal `tsconfig.json` baseline for the whole project;
- the duplicate `type-check:strict` script/configuration and CI step were removed;
- ESLint now treats explicit `any` and banned TypeScript comments as errors;
- all existing `as unknown as` chains were removed from source/tests;
- shared character-counter palette tokens are a typed finite contract instead of
  arbitrary strings;
- the browser Navigation API boundary is runtime-narrowed through a typed adapter
  rather than trusted through a chained cast;
- the Job Description approval/rejection resolver now uses one typed Zod schema
  contract instead of overriding React Hook Form's resolver type;
- the Address Types page query now passes a normal typed object to the API client;
- `check:architecture` rejects chained `as unknown as` escape hatches so they do
  not return unnoticed;
- session, realtime-token/JWT, profile, tenant-management and tenant-admin
  successful responses are now received as `unknown` and narrowed or Zod-parsed
  before entering trusted application state;
- management-page response metadata has one shared runtime schema instead of
  repeated trusted generic envelopes;
- the architecture gate now protects the hardened auth/platform boundary files
  from returning to trusted response generics or `response.json()` casts;
- coverage is measured against an explicit critical-infrastructure scope rather
  than all visual source. The reliable baseline is `80.81%` statements,
  `76.35%` branches, `81.54%` functions and `83.18%` lines; CI fails below
  `79% / 74% / 80% / 82%` respectively and publishes the LCOV/JSON report;
- the complete covered Vitest run passes `162/162` files and `565/565` tests.

Low-risk feature DTOs are not required to be rewritten merely to inflate this
phase. New or materially changed untrusted boundaries must continue the
`unknown` + parse/narrow rule under normal architecture governance.

## Status

✅ **Complete — strict baseline, critical runtime parsing and coverage regression gates closed**

---

# Phase 10 — Dependency Upgrade Strategy ✅

## Objective

Keep dependencies modern without destabilizing the ERP.

## Policy

Upgrade major packages one by one:

```text
1. read migration notes
2. update
3. type-check
4. focused tests
5. full tests
6. build
7. runtime smoke
```

Important packages:

- Next.js;
- React;
- MUI;
- MUI X;
- React Hook Form;
- TanStack Query;
- i18next;
- Syncfusion;
- FullCalendar;
- charts;
- document/report viewers.

## Closed baseline

```text
Next.js 16.3.5
React 19.3.0
ReactDOM 19.3.0
TypeScript 5.9.3
```

Phase 10 was executed as controlled dependency-family migrations rather than a
bulk `latest` refresh. The completed runtime/tooling tranches are:

- semver-safe refreshes for MUI X (`9.14.0`), TanStack Query (`5.103.1`),
  `react-hot-toast` (`2.6.1`), ESLint 9 and the Vitest 4 pair;
- SignalR `10.0.11`, verified against the .NET 10 backend and the realtime
  focused suite;
- i18next `26.4.2` + react-i18next `17.0.14`, including the v26
  `initImmediate` -> `initAsync` migration;
- react-simple-maps `5.0.5`, with explicit validated TopoJSON -> GeoJSON
  conversion instead of an unsafe type cast, plus current `topojson-client`;
- FullCalendar React `7.1.0`, migrated to its v7 React subpath exports,
  Temporal polyfill, explicit skeleton/theme CSS, Classic theme plugin and v7
  class hooks. The browser regression found that the removed v6 `.fc` root
  class made the old selector-based styling and smoke assertion obsolete; the
  calendar now uses supported v7 class hooks and a semantic grid smoke;
- lucide-react `1.47.0` for the isolated health/Hangfire icon consumers.

Cleanup performed as part of the same policy:

- removed unused `react-error-boundary`;
- removed obsolete `@types/react-simple-maps` because v5 owns its types;
- removed redundant direct `@eslint/js`, `eslint-plugin-react-hooks` and
  `globals` declarations. ESLint/Next still supply the required transitive
  packages, and lint/type-check remain green.

The final `npm outdated` result is intentionally **not** empty. The following
majors are deferred with explicit reopen conditions rather than upgraded merely
to satisfy an outdated report:

| Family | Decision / reopen trigger |
|---|---|
| Framer Motion 13 | Keep the verified 12.x gesture engine until drag/gesture browser coverage exists for shared trees, org structure and Kanban before taking the major. |
| Syncfusion 34 | Keep the coordinated 31.2.x PDF-viewer family until the viewer's versioned runtime resource URL is coupled to the package version and a real PDF browser smoke exists. |
| docx-preview 0.4 | Keep 0.3.7 until the document-viewer tranche has a real DOCX fixture/smoke; pre-1.0 changes are not promoted without runtime evidence. |
| ESLint 10 | Keep 9.39.5 while the current `eslint-plugin-import`/Next dependency chain still advertises ESLint <=9 compatibility. |
| Vitest / coverage-v8 5 | Keep the matched 4.1.11 pair until a dedicated test-toolchain migration proves identical coverage semantics, reports and thresholds. |
| TypeScript 7 | Keep 5.9.3 while the installed `typescript-eslint` line declares TypeScript `<6.1.0`; do not bypass the peer contract. |
| `@types/node` 26 | Keep Node 20 types while CI runs Node 22 and the application supports Node >=20.9; move the runtime/CI/type policy deliberately rather than model newer Node APIs accidentally. |

## Closure evidence

The final Phase 10 tree passed the complete frontend gate in sequence:

```text
npm audit: 0 vulnerabilities
npm run check: PASS
npm run test:coverage: 162/162 files, 565/565 tests
coverage: 80.81% statements / 76.35% branches / 81.54% functions / 83.18% lines
npm run test:module-generator: PASS
production build: 68/68 pages
Playwright CI-mode E2E: 21/21 passed
documentation recipes: 77/77 passed
git diff --check: PASS
```

The pre-FullCalendar comparison point was approximately `24.37 MiB` total
JavaScript. The closed tree measures `24.39 MiB` (`25,579,513` bytes), still
below the `26 MiB` budget; `/appointments` is `2.33 MiB` first-load against the
`4.5 MiB` route budget. This is a roughly `+0.02 MiB` total change while taking
the calendar major and the final low-risk dependency tranche.

## Status

✅ **Complete — controlled major migrations verified; remaining majors have explicit compatibility/risk reopen triggers**

---

# Phase 11 — Performance & Bundle Engineering 🟢

## Objective

Keep startup/navigation fast as the ERP grows.

Measure:

```text
initial JS
route JS
shared shell JS
largest client chunks
navigation latency
hydration cost
dashboard render cost
query waterfalls
```

Techniques:

- route-local dynamic imports;
- provider scoping;
- feature lazy loading;
- Server/Client boundary optimization;
- PPR;
- justified query prefetch;
- eliminate duplicate requests;
- avoid huge barrel imports;
- move static work to Server Components where appropriate.

## Applied authentication performance findings — 2026-09-17

The login investigation established an important distinction between **route
load performance** and **authentication transition performance**.

Verified findings and decisions:

- `/login` route-level barrel imports pulled unrelated authentication pages into
  the initial graph; route adapters should use direct imports for primary pages.
- tenant/company selection UI is interaction-only and should stay outside the
  initial login path until required by the server;
- login response validation remains required, but its parser/runtime can be
  warmed during browser idle time so the first submit does not pay its full
  compile/download cost;
- protected destinations such as `/` must **not** be prefetched before login is
  committed, because the prefetched tree can represent the unauthenticated
  request context;
- post-login navigation currently favors a fresh document request so Proxy,
  cookies and `SessionProvider` all bootstrap from the newly committed session;
- session validation DB work may be consolidated only when all current security
  predicates remain identical;
- development and production Next.js builds must not write the same `.next`
  directory concurrently; restart `next dev` after local `next build` work when
  necessary.

Performance reviews should measure this sequence independently:

```text
/login first paint
-> POST login
-> parser/validation
-> cookie/session commit
-> protected navigation
-> /api/auth/session
-> dashboard bootstrap queries
```

This prevents a fast login page from hiding a slow authentication or dashboard
bootstrap path.

## Comprehensive page-loading hardening — 2026-09-17

The route-wide production review found that the remaining cost was dominated by
shared protected-shell behavior and request amplification rather than by one
single page. The important findings are now treated as permanent architecture
rules rather than route-by-route tuning.

### Protected bootstrap / duplicate request wave

**Problem:** the initial protected render could start page queries, then repeat
them after `/api/auth/session` resolved.

**Root cause:** `MainShell` keyed the entire context/QueryClient by a session
identity that begins as null. The null-to-authenticated transition destroyed the
first QueryClient and replayed page queries.

**Decision:** preserve one QueryClient during initial session bootstrap. A real
company switch or logout remains an explicit unmount/reset boundary; never gate
all first page queries behind session completion just to avoid duplication.

**Impact:** initial page/session work can stay parallel without sacrificing
cross-company cache isolation.

### Realtime startup amplification

**Problem:** first SignalR connection triggered another refetch wave immediately
after first-page data loaded.

**Root cause:** initial connection was treated as a reconnect.

**Decision:** the first connection performs no reconciliation. A genuine
reconnect invalidates only registered realtime query roots and refreshes role /
company-option stores only when those stores had already been loaded. Realtime
bridges mount only after tenant/company session context exists and not for
`super_admin`.

**Impact:** normal route startup no longer pays for a first-connect global query
invalidation. Notification payload Zod validation remains authoritative but is
loaded on the first realtime notification rather than as shared startup code.

### ERP list request waterfalls

**Problem:** generic adaptive pagination made a `pageSize: 1` probe and then a
second request, sometimes downloading up to 5,000 matching records.

**Decision:** ERP list startup is server-paginated by default: one requested
page, one query. Whole-dataset chart/export/analytics data must use an explicit,
on-demand contract owned by that optional view.

**Impact:** Fiscal Years, Workforce Planning, Countries, States and Districts no
longer inherit the probe/fetch-all pattern. The 5,000-row client threshold was
removed.

### Shared-shell API and bundle graph

**Problem:** shell startup made a redundant user-info request for display
identity, while global realtime registration imported feature hook/service
graphs into unrelated protected routes.

**Decision:** sidebar identity is derived from validated session claims; only the
separate user-photo query remains. Global registration imports lightweight
metadata/query-key leaves only. Realtime registration crosses a narrow public
registry API rather than a broad barrel that also exposes runtime bridge code.

**Impact:** one protected-startup API call is removed and feature query/service
graphs are no longer intentionally rooted by global realtime registration. The
pre-change bundle audit attributed about `338.6 KB` of common emitted JavaScript
to chunks containing those feature registration graphs; production build
measurement after the refactor is the final authority for the actual reduction.

### App / Shell / Platform public-boundary cleanup

**Problem:** after the runtime refactor, `check:architecture` still identified a
small set of direct imports from App Router and Shell composition into Platform
implementation files. Replacing them with a single broad Platform barrel would
have satisfied ownership rules while undoing part of the route-local bundle work.

**Decision:** expose only the symbol needed by each composition point through
narrow feature-scoped public APIs. Examples include auth route entry points,
module registration/query/route-access/translation/launcher surfaces, realtime
runtime bridges, tenant-access runtime composition, session runtime utilities and
context-store reset access.

**Impact:** `check:architecture` is green again, App/Shell no longer deep-import
Platform internals, and route composition does not depend on a broad auth/modules/
realtime barrel that would eagerly reconnect unrelated feature graphs.

### Optional post-hydration runtime

**Problem:** dynamic imports can still be immediate startup cost when mounted on
every route, and the PDF viewer contained fixed 1,000 ms + 500 ms readiness
delays.

**Decision:** pull-to-refresh loads only on touch/coarse-pointer clients and
during idle time. The PDF viewer keeps Syncfusion isolated to the viewer route,
uses the component readiness event, aborts stale document fetches and does not
sleep before loading the file.

### Dashboard API shape

The super-admin dashboard was found to fetch the complete tenant management
catalog and entitlement-rich tenant responses merely to derive aggregate cards,
recent tenants and expiring subscriptions. The durable direction is a dedicated
Super Admin tenant dashboard summary endpoint with aggregate counts and bounded
recent/expiring lists. Dashboard first paint must not scale its transfer payload
linearly with the complete management catalog.

That endpoint is now implemented end-to-end. It is SuperAdmin-only through the
existing controller authorization, uses `TimeProvider`, performs server-side
aggregate/count queries, returns bounded recent/expiring projections, and does
not call the full tenant response builder or load tenant entitlement rows. The
frontend dashboard consumes this summary rather than `tenantApi.getAll()`.

### Protected auth utility route composition

The final production build exposed `/change-password` as a protected page inside
the otherwise public auth shell. Its form requires session/logout state and
unsaved-change registration, but moving those providers into the shared auth
layout would make `/login` and the other public auth routes pay that runtime.

The route now owns a narrow protected wrapper: route-local `SessionProvider`, an
authenticated loading gate, and `UnsavedChangesProvider` around the form. The
public auth shell stays lightweight and the production prerender succeeds.

### Final production measurements

The cross-route loading phase is closed against production artifacts, not dev
compile timing.

```text
Before shared protected intersection: 47 chunks / ~2.89 MB
Final shared protected intersection:  36 chunks / ~1.61 MB

/                              ~2.75 -> 1.61 MiB
/login                         ~1.13 -> 1.13 MiB
/administration/users          ~3.09 -> 1.80 MiB
/profile                       ~3.09 -> 2.09 MiB
/appointments                  ~3.02 -> 2.77 MiB
/recruitment                   ~2.96 -> 1.86 MiB
/finance/fiscal-years          ~2.78 -> 2.32 MiB
largest measured First Load    ~3.09 -> 2.77 MiB
```

The original cross-route closure emitted `263` chunks / `24.22 MiB` versus the
earlier `230` / `23.36 MiB`. After the controlled Phase 10 dependency work, the
refreshed Phase 11 baseline is `270` chunks / `24.39 MiB`; it remains below the
`26 MiB` total-JS budget. The route startup result remains materially better than
the pre-hardening state despite the larger split-chunk inventory, which is why
per-route/shared First Load remains the primary startup metric. ActiveReports and
Syncfusion remain isolated from ordinary first-load routes.

### Formal route-class budget baseline — 2026-09-18

The closing production build records `71` app-path manifest entries and `60`
routes with First Load diagnostics. The protected shared First Load intersection
is `26` chunks / `1.60 MiB` across `52` protected routes.

```text
error fallback          current max 0.84 MiB   budget 1.10 MiB
public auth             current max 1.94 MiB   budget 2.15 MiB
protected shell         current max 2.04 MiB   budget 2.25 MiB
business application    current max 2.28 MiB   budget 2.55 MiB
heavy feature entry     current max 2.33 MiB   budget 2.75 MiB
protected shared JS     current     1.60 MiB   budget 1.85 MiB
```

The absolute backstops remain `26 MiB` aggregate JS, `12 MiB` largest emitted
chunk and `4.5 MiB` for any measured first-load route. `measure:build` now
enforces the class/shared limits as part of the existing CI bundle gate, and
`scripts/performance-budget-policy.test.mjs` protects the route-class policy.
The canonical current measurements live in
`documentation/web-next/architecture/performance-baseline.md`.

Final gates for this closure: architecture, normal + strict TypeScript, full
lint, module-generator self-test, full Vitest, documentation check, production
build, `measure:build`, focused backend tenant-summary tests and runtime smoke.

Authenticated browser smoke is also complete. The built-in Admin path reached
the dashboard and `/finance/fiscal-years` with `ERROR_COUNT 0`; session,
realtime-token and hub requests were same-origin and successful. The smoke found
and closed two final runtime defects: the project-local Emotion streaming cache
was replaced by MUI's Next 16 App Router cache provider, and development SignalR
now uses the same-origin BFF with Long Polling directly instead of failing
WebSocket/SSE transports first. Super-admin login, `/super-admin`, geography and
the dedicated tenant summary endpoint also returned successfully; warmed local
dashboard/summary requests were approximately `0.19 s` / `0.29 s`.

### Verification / regression policy

For any future protected-page loading change:

```text
problem
-> root cause
-> architecture decision
-> implementation impact
-> focused verification
-> production build + measure:build
-> prevention rule in the canonical Guide
```

Do not judge runtime performance from development Turbopack compile timing, and
do not run `next build` concurrently with `next dev` against the same `.next`.
The canonical implementation rules live in
`documentation/web-next/architecture/frontend-architecture-reference.md`.

### Accepted follow-up optimizations after the cross-route pass

These are documented rather than mixed into the shared-runtime closure work:

- active-language-only EN/AR resource loading after preserving the current
  hydration-safe feature namespace model;
- root loader/runtime-preference decoupling only as one coherent theme/language
  bootstrap change, because removing the mask alone can expose a dark/RTL flash
  or hydration mismatch;
- realtime-token session-hop reduction only after an auth/security review;
- keep local HTTPS SignalR on the same-origin hub BFF when a configured loopback
  backend URL would otherwise cause mixed-content/certificate reconnect loops;
  the BFF transport uses Long Polling directly rather than failing WebSocket and
  SSE attempts before fallback;
- route-local FullCalendar / Recruitment drag-drop tuning only if the new
  production route measurements still justify it;
- tenant entitlement-module fetch-on-intent for the management editor, provided
  the form can never initialize against an incomplete catalog.

These are not reasons to keep the old duplicate QueryClient, first-connect
realtime refetch, fetch-all pagination, redundant shell identity request, or
feature-hook registration graph.

## Status

✅ **Cross-route page-loading/runtime baseline closed; future work is evidence-driven feature-local tuning**

---

# Phase 12 — CI Quality Gates ✅

## Objective

Prevent regressions as the ERP grows.

Required CI gates:

```bash
npm run check:architecture
npm run check:i18n
npm run lint
npm run type-check
npm run test:coverage
npm run build
```

Documentation gate when architecture/contracts/manifests change:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
```

The consolidated CI contract now also enforces:

- `npm audit --omit=dev --audit-level=high` for production dependencies;
- baseline-derived critical-infrastructure coverage thresholds and a repeatable
  LCOV/JSON coverage artifact;
- module-generator self-test;
- production build followed by the Phase 11 aggregate, shared-runtime and
  route-class bundle budgets;
- Playwright E2E against the production `next start` server with deterministic
  browser/BFF fixtures and Chromium desktop/mobile projects;
- WCAG A/AA automated accessibility smoke for `/login`, the authenticated shell,
  a representative Countries CRUD page/form and the critical mobile login path;
- a production-path browser-security smoke that asserts the real response keeps
  enforced CSP, does not emit Report-Only or production `unsafe-eval`, and keeps
  the core security headers;
- generated documentation consistency;
- CI retries remain diagnostic, but `failOnFlakyTests` makes a pass-on-retry a
  failed release gate rather than silently accepting flakiness. The resulting
  Countries search regression is synchronized to the matching BFF response so the
  gate validates the server result rather than debounce/placeholder timing.

Web Vitals / real-user timing remains evidence-driven rather than a synthetic CI
wall-clock threshold. Real Collector/dashboard/alert delivery plus authenticated
Google, deployment SignalR, report/PDF/file previews, Hangfire and configured
external-frame journeys remain staging/Production release checks because they
require deployment infrastructure, credentials or representative data.

## Status

✅ **Complete — the deterministic CI pipeline is the frontend Definition of Done; deployment-only integration smokes remain release gates**

---

# Phase 13 — Documentation & Architecture Governance 🟢

## Objective

Keep the architecture understandable without reverse-engineering the repository.

Required documentation includes:

```text
documentation/web-next/architecture/frontend-architecture-reference.md
documentation/web-next/features/server-managed-feature-reference.md
module/route manifests
architecture reference docs
```

Ownership examples that must remain correct:

```text
Fiscal Years → Accounting
Appointments → CRM
Countries / States / Districts → Reference Data
Crystal Reports → Reporting
```

Rule:

```text
code change
+ architecture gate
+ documentation update
+ documentation generation/check
```

### Automated ownership/route manifest

Phase 13 now keeps a generated Web architecture manifest at
`documentation/web-next/architecture/frontend-architecture-manifest.md`. It is
derived from `scripts/module-boundaries.mjs` and the live protected App Router
tree, so engineers can review owner roots, allowed dependency direction and route
ownership without reverse-engineering folders.

The canonical ownership examples in this phase are machine-enforced through
`documentedRouteOwnership`; `check:architecture` rejects a missing or re-owned
contract route, while `check:governance` rejects a stale generated manifest. CI
runs both gates. Intentional ownership/route changes therefore require an explicit
policy change, manifest regeneration and review of the documentation diff.

Registered frontend business modules must also declare an active `webNextSurface`
inside their `documentation/modules/<module>/module.json`. The governance check
validates the documented owner, source root, module definition path and Web README
for HR, Accounting, CRM, ReferenceData and Reporting, then renders that parity into
the generated architecture manifest. This prevents a live module from drifting
back to documentation that still claims its Web surface is absent.

### Continuous guide update rule

Do not wait until the end of a phase to document important findings. After each
material architecture/runtime/security/business-safety observation, update the
owning canonical guide in the same work session with:

```text
Observed problem
-> root cause
-> decision/rule
-> implementation impact
-> verification evidence
-> regression-prevention note
```

The chat is not the project record. If a finding would change how the next
engineer should implement, debug, test, or operate the ERP, it belongs in the
Guide before handoff.

## Status

🟢 **Active ongoing governance**

The Route Group and public-boundary cleanup is complete. Canonical architecture
documentation and generated documentation checks were included in the final
runtime closure gates. This phase now operates as a continuous rule: future
material architecture/runtime changes must keep the guides and generated checks
synchronized in the same workstream.

---

# Execution Order

```text
Phase 0  — Green baseline / architecture
Phase 1  — Business Safety
Phase 2  — Authentication & BFF Hardening
Phase 3  — Next.js Runtime Architecture
Phase 4  — Provider/client runtime optimization
Phase 5  — Navigation/mobile safety
Phase 6  — Observability
Phase 7  — Browser security / CSP
Phase 8  — E2E & testing depth
Phase 9  — TypeScript/code-quality hardening
Phase 10 — Controlled dependency upgrades
Phase 11 — Performance engineering
Phase 12 — CI quality gates
Phase 13 — Documentation/governance
```

Governing rule:

```text
Correctness
→ Security / Protection
→ Runtime Architecture
→ Performance
→ Developer Experience
→ Continuous Governance
```

---

# Current Overall Status

| Phase | Status |
|---|---|
| Phase 0 — Foundation / green baseline | ✅ Complete |
| Phase 1 — Business Safety | ✅ Complete |
| Phase 2 — Authentication & BFF Hardening | ✅ Complete |
| Phase 3 — Next.js Runtime Architecture | ✅ Complete |
| Phase 4 — Provider/runtime optimization | ✅ Runtime policy implemented |
| Phase 5 — Navigation/mobile safety | ✅ Complete |
| Phase 6 — Observability | ✅ Complete — deployment smoke remains a production release gate |
| Phase 7 — CSP/browser security | ✅ Complete — enforced CSP active; authenticated deployment smoke remains a release gate |
| Phase 8 — E2E/testing depth | ✅ Complete — Playwright critical journeys run in CI |
| Phase 9 — TypeScript/code quality | ✅ Complete |
| Phase 10 — Dependency strategy | ✅ Complete |
| Phase 11 — Performance engineering | ✅ Cross-route/runtime baseline complete |
| Phase 12 — CI quality gates | ✅ Complete |
| Phase 13 — Documentation/governance | 🟢 Active / ongoing governance |

---

# Immediate Next Actions

The frontend foundation/runtime cleanup is no longer a blocker for business
feature work. Phase 0, Phase 3, Phase 4, Phase 5, Phase 11 and the documentation
baseline are closed. The latest architecture pass also restored a fully green
`check:architecture` after the performance refactors by using narrow public APIs
instead of broad barrels.

The source hardening roadmap through Phase 12 is closed and can stay green while
ERP business functionality continues. Phase 13 remains the ongoing documentation
and architecture-governance discipline. The Phase 6/7 real Collector/dashboard/
alert and authenticated CSP integration smoke checks belong to the production
release gate rather than generic PR CI.

Dependency majors are no longer an open phase. Reopen only the affected family
when its documented compatibility/runtime-evidence trigger is met, and retain the
Phase 10 one-family-at-a-time verification policy.

At Production-readiness time, also run authenticated browser smoke for the real
Google popup, SignalR connection, reports/PDF viewers, file/media previews,
Hangfire and configured external-tool frames. Demo Login remains intentionally
available in Production under the current product policy and is not a release
blocker. Treat any confirmed CSP violation as an allowlist evidence update, not a
reason to reopen broad browser permissions.

Performance work should now be reopened only from evidence: production route
measurement or a concrete user-visible latency. Deferred items such as
active-language-only translation loading, chart-specific whole-dataset contracts,
realtime-token hop reduction, FullCalendar/Kanban tuning and tenant entitlement
fetch-on-intent are not startup blockers.

---

# Non-Negotiable Constraints

Do not:

- remove or hide Demo Login without a new explicit product decision;
- disable `cacheComponents` to hide a runtime issue;
- disable/suppress Instant Navigation validation;
- reintroduce broad `dynamic = "force-dynamic"`;
- change public URLs during Route Group refactors;
- put business logic inside `src/app`;
- bypass shared architecture with deep imports;
- use unsafe casts as dependency-upgrade fixes;
- re-enable global mutation retry;
- trust browser-provided forwarded/IP headers;
- allow stale Hangfire 401 responses to clear a newer session;
- clean/reset unrelated dirty-tree work;
- treat documentation as correct without rerunning its gate.

---

# Definition of Done

The ERP frontend foundation is production-grade when:

- architecture ownership is enforced;
- business writes are retry-safe;
- BFF/auth/session transitions are hardened;
- Cache Components/PPR/Instant Navigation work cleanly;
- heavy providers/libraries are scoped;
- navigation and unsaved changes are safe;
- observability exists;
- CSP is enforced;
- critical E2E tests exist;
- strict typing is the normal baseline;
- bundle/performance regressions are measured;
- CI blocks architectural, type, test, build, i18n, docs, and security regressions;
- architecture documentation matches the real codebase.
