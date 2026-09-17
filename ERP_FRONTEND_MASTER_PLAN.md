# ERP Frontend Foundation — Master Hardening Plan

**Project:** `/hr-system/web-next`  
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
- Demo Login remains available during development and will be removed later for Production.

---

# Phase 0 — Green Baseline & Architecture Foundation

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
npm run type-check:strict
npm run lint
npm run check:architecture
npm test
npm audit
```

## Status

✅ **Foundation substantially completed**

Remaining cleanup:

- documentation/manifests must be brought fully in sync with Route Group ownership;
- rerun documentation generation/check gate before calling the architecture documentation fully clean.

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

**Keep Demo Login in development.**

- User Demo Login stays.
- Admin Demo Login stays.
- Super Admin Demo Login stays.
- Current login behavior stays.
- Remove later only when preparing Production.

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
npm run type-check:strict
npm run lint
npm run check:architecture
npm test
npm run build
```

## Status

🟠 **Core architecture implemented; final verification still required**

Completed:

- Next `16.3.5`;
- React `19.3.0`;
- Cache Components;
- static-root/runtime-preference split;
- PPR production build previously succeeded;
- first realtime Instant UI issue fixed;
- `/` Instant Navigation root cause identified and route/session boundary corrected;
- regression tests added;
- `type-check` passed;
- architecture check passed;
- latest dev Instant smoke no longer reported the original validation error.

Still required before closing Phase 3:

```text
type-check:strict
lint
full npm test
production build
authenticated navigation smoke
```

SignalR negotiation warnings remain a separate runtime item.

---

# Phase 4 — Provider & Client Runtime Optimization 🟠

## Objective

Reduce root/provider cost and stop heavy client libraries from becoming global dependencies.

## 4.1 i18n lazy loading

Target:

- avoid eagerly loading every translation namespace;
- load namespaces per feature/module;
- preserve SSR/hydration language correctness;
- avoid render-time global language mutation where possible.

## 4.2 Date provider scoping

Review the global date adapter/provider.

Target:

- only date-heavy areas load date-picker runtime;
- avoid making every ERP route pay for it.

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

## Status

⏳ **Planned**

---

# Phase 5 — Navigation & Mobile Runtime Safety 🟠

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

## Status

⏳ **Planned**

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

## Status

⏳ **Planned**

---

# Phase 7 — Browser Security Hardening 🟡

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

## 7.3 Production Demo Login removal

When preparing Production:

- remove Demo Login buttons;
- remove hardcoded demo credentials;
- verify no demo credentials exist in production bundles.

## Status

⏳ **Planned**

---

# Phase 8 — Testing Strategy 🟡

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

## Status

⏳ **Planned**

---

# Phase 9 — TypeScript & Code Quality 🟡

## Objective

Gradually move toward a stricter and safer ERP codebase.

## 9.1 Strict TypeScript baseline

Keep both:

```bash
npm run type-check
npm run type-check:strict
```

until strict mode can become the normal default.

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

## Status

🟠 **Partially established; long-term hardening remains**

---

# Phase 10 — Dependency Upgrade Strategy 🟡

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

## Current baseline

```text
Next.js 16.3.5
React 19.3.0
ReactDOM 19.3.0
TypeScript 5.9.3
```

Earlier audit:

```text
npm audit: 0 vulnerabilities
```

## Status

🟠 **Baseline upgraded; future majors should be controlled batches**

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

## Status

⏳ **Planned / partially benefited from Phase 3**

---

# Phase 12 — CI Quality Gates 🟢

## Objective

Prevent regressions as the ERP grows.

Required CI gates:

```bash
npm run check:architecture
npm run check:i18n
npm run lint
npm run type-check
npm run type-check:strict
npm test
npm run build
```

Documentation gate when architecture/contracts/manifests change:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
```

Future gates:

- Playwright E2E;
- coverage thresholds;
- bundle-size regression limits;
- dependency/security audit;
- generated documentation consistency.

## Status

🟠 **Most individual gates exist; consolidated enforcement still needs completion**

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

## Status

🟠 **Needs final cleanup after Route Group reorganization**

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
| Phase 0 — Foundation / green baseline | ✅ Mostly complete |
| Phase 1 — Business Safety | ✅ Complete |
| Phase 2 — Authentication & BFF Hardening | ✅ Complete |
| Phase 3 — Next.js Runtime Architecture | 🟠 Final verification |
| Phase 4 — Provider/runtime optimization | ⏳ Planned |
| Phase 5 — Navigation/mobile safety | ⏳ Planned |
| Phase 6 — Observability | ⏳ Planned |
| Phase 7 — CSP/browser security | ⏳ Planned |
| Phase 8 — E2E/testing depth | ⏳ Planned |
| Phase 9 — TypeScript/code quality | 🟠 Ongoing |
| Phase 10 — Dependency strategy | 🟠 Baseline done |
| Phase 11 — Performance engineering | ⏳ Planned |
| Phase 12 — CI quality gates | 🟠 Partial |
| Phase 13 — Documentation/governance | 🟠 Cleanup required |

---

# Immediate Next Actions

Before Phase 4, close Phase 3 completely:

```bash
npm run type-check:strict
npm run lint
npm test
npm run build
```

Then:

1. authenticated smoke test for `/`;
2. navigate between multiple PPR routes;
3. verify no Instant Navigation console errors;
4. verify company switch/logout;
5. investigate SignalR negotiation warnings separately;
6. fix stale architecture documentation/manifests;
7. rerun documentation gate.

After that:

```text
i18n lazy loading
→ date provider scoping
→ Syncfusion first-consumer bootstrap
→ heavy client-library bundle audit
```

---

# Non-Negotiable Constraints

Do not:

- remove Demo Login yet;
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
