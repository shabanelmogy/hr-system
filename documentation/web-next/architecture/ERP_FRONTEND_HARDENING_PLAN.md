# ERP Frontend Hardening Plan

Status: Active roadmap for `/hr-system/web-next`.

Last updated: 2026-09-17.

## 1. Goal

Build a strong, scalable ERP frontend foundation on Next.js 16.3.5 and React
19.3.0 before expanding business functionality.

The objective is not to patch isolated issues. The frontend should have clear
ownership boundaries, safe business mutations, hardened authentication and BFF
behavior, predictable Next.js runtime behavior, measurable performance, and
release gates that can be trusted as the application grows.

The current implementation must preserve these product constraints:

- Preserve existing public URLs unless a URL change is explicitly requested.
- Preserve the existing UI/UX; architecture work is not a redesign.
- Keep `src/app` thin and focused on App Router composition and route boundaries.
- Business UI and logic remain owned by `src/modules`, `src/platform`, or
  `src/shell` according to capability ownership.
- Keep `cacheComponents` enabled and fix runtime issues at their real boundary.
- Do not disable Instant Navigation as a shortcut around validation failures.
- Do not reintroduce broad `force-dynamic` declarations.
- Preserve the dirty working tree and do not reset unrelated work.
- Keep Demo Login available during development. It is intentionally deferred for
  removal until Production hardening.

## 2. Current Runtime Baseline

Current primary framework versions:

```text
Next.js     16.3.5
React       19.3.0
ReactDOM    19.3.0
TypeScript  5.9.3
Turbopack
```

Relevant Next.js configuration:

```ts
reactStrictMode: true,
typedRoutes: true,
cacheComponents: true,
poweredByHeader: false,
```

Production build has already demonstrated the intended runtime model:

```text
○  Static
◐  Partial Prerender
ƒ  Dynamic
```

Most UI routes are expected to remain Static or Partial Prerender where their
data dependencies allow it. BFF and other request-bound endpoints remain
Dynamic.

## 3. Status Legend

| Status | Meaning |
| --- | --- |
| ✅ Completed | Implemented and verified at a previous checkpoint. |
| 🟡 In Progress | Main implementation exists, but one or more current issues remain. |
| ⬜ Planned | Agreed roadmap item not yet implemented. |
| ⚠️ Needs Verification | Work may exist, but the current full release gate has not been rerun successfully. |

## 4. Roadmap Summary

| Phase | Focus | Status |
| ---: | --- | --- |
| 0 | Green Baseline / Build Health | ⚠️ Needs Verification |
| 1 | Business Safety | ✅ Completed |
| 2 | Authentication & BFF Hardening | ✅ Completed |
| 3 | Next.js Runtime Architecture | 🟡 In Progress |
| 4 | Bundle & Client Runtime Reduction | ⬜ Planned |
| 5 | React 19 / Client Architecture Correctness | ⬜ Planned |
| 6 | Observability | ⬜ Planned |
| 7 | CSP / Security Headers | ⬜ Planned |
| 8 | E2E Testing | ✅ Completed |
| 9 | Coverage Strategy | ✅ Completed |
| 10 | Dependency Upgrade Policy | ⬜ Planned |
| 11 | Performance Budget / Measurement | ⬜ Planned |
| 12 | CI as Definition of Done | 🟡 In Progress |

---

## Phase 0 — Green Baseline / Build Health ⚠️

### Objective

Keep the repository green before adding more architectural complexity or ERP
features. A failing baseline makes later regressions difficult to identify.

### Required gates

- TypeScript normal type-check.
- TypeScript strict type-check.
- ESLint.
- Architecture checker.
- i18n checker.
- Documentation system check.
- Unit/integration tests.
- Production build.
- Bundle/performance measurement.

### Work already completed

- React Hook Form type regressions caused by dependency refresh were fixed in the
  shared form dialog contract rather than hidden with local casts.
- MUI X DataGrid callback type drift was fixed in the shared grid layer.
- `npm run type-check` is now the single strict TypeScript gate (`strict: true`,
  `noImplicitAny: true`) for editor, CI and production-build source.
- `npm run lint` passed at a previous checkpoint.
- `npm run check:architecture` passed at a previous checkpoint.
- A production build passed after the Phase 3 Cache Components work.

### Remaining verification

- Rerun the complete `npm run check` gate after the current runtime work.
- Rerun the full test suite.
- Rerun the production build after the unresolved `/` Instant Navigation issue is
  corrected.
- Rerun `npm run measure:build` and store a clean post-Phase-3 baseline.
- Reverify i18n. `global-error.tsx` had previously caused hardcoded-visible-text
  failures and the latest full i18n state is not yet proven.
- Reverify documentation generation/checks. Current canonical documentation has
  known stale ownership/path information from the route-group reorganization.

### Exit criteria

All release gates are green on the same current tree, not only at separate older
checkpoints.

---

## Phase 1 — Business Safety ✅

### Objective

Prevent accidental duplicate ERP writes caused by automatic mutation replay.

### Implemented

The shared React Query client now defaults mutations to:

```ts
mutations: {
  retry: 0,
}
```

This protects non-idempotent operations from being silently repeated when the
server commits a write but the response is interrupted or lost.

### Policy

- Queries may keep appropriate read retry behavior.
- Mutations do not retry globally.
- A mutation may opt into retry only when the operation is proven idempotent or
  protected by a server-side idempotency mechanism.

### Verification

`src/shared/config/queryClient.test.ts` verifies that a failing mutation executes
its mutation function exactly once by default.

### Key files

```text
web-next/src/shared/config/queryClient.ts
web-next/src/shared/config/queryClient.test.ts
```

---

## Phase 2 — Authentication & BFF Hardening ✅

### Objective

Make the same-origin BFF boundary trustworthy and preserve session correctness
under tenant/company switching, SignalR, Hangfire, logout, and malformed paths.

### Implemented

- Centralized proxy security policy in `src/lib/api/proxy-security.ts`.
- Unsafe backend path detection.
- Plain and encoded traversal handling.
- Same-origin mutation protection.
- Browser-supplied forwarding headers are no longer trusted as authoritative.
- Generic BFF uses the shared proxy policy.
- SignalR BFF uses the same security model.
- Hangfire path handling was hardened.
- Hangfire stale-request `401` handling no longer allows an old request to wipe a
  newer session after a company switch.
- Logout resolves the backend for the current request rather than assuming only
  the default backend.
- Logout has an upstream timeout.
- Local auth cookies clear deterministically.
- Cross-site logout is rejected.

### Verification already completed

- Focused Phase 2 security/runtime tests passed at an earlier checkpoint.
- Full suite at that checkpoint reported 138 test files and 471 passing tests.
- Architecture and lint gates also passed at that checkpoint.

### Demo Login decision

Demo Login intentionally remains enabled during development.

Relevant files include:

```text
src/platform/auth/login/Login.tsx
src/platform/auth/login/components/LoginForm.tsx
src/platform/auth/login/components/DemoLoginSection.tsx
src/platform/auth/login/hooks/useLoginForm.ts
```

Do not remove Demo Login as part of the current hardening phases. Remove it only
as an explicit Production-readiness task.

### Key files

```text
src/lib/api/proxy-security.ts
src/lib/api/proxy-security.test.ts
src/app/api/[...path]/route.ts
src/app/api/hubs/[...path]/route.ts
src/app/hangfire/[[...path]]/route.ts
src/app/api/auth/logout/route.ts
```

---

## Phase 3 — Next.js Runtime Architecture 🟡

### Objective

Align the application with the Next.js 16 runtime model, reduce unnecessary
request-dynamic scope, use Cache Components safely, and make route transitions
compatible with Instant Navigation.

### Implemented

- Removed protected session cost from the auth/login root path by moving
  `SessionProvider` under the protected `(main)` tree.
- Added main-app-only bootstrap ownership through `MainClientBootstrap`.
- Added `src/instrumentation.ts` with `onRequestError` foundation.
- Added `src/app/global-error.tsx`.
- Removed root-level `cookies()` ownership from the main static shell.
- Added `runtime-preferences.ts` and focused tests.
- Added `RuntimePreferencesBoundary.tsx`.
- Request-specific theme/language/direction now live below an explicit runtime
  preference boundary.
- Enabled `cacheComponents: true`.
- Removed obsolete/incompatible `force-dynamic` declarations from BFF,
  Hangfire, SignalR, and `.well-known` handlers.
- `.well-known` endpoints can build as Static.
- Most UI routes can build as Partial Prerender.
- Background realtime bridges were placed behind explicit `Suspense` boundaries.
- React Query Devtools are also isolated behind `Suspense` in development.

### First Instant Navigation issue — fixed

`NotificationRealtimeBridge` and `RealtimeEntityBridge` were client-only dynamic
components that were outside a suitable `Suspense` boundary. That validation
failure was corrected in `src/app/(main)/MainShell.tsx` without disabling Instant
Navigation.

### Current blocker — root `/`

Current unresolved error:

```text
Route "/": Could not validate `instant` because the target segment was prevented
from rendering, likely due to one of the following errors.
```

The current root chain is:

```text
/
→ src/app/(main)/(shell)/page.tsx
→ DashboardLanding
→ client session/role decision
→ TenantDashboardPage OR ModuleLauncherPage
```

`DashboardLanding` currently selects the entire root UI from client session state.
This is the leading architecture hypothesis for why Instant Navigation cannot
validate a stable target shell, but it still needs to be proven against the full
render chain before changing behavior.

### Files to inspect next

```text
src/app/(main)/(shell)/page.tsx
src/app/(main)/MainShell.tsx
src/shell/dashboard/DashboardLanding.tsx
src/platform/modules/ModuleLauncherPage.tsx
src/platform/tenants/TenantDashboardPage.tsx
src/lib/auth/SessionContext.tsx
src/shell/auth/RouteAuthorizationGuard.tsx
src/platform/tenant-access/TenantAccessBoundary.tsx
```

Inspect especially for:

- `useSession`
- `usePathname`
- `useSearchParams`
- `useRouter`
- `router.push` / `router.replace`
- `redirect`
- `notFound`
- `dynamic(..., { ssr: false })`
- direct `window`, `document`, or `localStorage` access
- thrown promises/errors
- loading branches that prevent an immediate shell
- misplaced or missing `Suspense` boundaries

### Constraints for the fix

- Do not set `instant = false` as a workaround.
- Do not disable `cacheComponents`.
- Do not add broad `force-dynamic` configuration.
- Do not move business logic into the App Router page.
- Preserve the current role-dependent dashboard behavior.
- Prefer a route-local stable shell/boundary that allows the target route to
  render immediately and stream the session-dependent body when necessary.

### Exit criteria

- Root `/` passes Instant Navigation validation.
- Production build remains green.
- PPR classifications remain intentional.
- No protected/session data leaks into public/auth routes.
- Runtime behavior is measured again under Phase 11.

---

## Phase 4 — Bundle & Client Runtime Reduction ⬜

### Objective

Reduce global JavaScript, provider cost, and client work so ERP growth does not
turn every route into a large common bundle.

### Planned work

1. Lazy-load locale resources instead of bundling English and Arabic resources
   globally when both are not needed immediately.
2. Scope MUI `LocalizationProvider` and the date adapter nearer to real date-picker
   consumers instead of paying the cost on unrelated routes.
3. Move Syncfusion license/bootstrap work to the first capability that actually
   requires Syncfusion.
4. Review whether pull-to-refresh should be global for all authenticated ERP
   routes.
5. Avoid global client work for feature-specific integrations.
6. Review global CSS imports for Syncfusion and ActiveReports and move heavy styles
   closer to real consumers where technically safe.
7. Recheck large shared barrels and dynamic imports after bundle measurement.

### Known targets

- `src/locales/i18n.ts` eagerly imports both English and Arabic resources.
- `src/app/providers.tsx` globally owns date localization dependencies.
- `MainClientBootstrap` currently owns global Syncfusion/pull-to-refresh work for
  the protected app.
- Global CSS currently carries heavy third-party styles that should be measured.

### Exit criteria

- Common chunk cost is measurably lower or justified.
- Heavy feature libraries are paid by consumers, not by unrelated routes.
- Login/auth routes remain especially lean.
- No functional or visual regression.

---

## Phase 5 — React 19 / Client Architecture Correctness ⬜

### Objective

Remove render-time global side effects, reduce unnecessary client boundaries, and
make Strict Mode behavior predictable.

### Planned work

- Eliminate global side effects that run during render.
- Revisit provider initialization and synchronization patterns.
- Reduce unnecessary `"use client"` boundaries.
- Prefer server composition where no browser state is required.
- Keep browser/session boundaries explicit and small.
- Promote critical React/architecture lint warnings to errors when the tree is
  ready.
- Keep strict TypeScript as a required gate.

### Known item to fix

`src/app/providers.tsx` previously included render-time language synchronization:

```ts
if (i18n.resolvedLanguage !== initialLanguage) {
  void i18n.changeLanguage(initialLanguage);
}
```

Changing global i18n state during render should be refactored into an appropriate
initialization/effect boundary and covered by focused tests.

### Exit criteria

- No avoidable global mutation during React render.
- Client/server boundaries have explicit ownership.
- Strict Mode does not expose duplicate or unstable initialization behavior.

---

## Phase 6 — Observability ⬜

### Objective

Make production failures diagnosable without leaking secrets or personal data.

### Existing foundation

- `src/instrumentation.ts`
- `onRequestError`
- current console-based diagnostics

### Planned work

- Add OpenTelemetry-compatible tracing/metrics where deployment supports it.
- Carry correlation/trace IDs through BFF requests.
- Record route/module/tenant/company context only when non-sensitive and useful.
- Record backend target, latency, response status, timeout, and failure category.
- Add Web Vitals where they materially help frontend diagnosis.
- Add structured error reporting for route/global boundaries.
- Redact tokens, authorization headers, cookies, credentials, request bodies, and
  other sensitive fields.

### Exit criteria

- A production request can be followed from browser/BFF to backend using safe
  correlation data.
- Timeout, auth, backend, and frontend rendering failures are distinguishable.
- No secret-bearing telemetry.

---

## Phase 7 — CSP / Security Headers ✅

### Objective

Move from basic security headers to a tested Content Security Policy without
breaking the ERP's legitimate integrations.

### Existing headers

Current Next.js configuration already emits:

- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `poweredByHeader: false`

### Planned CSP rollout

1. Introduce CSP in Report-Only mode.
2. Collect and classify violations.
3. Enumerate real required origins.
4. Account for MUI/Emotion style behavior.
5. Account for Google Auth.
6. Account for Syncfusion assets/workers if used.
7. Account for reporting and iframe requirements.
8. Account for SignalR/WebSocket connections.
9. Remove unnecessary allowances.
10. Move from Report-Only to enforced CSP only after a clean observation period.

### Exit criteria

- Enforced CSP has no known application-breaking violations.
- Policy does not use unnecessary broad wildcards.
- Auth, SignalR, reporting, and UI styling continue to work.

### Applied and enforced — 2026-09-17

- Centralized CSP generation now emits enforced `Content-Security-Policy`.
- The initial inventory covers Google Identity Services, configured report/API
  frames, production SignalR, Syncfusion PDF runtime resources, browser-created
  blob/data media, and local fonts without broad host wildcards.
- A bounded same-origin CSP report endpoint normalizes legacy and Reporting API
  payloads and never retains full document/source/blocked URLs or query strings.
- `Reporting-Endpoints` is emitted only with a secure configured public web
  origin; `report-uri` remains the compatibility fallback.
- Nonce CSP was deliberately not introduced because the installed Next `16.3.5`
  runtime documents per-request nonces as incompatible with PPR.
- Google popup compatibility uses `Cross-Origin-Opener-Policy:
  same-origin-allow-popups`.
- A real Chrome HTTPS smoke loaded the login surface, Next runtime,
  MUI/Emotion-generated styles and the Google GIS script under enforcement without
  an observed CSP block. The collector also accepted an `enforce` report while
  retaining only its normalized directive/source classification and external
  origin.
- The production `next start` response has the enforced header, no Report-Only
  header, no `'unsafe-eval'`, no development-wide WebSocket schemes and does have
  `upgrade-insecure-requests`.
- Focused browser-security tests pass `12/12`; the full frontend suite passes
  `155/155` files and `542/542` tests. TypeScript normal/strict, architecture,
  i18n, lint, module-generator and dependency audit are green.
- The production build succeeds for `68/68` pages. Application routes remain PPR
  (`◐`), `/api/security/csp-report` remains dynamic (`ƒ`), and bundle budgets
  remain green, proving enforcement did not trade away the Phase 3 runtime model.

Status: **Complete at source/runtime-policy level. Authenticated smoke against real
deployment SignalR, reporting/PDF, file/media, Hangfire and external-frame data is
a Production release gate because it requires the target environment and valid
representative session/data. Any confirmed violation must be remediated through
the bounded central allowlist, never with a wildcard. Demo Login remains a separate
Production-readiness removal action.**

---

## Phase 8 — E2E Testing ✅

### Objective

Protect the ERP workflows that unit tests and isolated component tests cannot
fully prove.

### Recommended foundation

Use Playwright for browser-level smoke and critical-path coverage.

### Initial smoke journeys

- Login.
- Demo Login during development.
- Tenant selection.
- Company selection.
- Module launcher.
- Permission/route guard.
- Representative CRUD.
- Company switch.
- Session refresh and expiry.
- Logout.
- 403 flow.
- 404 flow.
- 503/backend-timeout flow.
- RTL flow.
- Mobile viewport smoke.
- Unsaved-change navigation guard.

### Representative business features

Start with:

1. Countries / reference-data flow.
2. Fiscal Years.
3. Appointments.
4. Representative HR flow.

This gives coverage across multiple ownership boundaries instead of testing only
one module.

### Applied closure — 2026-09-18

- `@playwright/test` is a direct development dependency with explicit E2E scripts
  and `playwright.config.ts`.
- The deterministic upstream fixture runs locally and in CI through the real Next
  BFF/cookie/session path; no production credentials or persistent customer data
  are required.
- The suite contains `21` browser tests and covers login/Demo Login,
  tenant/company selection, module launcher, permission guards, company switch,
  refresh/expiry/logout, `403`, `404`, `503`, RTL, mobile authenticated smoke,
  unsaved browser traversal, Back/Forward/hard refresh and PPR/Instant Navigation.
- Countries provides list/search/validation/create/update/API-failure coverage;
  Fiscal Years provides a second create/update path through the shared tenant
  form pattern; Appointments and HR provide representative cross-owner browser
  smoke.
- Company-context tests prove the server session is revalidated and stale
  company-scoped business data is not exposed after the switch.
- Vitest explicitly excludes `e2e/**`, so unit/integration and browser suites are
  owned by separate runners.
- Web CI installs Chromium after the production build, runs `npm run test:e2e`,
  and uploads `playwright-report/` / `test-results/` on failure.
- Final closure evidence: production build `68/68`; Vitest `155/155` files and
  `544/544` tests; CI-mode Playwright `21/21` against `next start`.

### Exit criteria

- Critical authenticated user journey runs in CI.
- Permission and company/tenant transitions have browser-level regression
  protection.
- At least one representative CRUD flow exists for major frontend ownership
  patterns.

Status: **Complete at source/CI level.** Production deployment-specific Google,
SignalR, reporting/PDF/file and external-frame smoke remains part of the separate
production release gate; it is not a reason to use production credentials in the
deterministic Phase 8 browser suite.

---

## Phase 9 — Coverage Strategy ✅

### Objective

Use coverage to protect important infrastructure and business behavior, not to
chase an arbitrary 100% number.

### Priority coverage areas

- Auth/session lifecycle.
- Tenant/company switching.
- Query and mutation infrastructure.
- BFF proxy security.
- Route access and permissions.
- Shared forms and validation.
- Shared grid infrastructure.
- Module ownership/registration.
- Runtime preference boundaries.
- Error and timeout behavior.

### Policy

- Introduce thresholds only after a reliable baseline exists.
- Prefer high confidence on critical branches over superficial line coverage.
- Do not add low-value tests solely to inflate a metric.
- New shared infrastructure should normally include focused regression tests.

### Exit criteria

- CI publishes a repeatable coverage report.
- Thresholds protect critical infrastructure without encouraging meaningless
  tests.

### Closed baseline — 2026-09-18

Coverage now uses Vitest V8 over an explicit critical-infrastructure surface:
auth/session and company switching, BFF proxy/security routes, realtime token
parsing, platform auth/tenant-admin response parsers, query/mutation primitives,
shared form/grid safety helpers, module registration, route access, runtime
preferences and safe error/return-path utilities. The first repeatable baseline
is `80.81%` statements, `76.35%` branches, `81.54%` functions and `83.18%`
lines across that scope.

CI runs `npm run test:coverage` as the unit-test gate, publishes LCOV/JSON output,
and fails below `79%` statements, `74%` branches, `80%` functions or `82%` lines.
These floors deliberately sit below the observed baseline rather than targeting
an arbitrary repository-wide percentage. The closing run passed `162/162` test
files and `565/565` tests.

Status: **Complete.** New shared or security-critical infrastructure should add
focused regressions and remain inside the measured critical scope when it becomes
part of the foundation contract; low-value UI tests must not be added solely to
raise the metric.

---

## Phase 10 — Dependency Upgrade Policy ✅

### Objective

Keep the stack current without mixing many high-risk major migrations into a
single change set.

### Current policy

- Semver-safe refreshes may be grouped when gates stay green.
- Major upgrades are handled one dependency family at a time.
- Read migration guides/changelogs before upgrading a major version.
- Run architecture, type, lint, tests, build, and bundle measurement after each
  meaningful upgrade group.
- Do not hide new type failures with unsafe casts.

### Major-upgrade candidates previously identified

Prior review identified possible future major upgrades across tooling and runtime
libraries, including ESLint, FullCalendar, SignalR, Syncfusion, Node types,
docx-preview, React Hooks ESLint tooling, Framer Motion, globals, i18next,
lucide-react, react-error-boundary, react-i18next, react-simple-maps, TypeScript,
and Vitest.

This list is historical planning input, not a command to upgrade all packages.
Re-run `npm outdated` immediately before each dependency phase and use the current
installed tree as the source of truth.

### Closure execution

Phase 10 was closed by applying the policy to each material family, not by forcing
the outdated report to zero. Completed migrations/cleanup are:

- MUI X `9.14.0`, TanStack Query `5.103.1`, `react-hot-toast` `2.6.1`, ESLint
  `9.39.5` and the matched Vitest/coverage `4.1.11` pair were refreshed within
  their verified majors;
- SignalR moved to `10.0.11` and retained the existing realtime contract against
  the .NET 10 backend;
- i18next moved to `26.4.2` and react-i18next to `17.0.14`; configuration now
  uses v26 `initAsync` rather than removed `initImmediate`;
- react-simple-maps moved to `5.0.5`; the map boundary validates TopoJSON and
  converts it to typed GeoJSON using `topojson-client` rather than weakening the
  type boundary;
- FullCalendar moved to React `7.1.0`, its React subpath plugins/locales, Temporal
  polyfill and explicit skeleton/Classic theme CSS;
- lucide-react moved to `1.47.0` for its small health/Hangfire surface;
- unused `react-error-boundary`, obsolete `@types/react-simple-maps`, and redundant
  direct `@eslint/js`, `eslint-plugin-react-hooks` and `globals` dependencies were
  removed instead of version-chased.

FullCalendar v7 produced an important runtime migration finding: the historical
root `.fc` class is no longer present. The previous `.fc .fc-*` MUI selectors and
the browser smoke's `.fc` locator therefore stopped representing the runtime even
though TypeScript and the production build were green. The calendar styling now
uses FullCalendar v7's supported class hooks plus Classic-theme variables, and the
browser assertion uses the semantic calendar grid. The focused appointment suite
passes `7/7`, and the CI-mode browser smoke verifies the rendered calendar.

### Intentional defers / reopen triggers

The closing `npm outdated` result still contains known majors. They are deferred
for specific engineering reasons and are not Phase 10 failures:

- **Framer Motion 13:** reopen after interaction coverage exists for the shared
  drag/gesture surfaces (tree views, organization diagram and recruitment Kanban).
- **Syncfusion 34:** reopen as one coordinated family after the PDF viewer's
  currently versioned external runtime resource is tied to the package family and
  a real PDF browser smoke is available.
- **docx-preview 0.4:** reopen with a real DOCX viewer fixture/smoke before taking
  the pre-1.0 change.
- **ESLint 10:** reopen when the current Next/`eslint-plugin-import` chain supports
  ESLint 10 without a peer mismatch; the verified ESLint 9 line remains current
  for this application.
- **Vitest / coverage-v8 5:** reopen as a paired toolchain migration that proves
  the Phase 9 thresholds and coverage reports remain equivalent.
- **TypeScript 7:** blocked by the installed `typescript-eslint` compatibility
  range (`<6.1.0`); do not suppress or override that peer constraint.
- **`@types/node` 26:** reopen together with an intentional runtime/CI Node policy
  change; CI currently runs Node 22.

### Closure evidence

- `npm run check` — PASS (architecture, i18n, lint and type-check).
- `npm run test:coverage` — `162/162` files and `565/565` tests; `80.81%`
  statements, `76.35%` branches, `81.54%` functions and `83.18%` lines.
- `npm run test:module-generator` — PASS.
- `npm audit --omit=dev --audit-level=high` — `0` vulnerabilities.
- production build — `68/68` pages.
- bundle — `24.39 MiB` total JavaScript versus approximately `24.37 MiB` before
  the FullCalendar/final tranche; `/appointments` is `2.33 MiB`, with both values
  inside the existing `26 MiB` / `4.5 MiB` budgets.
- CI-mode Playwright — `21/21` passed, including the appointment runtime smoke.
- documentation recipes — `77/77` passed; `git diff --check` passed.

Status: **Complete.** A deferred family is reopened only when its compatibility
or runtime-evidence trigger is met; the one-family-at-a-time policy remains the
normal dependency governance rule.

### Exit criteria

- No blind bulk-major upgrade.
- Every major migration has its own verification evidence.
- Runtime behavior and bundle size are compared before/after where relevant.

---

## Phase 11 — Performance Budget / Measurement ✅

### Objective

Treat perceived speed and bundle growth as measurable architecture properties.

### Existing tooling

- `npm run measure:build`
- `documentation/web-next/architecture/performance-baseline.md`

### Current accepted baseline — 2026-09-18

The clean production baseline is now recorded from the post-Phase-10 tree:

```text
App-path manifest entries       71
Measured First Load routes      60
Generated JS chunks             270
Aggregate generated JS          24.39 MiB
Largest emitted chunk           11.06 MiB
Protected shared intersection   26 chunks / 1.60 MiB
/                               2.00 MiB
/login                          1.14 MiB
/register                       1.94 MiB
/finance/fiscal-years           2.23 MiB
/appointments                   2.33 MiB
```

The canonical detailed record is
`documentation/web-next/architecture/performance-baseline.md`.

### Measurement policy

- Production `measure:build` owns route First Load JS, shared protected chunk
  weight, largest emitted chunks and route-class budgets.
- Login/auth, shell/launcher, ordinary business routes, heavyweight feature
  routes and the minimal error route are budgeted separately.
- PPR/Instant Navigation behavior remains covered by browser E2E.
- LCP, INP, client-navigation latency and company/module-switch latency are
  browser/runtime experience metrics. Observe them in authenticated browser or
  production telemetry and investigate from evidence; do not add unstable CI
  wall-clock thresholds tied to runner performance.
- Heavy locale/date/reporting/viewer runtimes remain route/interaction local and
  are reopened only when bundle ownership or runtime evidence shows regression.

### Budget policy

- The clean current baseline is established and versioned in the performance guide.
- `measure:build` enforces route-class budgets: `1.10 MiB` error fallback,
  `2.15 MiB` public auth, `2.25 MiB` protected shell/launcher, `2.55 MiB`
  business application and `2.75 MiB` heavy feature entry.
- Protected shared First Load JavaScript is capped at `1.85 MiB`.
- Existing backstops remain: `26 MiB` total emitted JS, `12 MiB` largest chunk and
  `4.5 MiB` absolute route maximum.
- CI already runs `npm run measure:build`, so the class/shared budgets are release
  gates without adding another workflow stage.
- A budget increase requires an explicit product/architecture justification.

Focused policy coverage verifies route classification, protected membership and
the exact over-budget violation shape in
`scripts/performance-budget-policy.test.mjs`.

### Exit criteria

- ✅ Current baseline is recorded.
- ✅ Major route classes have agreed and CI-enforced budgets.
- ✅ Future architecture changes can be compared objectively against the same
  production-build policy.

Status: **Complete.** Future performance work is evidence-driven feature-local
tuning; do not reopen the shared runtime merely because an emitted chunk count
changes while route/shared budgets remain healthy.

---

## Phase 12 — CI as Definition of Done ✅

### Objective

Use the existing CI pipeline as a real release contract instead of treating
checks as optional cleanup.

### Existing CI foundation

The current web CI now enforces:

- Node environment setup.
- `npm ci`.
- production audit.
- architecture checks.
- i18n checks.
- ESLint.
- the canonical project-wide strict type-check.
- critical-infrastructure coverage thresholds and coverage artifact publication.
- module generator self-test.
- production build.
- aggregate, shared-runtime and route-class bundle budgets/measurement.
- Playwright browser E2E against the production server.
- automated WCAG A/AA accessibility smoke on critical desktop/mobile surfaces.
- a production-path browser-security header/CSP regression smoke.
- generated-documentation consistency.

Therefore the roadmap is **not** to "add CI" from scratch. The work is to keep
the existing pipeline green and make it the Definition of Done.

### Applied closure additions

- Phase 9 coverage thresholds are enforced by `test:coverage`, and CI publishes
  the resulting coverage directory as an artifact.
- `@axe-core/playwright` scans the public login route, authenticated application
  shell, representative Countries CRUD page/form and mobile login against WCAG
  A/AA rules. The first run exposed real shared accessibility defects rather than
  being baselined away: the language Select was not programmatically tied to its
  label, icon-only theme controls and responsive brand links lacked accessible
  names, the sidebar section used invalid list-child semantics, and the shared
  form subtitle compounded `text.secondary` with opacity until it failed contrast.
  Those shared root causes are fixed and the regression smoke stays in the normal
  Playwright suite.
- The production browser-security smoke requests the actual built application and
  verifies enforced CSP, absence of Report-Only/production `unsafe-eval`, and the
  core hardening headers emitted by Next configuration.
- Playwright keeps CI retries for diagnostic evidence but enables
  `failOnFlakyTests`, so a test that only passes on retry still fails the CI
  Definition of Done.
- Optional Web Vitals / real-user timing remains telemetry evidence rather than a
  runner-dependent PR timing threshold.

### Definition of Done for frontend changes

A normal architectural or shared-infrastructure change is complete only when the
applicable current tree passes:

```powershell
npm.cmd run check:architecture
npm.cmd run check:i18n
npm.cmd run lint -- --quiet
npm.cmd run type-check
npm.cmd audit --omit=dev --audit-level=high
npm.cmd run test:coverage
npm.cmd run test:module-generator
npm.cmd run build
npm.cmd run measure:build
npm.cmd run test:e2e
```

Documentation-affecting changes must also pass the centralized documentation
system check:

```powershell
documentation/system/Generate-Documentation.ps1 -Check
```

If a gate is blocked by pre-existing unrelated work, record the exact failure and
do not report the complete CI baseline as green.

### Deterministic CI versus deployment release gates

Generic PR CI must remain deterministic and self-contained. Real
Collector/dashboard/alert retention and delivery, authenticated Google popup,
deployment SignalR, report/PDF/file previews, Hangfire, configured external-frame
integrations and final Production Demo Login removal require the target deployment,
credentials or representative data. They remain explicit staging/Production release
checks and do not keep Phase 12 source/CI closure open.

### Exit criteria

- ✅ Architecture, i18n, lint and the single strict type policy are CI-blocking.
- ✅ Production dependency audit, coverage thresholds/artifact, generator test,
  production build and Phase 11 budgets are CI-blocking.
- ✅ Critical browser journeys, WCAG A/AA smoke and production browser-security
  headers are exercised against the built application.
- ✅ A pass-on-retry is treated as CI failure rather than a silent flaky success.
- ✅ Generated documentation consistency is part of the same release contract.

Status: **Complete.** Keep this contract green as business work continues; add a
new deterministic gate only when it protects a demonstrated regression class.

---

## 5. Current Blockers and Follow-up Queue

### 5.1 Root `/` Instant Navigation validation — highest priority

The current technical priority after this roadmap document is the root route
validation failure described in Phase 3.

Next action:

1. Trace the complete root dashboard render chain.
2. Find the first component preventing an instant-ready shell.
3. Add the narrowest correct route-local boundary/shell.
4. Preserve role-dependent dashboard behavior.
5. Re-run focused runtime tests and the production build.

### 5.2 Documentation staleness

The canonical architecture documentation still contains stale ownership/path
descriptions from before the latest route-group/module reorganization. That
cleanup should be handled deliberately rather than mixed into the runtime bug
fix.

### 5.3 i18n gate

Re-run `npm run check:i18n` after the current runtime changes. Do not assume the
previous `global-error.tsx` visible-string issue is gone until the gate proves it.

### 5.4 SignalR development negotiation noise

Development logs previously showed repeated negotiation/fetch failures from the
SignalR layer. Treat this as a separate investigation unless evidence proves it
is part of the Instant Navigation failure.

Potential source:

```text
src/lib/signalr/signalRService.ts
```

---

## 6. Architecture Principles That Remain Non-Negotiable

1. `src/app` is a thin App Router/composition layer, not a business layer.
2. Public URLs do not change because internal ownership folders change.
3. Route Groups are organizational only unless a URL change is explicitly
   requested.
4. Business modules do not import App Router or Shell internals.
5. Platform remains independent from business modules.
6. Shared code remains domain-neutral.
7. Cross-owner imports use deliberate public APIs.
8. Typed routes remain centralized.
9. Reuse established shared components before introducing replacements.
10. Preserve existing UI behavior during architecture refactors.
11. Non-idempotent mutations do not receive automatic global retry.
12. Browser-supplied forwarding headers are not trusted as network identity.
13. Session/company transitions must not leak stale request/cache state.
14. Cache Components and Instant Navigation issues are fixed at their real
    boundaries rather than disabled globally.
15. Major dependency upgrades are isolated and verified incrementally.

---

## 7. Execution Order From Here

Use this order unless a new production-critical defect overrides it:

1. Keep the completed Phase 0–7 foundation gates green while business work
   continues; do not reopen them without concrete regression evidence.
2. Keep the completed Phase 9 strict/runtime-boundary and critical coverage gates
   green while business work continues.
3. Keep the completed Phase 10 dependency policy green; reopen a deferred family
   only when its compatibility/runtime-evidence trigger is met, still one family
   at a time.
4. Keep the completed Phase 12 CI Definition of Done green, including coverage,
   Phase 11 budgets, accessibility, production browser-security and fail-on-flaky
   browser gates.
5. At Production-readiness time, run the documented authenticated CSP integration
   smoke and remove Demo Login; treat these as release gates rather than reverting
   Phase 7 to Report-Only.

The roadmap should be updated after each phase so it remains the current source
of execution status rather than a historical checklist.
