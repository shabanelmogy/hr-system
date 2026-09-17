# Frontend Architecture Reference

Status: Applied to `web-next`; modular foundation completed 2026-09-10 and the
provider/client-runtime loading policy was consolidated 2026-09-17.

This document is the architecture baseline for future frontend work. It covers ownership, dependency direction, routing, naming, scalability, and client-runtime loading policy. It does not define authentication behavior, API implementation, or UI design. The current transport and API parity gate is recorded in [Web/API Readiness Review](../WEB_API_READINESS_REVIEW.md).

## Feature Implementation Guides

- [Feature Documentation System](../../system/README.md): operating modes,
  copy-ready implementation request, evidence phases, regeneration, and handoff.
- [Server-Managed Feature Frontend Reference](../features/server-managed-feature-reference.md): the canonical reusable pattern for master-data and business CRUD features.
- [Countries Full-Stack Web and Mobile Implementation Profile](../features/countries-frontend-reference.md): the concrete shared API plus web/mobile Countries configuration and implementation notes for that general pattern.
- [States Next.js Frontend Reference](../features/states-frontend-reference.md):
  the parent-dependent applied reference; it is not evidence for unrelated fields
  or views.
- [Business Feature Template](business-feature-template.md): the standard query,
  validation, form, feedback and module-ownership shape, applied to Fiscal Years.
- [Frontend Module Generator](module-generator.md): module scaffold contract and
  the Accounting/Chart-of-Accounts backend-contract constraint.
- [Performance Baseline](performance-baseline.md): production First Load and
  lazy-chunk measurements after the modular migration.

## Review Summary

The review found no Critical issues.

High-priority issues that were fixed:

- Circular dependencies between shared component barrels and child components.
- Feature and shared components depending on layout internals.
- A shared notification service importing country-specific feature code.
- An overly broad shared component barrel hiding ownership boundaries.

Medium-priority issues that were addressed:

- Inconsistent feature page ownership.
- Mixed directory casing and naming conventions.
- Fragmented component prop types.
- Missing automated dependency-direction checks.
- Untyped application routes.
- Unused legacy barrels and route definitions.

Low-priority cleanup that was addressed:

- Removed the unused `src/shared/index.js` barrel.
- Moved global-presence dashboard ownership from `home` to geographical information.
- Replaced layout-owned content wrapping with a shared layout utility.

## Modular ownership baseline

The target ownership structure is now physically applied. The legacy
`src/features` and `src/layouts` roots are absent and remain guarded as migration
tripwires; business code lives under `src/modules`, product platform capabilities
under `src/platform`, and application chrome under `src/shell`.

| Owner | Current directories | Dependency notes |
| --- | --- | --- |
| Platform | `advanced-tools`, `auth`, `file-manager`, `global-search`, `modules`, `notifications`, `realtime`, `tenant-access`, `tenant-admins`, `tenants` | Depends only on shared/low-level infrastructure. Business modules register integrations such as realtime invalidation into Platform public APIs. |
| HR | `attendance-devices`, `basic-data`, `home`, `recruitment`, `workforce-planning` | HR-owned workforce, recruitment, attendance, and organizational capabilities. |
| Accounting | `fiscal-years` plus module definition and module-local infrastructure | Fiscal Years is owned by Accounting and is exposed to dependent modules only through the Accounting public API. |
| Shell | sidebar, top bar, layout, route guard | Consumes Platform public APIs and shared UI only; it does not import business-module internals. |
| Shared | domain-neutral UI/infrastructure plus `reporting` | Must remain business-neutral. Domain report pages stay with their module owner. |

`check:architecture` analyzes static imports and literal dynamic `import("...")`
expressions, validates module directories, rejects code returning to legacy
`src/features`/`src/layouts`, validates dependency direction, and enforces public
`index.ts` boundaries across owners.

### Shared module shell behavior

`shared/components/layout/feature-module/FeatureModuleLayout` is the reusable
module shell for overview, list, and detail routes. It owns the responsive
navigation drawer, breadcrumbs, active-trail selection, and the bounded content
panel. The content panel uses `overflow-y: auto` so long overview/card pages keep
their scroll inside the shell; feature pages must keep child grids and data
panels at `min-height: 0` so they do not create a second body scrollbar. The
navigation helper prefers the deepest matching route when legacy prefixes
overlap. Consumers provide translated labels and module-owned items; they do
not recreate the drawer or apply domain-specific route matching.

The shell is compatible with RTL and narrow viewports. On screens below `md`,
the temporary drawer is above the fixed top bar and the top bar collapses the
brand text while preserving accessible icon labels and context actions. Focused
coverage lives in `shared/components/layout/feature-module/navigation.test.ts`
and the consuming Basic Data, Workforce Planning, and Attendance layouts are
the compatibility examples.

Opening the internal mobile navigation drawer closes the primary sidebar; at
`lg` and above, an expanded internal navigation also closes it. The primary
mobile sidebar remains available whenever the internal mobile drawer is closed.

### User and company context lifecycle

`SessionContext` owns the abort controller and generation gate for session and
company transitions. When the user, tenant, or company changes, requests from
the previous identity are aborted and their results cannot publish into the new
identity. The API client remains gated until the transition has completed; it
does not replay a request that was started under the previous context.

`MainShell` must distinguish **initial session bootstrap** from a real identity
transition. The initial `null -> authenticated user` bootstrap keeps the same
`ContextShell` and QueryClient so page queries that were allowed to start from
the authenticated cookie context are not cancelled and replayed when
`/api/auth/session` resolves. A real company switch or logout sets the explicit
transition flags in `SessionContext`; while either flag is active `MainShell`
unmounts `ContextShell`, which clears the QueryClient and feature-local stores
before the next authenticated context mounts. This preserves company/user cache
isolation without paying for a duplicate initial request wave.

The shared `UnsavedChangesProvider` exposes
`requestDiscard(): Promise<boolean>`. Same-tab links, sidebar items, module
launchers, and company switching use this promise before navigation. A busy
form submission refuses navigation, and a pending confirmation resolves
`false` when its provider unmounts. Browser same-document Back/Forward uses
Navigation API cancelable `navigate` events, cancelled before Next handles the
route. One confirmation retains the first destination key during repeated
traversals; acceptance calls `traverseTo(key)` exactly once. Dirty/clean changes
never push, replace or remove history entries. Pending decisions cannot replay
after disposal or a change of origin. The existing shared dialog provides RTL,
translated labels and keyboard support; no new consumer options are required.
`FormContainer` registers dirty/pending submissions; company and module switchers
continue to call `requestDiscard()` before changing context.

Compatibility: this browser-history guarantee requires Navigation API and a
cancelable same-document event. Older browsers retain application-link guards
and full-document beforeunload protection, but same-document browser traversal
is not guaranteed there. No unsafe popstate restoration fallback is installed.
`historyTraversalGuard.test.ts` covers repeated traversal, cancellation, exact
multi-step and forward destinations, disposal and changed origins. A local real
Chromium harness verified no router popstate before approval, one exact accepted
traversal and unchanged history length. Full authenticated ERP journeys remain
a manual release check when the backend is unavailable.

Company-switch verification suppresses per-attempt failure redirects. Only the
final unsuccessful verification redirects to service-unavailable; a session 401
terminates verification through logout. Stale generations cannot overwrite the
verification result; a concurrent logout invalidates the switch via its epoch.

### Navigation and mobile runtime safety baseline

**Problem.** An ERP route can contain dirty form state or an in-flight write
while navigation may originate from many surfaces: links, sidebar buttons,
global search, notifications, company/module switchers, logout, browser history,
refresh/close, or mobile pull-to-refresh. Handling only ordinary `Link`
navigation leaves several paths capable of discarding edits or replaying work.

**Root cause.** Navigation is not one API. Next links and `router.push()` are
application navigation, browser traversal has its own pre-commit lifecycle,
full-document unload is separate again, and pull-to-refresh is a gesture-driven
query action rather than route navigation.

**Decision.** Protected user-initiated navigation must pass through the shared
unsaved-change decision before leaving an editing context. The provider guards
same-origin links, `beforeunload`, and cancelable same-document browser traversal;
programmatic protected navigation calls `requestDiscard()` explicitly. Company
switching additionally rotates/cancels the previous request context and relies on
the `MainShell` transition boundary to clear the old QueryClient. Forced
authentication/session/security redirects are exempt: an expired or invalid
session must leave protected content even when a form was dirty.

Mobile pull-to-refresh follows a separate safety policy. It is loaded only on a
touch/coarse-pointer client and during idle time. A gesture is rejected when the
page is not at the top, a form is dirty or submitting, any React Query mutation
is pending, a dialog/modal is active, the gesture starts in a grid/tree-grid or
blocked surface, or an editable control has focus. An accepted gesture refetches
active read queries only; it never invokes or retries mutations.

**Implementation impact.** Sidebar items/sections, module and company switchers,
global search, notification destinations, file viewing, profile navigation and
user-initiated logout use the shared guard. `check:architecture` enforces that a
protected source containing `router.push`, `router.replace` or `router.refresh`
also contains the unsaved-change guard unless it is a documented system redirect.
The same architecture gate prevents `pulltorefreshjs` from escaping
`MainClientBootstrap`, keeping gesture policy centralized.

**Verification.** The Phase 5 closure run passed `56/56` focused tests covering
history traversal, unsaved-change registry, pull-to-refresh policy, company
switch/session verification, platform navigation and navigation composition.
`check:architecture`, normal and strict TypeScript, and the existing full
frontend suite are green. The authenticated runtime smoke from the page-loading
closure also exercised normal protected navigation without browser runtime
errors.

**Prevention rule.** Do not add a protected imperative navigation path that
bypasses `requestDiscard()`, do not implement popstate/history rewrites as an
unsaved-change workaround, and do not add a second pull-to-refresh integration.
Security-forced redirects may bypass the prompt only when that exception is
explicitly documented in the architecture checker.

### On-demand feature tooling

Heavy export dependencies are loaded only when the export action is invoked.
`useGridExport` keeps its existing consumer-facing behavior while importing
the spreadsheet tool on demand, so ordinary list and dashboard routes do not
pay the export bundle cost. The export path retains the shared loading and
error states and is covered by its focused hook checks.

Interaction-only feature UI follows the same rule. Route-entry pages keep the
list/dashboard surface static, while local forms and workflow dialogs are
loaded with `next/dynamic` and are not mounted until their interaction state is
active. A closed dialog must not be rendered merely with `open={false}`, because
rendering the dynamic boundary still requests its chunk. Tabs and optional
chart/import/report views use the same first-consumer loading rule when they
carry a materially separate client runtime. Authentication forms or other UI
that is the route's primary first paint remain static. `check:architecture`
guards feature `*Page.tsx` files against reintroducing static local `*Form` or
`*Dialog` imports.

This is the canonical client-runtime loading policy for the application:

1. **Route entry loads only first-paint UI.** A route may statically import the
   list, dashboard, header, filters, or controls that are visible immediately.
2. **Interaction-only UI is lazy.** Local create/edit/view forms, workflow
   dialogs, upload surfaces, detail dialogs, optional settings panels, and
   similar user-triggered UI must use a dynamic boundary when they carry
   meaningful client runtime or dependencies.
3. **Do not mount closed lazy UI.** Prefer
   `{open ? <LazyDialog open /> : null}` over `<LazyDialog open={false} />`.
   The latter can still request and compile the lazy chunk.
4. **Optional views load at first consumer.** Cards, charts, reports, importers,
   document viewers, PDF viewers, spreadsheet tooling, maps, drag/drop engines,
   and other materially separate views should not be part of route entry unless
   that view is the initial surface.
5. **Providers follow the same locality rule.** Date-picker providers,
   reporting/viewer bootstraps, and other heavy client providers belong at the
   nearest real consumer rather than the application root.
6. **Do not lazy-load primary first paint just to reduce a number.** Login,
   registration, or another route whose form is the page itself should keep the
   required UI static unless a measured reason proves otherwise.
7. **Measure, do not guess.** After a runtime-boundary change, run the production
   build and `measure:build`; development Turbopack compile logs alone are not a
   bundle-size metric.

Current applied examples include Fiscal Years, Workforce Planning, Countries,
States, Districts, Address Types, Recruitment, Attendance Devices,
Organizational Structure, Users, Roles, Invitations, Crystal Reports, and File
Manager. Fiscal Years is the reference example: its form, React Hook Form/Zod
path, and MUI date-picker runtime are not part of route entry and are first
loaded when Add/Edit/View is opened. The measured production First Load for
`/finance/fiscal-years` after this isolation is about `2.78 MiB`, down from the
previous documented baseline of about `3.76 MiB`. Treat that number as a point-in-time
measurement, not a permanent budget.

The date runtime is intentionally local. `MyDateTimeField` owns its
`LocalizationProvider`, `AdapterDayjs`, and picker imports; routes that visibly
render a date control on first paint will still load that runtime immediately.
Routes that only need date controls inside a lazy form inherit the form's lazy
boundary and do not pay that cost at route entry.

Translation loading follows the same principle without sacrificing hydration
correctness. The root i18n instance eagerly contains only the shared `core`
namespace. Route/feature scopes synchronously register their EN/AR bundles and
provide the feature namespace through `I18nextProvider`, so existing bare
`useTranslation()` consumers resolve locally while shared keys fall back to
`core`. Translation resources are loaded at the owning route/feature boundary,
not globally at application startup.

### Authentication startup and post-login runtime rules

The login route is a performance-sensitive platform entry point. Optimize its
first paint and its post-submit transition separately; making `/login` fast must
not move avoidable work onto the user's first Login click or weaken session
correctness.

Current applied rules and verified findings:

1. **Login route adapters use direct imports.** Do not import the login page
   through a broad authentication barrel that also exports Users, Roles,
   password-reset, profile, or other route pages. A broad route barrel previously
   caused unrelated authentication pages to enter the `/login` initial graph.
2. **Keep primary login UI static; defer interaction-only UI.** Tenant/company
   selection dialogs load only after the server requires that selection. The
   primary username/password form remains first-paint UI.
3. **Response validation remains authoritative but may be warmed after paint.**
   The login response parser/Zod runtime may be loaded during browser idle time so
   its download/compile cost does not land on the first Login click. Do not remove
   response validation merely to reduce bundle size.
4. **Never prefetch a protected destination before authentication is committed.**
   Prefetching `/` (or another protected route) while the browser is still
   unauthenticated can cache/render a request state that does not represent the
   newly issued session. Only prefetch public/session-independent assets before
   login. Protected route navigation must observe the newly committed cookies.
5. **Prefer correctness over soft navigation after authentication.** Until the
   protected shell has an explicit authenticated bootstrap handoff, use a fresh
   post-login document navigation so Proxy, App Router and `SessionProvider` all
   evaluate the new cookies from the same request context. A future client-side
   handoff is allowed only when it carries/validates the new session state without
   reusing an unauthenticated prefetched tree.
6. **Keep session verification round-trips bounded.** Live bearer/session
   validation may combine compatible database reads, but must preserve all
   existing checks: user disabled/lockout/security stamp, tenant membership and
   subscription eligibility, company access/activity, and active refresh-session
   identity. Performance work must not weaken those semantics.
7. **Do not run `next build` concurrently with `next dev` against the same `.next`
   directory.** This can leave the development server listening on its port while
   returning empty/broken responses. Stop/restart the dev server after production
   build work when both use the same workspace.

Operationally, measure these as distinct stages:

```text
login page first paint
-> login request duration
-> response-parser/runtime cost
-> cookie commit
-> protected navigation
-> /api/auth/session verification
-> dashboard/module bootstrap queries
```

Do not attribute a slow post-login dashboard to the `/login` bundle without
measuring the stages separately.

### Protected page loading and bootstrap performance

This section is the canonical cross-route loading policy established by the
2026-09-17 full page-loading review. The review measured the production build,
then traced shared shell imports and initial network waterfalls across unrelated
protected routes.

#### 1. QueryClient bootstrap identity

**Problem.** Protected pages could issue their first data requests while the
session request was still resolving, then issue the same requests again.

**Root cause.** `MainShell` keyed `ContextShell` by
`userId/tenantId/companyId`. The first render used a null identity; when the
session response arrived the key changed, destroying the first QueryClient and
mounting a second one. Cancelling a React Query observer also does not guarantee
that an already-started HTTP request without an AbortSignal stops at the
transport layer.

**Decision.** Keep one `ContextShell` across the initial null-to-authenticated
bootstrap. Do not globally delay page queries until `user` exists merely to
avoid duplication, because that converts parallel bootstrap into a serial
`session -> page data` waterfall. Genuine company/user transitions remain
explicit transition boundaries and must unmount/reset the cache.

**Implementation impact.** `MainShell` no longer uses the initial session
identity as a React key. `SessionContext` still raises `isSwitchingCompany` /
`isLoggingOut`; those states unmount the context shell, rotate request context,
and prevent data from the previous company from surviving the transition.

**Verification.** The company-switch path was traced through
`SessionContext.switchCompany()` and `useCompanyContextTransition()`, and the
frontend type/lint gates passed after the bootstrap change. Company switching
remains part of the authenticated smoke-test release gate.

**Prevention rule.** Never solve initial-query duplication by keying the entire
protected QueryClient to session data that is null during bootstrap. Cache
identity changes must correspond to a real authenticated context transition.

#### 2. Realtime first connection versus reconnect

**Problem.** A normal first SignalR connection created a second application-wide
refetch wave immediately after route data had loaded. Notifications performed a
second first-connect invalidation as well.

**Root cause.** The realtime bridges treated `disconnected -> connected` during
normal startup as if connectivity had been lost after the application had
already been running.

**Decision.** The first successful realtime connection is not reconciliation.
Only a subsequent reconnect may refresh potentially stale server state, and
that reconciliation must use registered realtime query roots rather than a
blanket invalidation of every active query.

**Implementation impact.** Both realtime bridges track whether a successful
connection has already occurred. `RealtimeEntityBridge` invalidates the bounded
set returned by `getAllRealtimeQueryKeys()` only on a true reconnect, and only
then refreshes role/company option stores that had previously been loaded.
`NotificationRealtimeBridge` reconciles notification queries only on reconnect.
The bridges are mounted only after a real tenant/company session is known and
are not mounted for `super_admin`, for whom tenant SignalR is disabled anyway.
Notification payload Zod validation remains intact but its parser is loaded on
the first realtime notification instead of being static shell startup code.

**Verification.** Realtime registry/event and notification focused tests passed
after the change, together with frontend type-check and lint. Production bundle
measurement remains mandatory after any future registry/runtime change.

**Prevention rule.** Never call an application-wide query invalidation merely
because SignalR connected for the first time. Register resource-owned query
roots and reconcile only those roots after a real reconnect.

#### 3. ERP list pagination is server-first

**Problem.** The previous adaptive pagination hook always made a `pageSize: 1`
probe and then either fetched the current page or downloaded as many as 5,000
matching rows. A normal list could therefore require two serial requests before
becoming ready and could transfer an entire business collection unnecessarily.

**Root cause.** Client pagination was selected implicitly at runtime by probing
the total count instead of being an explicit feature requirement.

**Decision.** ERP list startup uses server pagination by default. One requested
page means one query. Whole-dataset charts, exports, or analytics are separate
capabilities and, when required, fetch their own aggregate/data contract on
demand at the first consumer.

**Implementation impact.** `useAdaptivePagination` preserves its caller-facing
shape but always executes the requested server page and reports server mode;
`allItems` and `pageItems` both represent the current page. The obsolete
5,000-row threshold was removed. Fiscal Years, Workforce Planning, Countries,
States, and Districts no longer perform the probe/fetch-all startup sequence.

**Verification.** Focused adaptive-pagination and Countries/States tests passed;
callers were reviewed for current-page grid/card semantics. Existing optional
geography charts remain lazy and consume visible/current-page data; a future
whole-dataset analytics requirement must use an explicit on-demand contract.

**Prevention rule.** Do not infer client pagination by probing collection size,
and never hide a fetch-all request inside a generic list hook.

#### 4. Shell data should not duplicate session identity

**Problem.** Every protected startup fetched user information again only to
render sidebar display name and initials even though the session response
already carried those fields.

**Root cause.** The shell used a profile query as an identity source in addition
to `SessionClaims`.

**Decision / impact.** Shell display identity comes from session claims
(`firstName`, `lastName`, `userName`, `email`). The separately needed photo query
remains and React Query may deduplicate other photo observers.

**Verification.** The sidebar change passed focused type/lint verification.

**Prevention rule.** Do not add a protected-startup API request for data already
present in the validated session contract. Profile/edit screens may still fetch
their authoritative profile resource when they need fields not carried by the
session.

#### 5. Global registration code is metadata-only

**Problem.** `MainShell -> moduleRegistration` caused unrelated protected routes
to inherit feature query/service graphs. The production audit found about
`338.6 KB` of common emitted JavaScript in chunks containing these registration
dependencies.

**Root cause.** Business realtime registration imported query-key constants from
full React Query hook modules, and some registration paths crossed the broad
`platform/realtime` barrel that also exposed the runtime bridge.

**Decision.** Global registration may import module definitions, lightweight
metadata, and dependency-light query-key leaves only. Query hooks, services,
page implementations, forms, or runtime bridges do not belong in the global
registration dependency graph. Cross-owner registration uses a deliberately
narrow public `index.ts` boundary rather than a broad barrel or an internal deep
import.

**Implementation impact.** Realtime query keys were extracted into leaf modules
for HR workforce/organizational structure, Accounting Fiscal Years, CRM
Appointments, Reference Data geography/address types, Tenants and Tenant Admins.
Business registrars use the narrow `platform/realtime/registry` public API while
existing feature hooks/API modules re-export their former key names for source
compatibility.

**Verification.** Focused query-hook tests, type checks and lint passed for the
registration refactor. The architecture checker no longer reports the business
realtime registry imports; final production `measure:build` is the authority for
the emitted shared-bundle reduction.

**Prevention rule.** If adding a global registry entry makes an unrelated route
import React Query feature hooks, API services, a viewer, form, or page, the
registration boundary is wrong. Extract metadata to a leaf and expose only the
minimal public contract.

#### 6. Post-hydration optional runtime and viewer readiness

**Problem.** A dynamic import is still startup work if every protected route
immediately mounts it after hydration. Separately, the PDF viewer imposed fixed
1,000 ms and 500 ms timers before it could load a document.

**Decision / impact.** Mobile pull-to-refresh is now touch/coarse-pointer only and
loads during browser idle time instead of every desktop hydration. The PDF
viewer keeps Syncfusion route-local but uses the viewer's `created` readiness
signal and loads the document immediately when ready; stale document fetches are
aborted instead of waiting on fixed timers.

**Verification.** Type-check accepts the viewer readiness contract and the
bootstrap change; the complete production build is the release gate.

**Prevention rule.** `dynamic()` is not a performance boundary by itself:
conditional mounting/first-consumer timing matters. Do not use arbitrary sleep
timers to model third-party component readiness when the component exposes a
real lifecycle signal.

#### 7. Dashboard API shape follows dashboard needs

Admin dashboards must not download management catalogs merely to calculate a
few aggregate cards. Prefer a dedicated server summary contract containing
aggregate counts and bounded recent/attention lists. In particular, the
super-admin tenant dashboard summary must not require tenant entitlement payloads
or the full tenant management collection. Treat a dashboard that scales transfer
and client aggregation linearly with the complete management catalog as an API
shape defect, not a frontend rendering optimization problem.

The same principle applies to future dashboards: return the smallest
authoritative summary shape the first paint needs, then fetch management/detail
data only when its owning screen or interaction is entered.

#### 8. Protected utility routes own only the providers they require

**Problem.** The production build exposed `/change-password` as a protected
route rendered inside the public-auth route group while its page component used
`useSession()` and unsaved-change registration. The shared auth shell intentionally
does not mount `SessionProvider`, because doing so would make lightweight public
routes such as `/login` inherit protected-session runtime.

**Root cause.** Route-group placement described the visual auth shell but did not
also provide the protected runtime contexts required by this one authenticated
utility page.

**Decision / impact.** Keep the public auth shell lightweight. A protected auth
utility route mounts a route-local `SessionProvider`, waits for an authenticated
session, and mounts `UnsavedChangesProvider` around the form. Do not promote those
providers to every auth route merely because one route needs them.

**Verification.** The route-local boundary passed architecture, type-check and
lint, and the subsequent Next.js production build prerendered `/change-password`
successfully as a PPR route.

**Prevention rule.** Provider placement follows capability requirements, not
route-group naming. When a protected utility page lives in an otherwise public
shell, give that page the narrow protected provider scope it needs instead of
raising session/form runtime to the shared public layout.

#### 9. Production closure baseline — 2026-09-17

The full cross-route pass is accepted only from production artifacts. The final
build generated all `68/68` static/PPR pages and `measure:build` passed every
configured budget.

Measured before -> after:

| Metric | Before | Final |
| --- | ---: | ---: |
| Common protected-route intersection | 47 chunks / ~2.89 MB | 36 chunks / ~1.61 MB |
| `/` First Load | ~2.75 MiB | **1.61 MiB** |
| `/login` First Load | ~1.13 MiB | **1.13 MiB** |
| `/administration/users` | ~3.09 MiB | **1.80 MiB** |
| `/profile` | ~3.09 MiB | **2.09 MiB** |
| `/appointments` | ~3.02 MiB | **2.77 MiB** |
| `/recruitment` | ~2.96 MiB | **1.86 MiB** |
| `/finance/fiscal-years` | ~2.78 MiB | **2.32 MiB** |
| Largest measured First Load route | ~3.09 MiB | **2.77 MiB** |

The emitted JavaScript set changed from `230` chunks / `23.36 MiB` to `263`
chunks / `24.22 MiB`. That total-on-disk number remains below the `26 MiB`
budget and is not used as a proxy for route startup: the important shared and
per-route first-load measurements decreased substantially while heavyweight
report/PDF runtimes remain isolated from ordinary routes. The largest emitted
chunk remains under the `12 MiB` budget and the largest route remains well under
the `4.5 MiB` First Load budget.

Final verification for this closure includes architecture check, normal and
strict TypeScript, full quiet lint, module-generator self-test, full Vitest,
documentation generation/check, production build, bundle measurement, focused
backend summary tests, and the post-build runtime smoke gate. Future page-loading
work should be evidence-driven feature tuning rather than reopening these shared
bootstrap decisions.

The authenticated browser smoke used the built-in development Admin flow and
verified `login -> dashboard -> /finance/fiscal-years` with real client
hydration. The final run had no console/runtime errors, session and realtime-token
requests returned `200`, and SignalR negotiated through the same-origin BFF and
started directly on Long Polling. The super-admin smoke separately verified
`login -> / -> /super-admin -> tenant dashboard summary`; the warmed
`/super-admin` document completed in about `0.19 s` and the dedicated summary
request in about `0.29 s` on the local development stack. Treat the first dev
compile separately from these warmed runtime timings.

The same smoke exposed a development SSR failure in the hand-maintained Emotion
streaming registry (`Stylis` stack overflow on a normal Fiscal Years render).
The project now delegates App Router Emotion streaming to MUI's version-aware
`AppRouterCacheProvider` from `@mui/material-nextjs/v16-appRouter`, while keeping
the RTL Stylis configuration and remounting the cache when direction changes.
Do not copy MUI/Emotion's private insert/flush integration into project code;
use the framework adapter that matches the installed Next/MUI major version.

#### 10. Review closure and intentionally deferred optimizations

The comprehensive review also found several real but lower-priority costs. They
are recorded here so future work does not rediscover them or accidentally trade
correctness for a smaller development timing number:

- **Root application loader / runtime preferences.** The inline bootstrap already
  applies language, direction and theme DOM attributes synchronously, but the
  full-screen loader remains until the request-specific cookie boundary and i18n
  synchronization finish. Removing that mask independently would require the
  client theme/i18n provider state to be initialized from the same synchronous
  source; otherwise dark/RTL users can see a flash or a hydration mismatch.
  Rework this only as one coherent runtime-preference change and re-verify PPR /
  Instant Navigation.
- **Active-language-only translation payloads.** Feature namespace scoping is
  already correct and prevents unrelated namespaces from entering a route, but
  each owning feature currently packages EN and AR resources together. Loading
  only the active language is a valid future bundle refinement, not a reason to
  move translation mutation back into render or weaken hydration correctness.
- **Realtime token startup.** Regular tenant users still obtain a dedicated
  realtime token through the BFF. Any removal of an authentication/session hop
  requires a security review; do not bypass tenant/company/session validation
  merely to shorten connection startup.
- **Local SignalR transport.** Development must not force the browser directly to
  a backend hub URL. That can trigger mixed-content, CORS, or local-certificate
  failures and an endless reconnect loop even though the same-origin
  `/api/hubs/company` BFF is available. Development always resolves the hub to the
  same-origin BFF; production may preserve an explicit secure hub URL, while an
  HTTPS page still falls back to the BFF rather than making a mixed-content HTTP
  connection. When the BFF is selected, SignalR uses Long Polling directly
  because a Next Route Handler is not a transparent WebSocket/SSE tunnel; do not
  waste startup time failing those transports before falling back. Keep this
  transport decision centralized;
  do not fix local realtime failures by weakening browser TLS/CORS policy.
- **Route-local first-paint packages.** FullCalendar on Appointments and
  drag/drop/Kanban runtime in Recruitment remain feature-scoped rather than
  global. Optimize them only if the post-shared-baseline production measurement
  shows they are still material. A primary first-paint calendar is not made
  faster simply by wrapping it in `dynamic()` and mounting it immediately.
- **Interaction metadata on tenant management.** Tenant entitlement-module data
  is currently useful only when create/edit is entered and may later be fetched
  or prefetched on user intent. This is route-local work and must preserve the
  editor's complete entitlement defaults; do not defer the request by allowing a
  form to initialize against an empty catalog.

These items are accepted follow-up optimizations, not unresolved causes of the
cross-route duplicate-request and shared-bundle problems fixed above. Re-open
them only with a production measurement or a concrete user-visible latency
trace.

### Route and entitlement ownership baseline

- `/attendance-trends` is owned by HR `analytics`; prefix matching must not
  classify it as `attendance`.
- `/administration/crystal-reports` is owned by the frontend Reporting module
  and the server Reporting module. It must not be classified under HR
  `analytics`; authorization still uses the server's `CrystalReports:*`
  permission catalog.
- Sidebar module filtering and route authorization use the same module-access
  predicate. Permission filtering must preserve leaf navigation items rather than
  converting them into empty containers that the module filter removes.
- Route prefixes, launcher presentation, entry candidates, permissions metadata,
  navigation metadata, dependencies, and lazy translation namespaces belong to
  the frontend module definition in `src/modules/<module>/moduleDefinition.tsx`.
- HR business navigation is authored in `src/modules/hr/navigation/*.tsx` and
  exposed through `hrModuleDefinition.navigation`; the shell consumes that
  public definition instead of keeping a second business-navigation registry.
  Submodule menus derive their links from the same definitions and use the
  longest matching route prefix. Neutral navigation types and factories live
  under `src/shared/components/layout/navigation`; the shell only keeps a
  compatibility re-export for moved icons. `src/app/(main)/navigationConfig.test.tsx`
  is the integration coverage for this composition.
- Server `/modules/accessible` remains authoritative for purchased/enabled
  modules and user permission filtering. The frontend registry only intersects
  those server results with capabilities present in the current build.

### API boundary and contract rules

- Browser code calls same-origin `/api` routes through feature-owned services;
  App Router handlers are the only BFF boundary.
- Backend URLs are canonical origins. Runtime overrides are opt-in and exact
  allowlist matches; production defaults keep the override disabled.
- File paths use URL encoded stored filenames and the server scanner's accepted
  extension/MIME pairs. Do not add a client format without updating the API
  contract and its review evidence.
- Problem Details fields (`type`, `title`, `status`, `detail`, `code`, and
  `traceId`) are preserved for feature error handling. Field validation errors
  remain separate from machine error codes.
- `npm run check:architecture` rejects direct HTTP calls from TSX, and
  `npm run check:i18n` scans every non-test TSX/JSX source file and rejects any
  visible literal without translation keys.

## Target Structure

The applied physical structure is:

```text
src/
  app/                         # Next.js App Router only; thin route adapters
  platform/                    # identity, tenancy, entitlements, platform services
  modules/
    hr/                        # HR-owned business capabilities
    accounting/                # Accounting-owned business capabilities
  shell/                       # top bar, sidebar, app/module launch composition
  shared/                      # domain-neutral reusable UI and infrastructure
  lib/                         # low-level integrations
  config/                      # routes, API and environment configuration
  theme/
  types/
```

## Dependency Direction

Allowed direction:

```text
app -> module/platform composition roots, shell, shared, lib, config, theme
shell -> platform public APIs, shared, lib, config, theme
modules -> platform public APIs, shared, lib, config, theme, same-module features
platform -> shared, lib, config, theme
shared -> lib, config, theme
lib -> config and infrastructure dependencies
config -> external/configuration dependencies only
```

Rules:

1. `src/app` contains route adapters, composition registration, metadata, loading, error, and not-found boundaries. Business UI belongs in `src/modules`.
2. Business modules must never import from `src/app` or `src/shell`.
3. Platform must never import business modules. Business-owned registrations call a Platform public contract instead.
4. `src/shared` must never import Platform, Shell, a business module, or route module.
5. Cross-owner imports target deliberate `index.ts` public APIs.
6. Shared services must remain domain-neutral. Business registration belongs to the module that owns it.
7. Do not create imports through a broad root barrel when a domain barrel or direct module import is clearer.
8. New code must not introduce circular dependencies.

## Feature Ownership

- A page component belongs in the feature that owns the business capability.
- Components, hooks, types, services, and utilities used by one feature stay inside that feature.
- Move code to `shared` only when it is reusable across multiple features and contains no business-specific knowledge.
- Dashboard sections belong to the feature represented by their data, not automatically to `home`.
- Reports stay with the domain that owns their data unless they are truly cross-domain reporting infrastructure.

## Reuse-first and behavior-preservation rule

Before creating or replacing UI, search the relevant shared directories and
inspect the existing component's public API, tests, and internal behavior. A
reusable component may contain substantial product logic in addition to visual
styling, including boundary correction, controlled/uncontrolled coordination,
responsive behavior, RTL, accessibility, loading states, and error recovery.

Rules:

1. Reuse an established shared component when it already owns the required
   behavior. A feature configures it through its public props; it does not copy,
   hide, or replace the component with a library default.
2. Preserve existing shared behavior during refactors unless the user or product
   contract explicitly requests a change. Visual similarity is not proof that a
   simpler replacement is equivalent.
3. When a shared capability is missing, first decide whether it is genuinely
   domain-neutral. Extend the shared API only when multiple real consumers need
   the behavior; otherwise compose feature-owned behavior around the shared base.
4. A shared-component change requires focused tests for its behavioral invariants
   and verification of all known consumers. Do not validate only the feature that
   triggered the change.
5. Reuse does not justify moving domain fields, permissions, lifecycle rules,
   filters, or validation into `shared`; those remain feature-owned.

Examples of protected reusable behavior include `MyDataGrid` with `GridFooter`,
`CardViewPagination`, `PageHeader`, the shared card scaffold, form/dialog shells,
and shared loading/error/empty states.

### Form validation safety

- Optional values emitted by text, number, and select controls must use the
  shared primitives in `src/shared/validation/zodFormPrimitives.ts`. Their
  preprocessors normalize blank control values and their inner Zod schemas are
  explicitly optional, so omitted object keys remain optional after transforms.
- Do not model an optional control by transforming a union containing
  `z.undefined()`. With transformed schemas, accepting `undefined` as a value is
  not equivalent to making an object key optional and can produce hidden
  `expected nonoptional` errors.
- Every React Hook Form consumer of `MyForm` must pass errors through
  `toFormErrorMessages()`. This preserves nested array/object paths and makes the
  shared header summary show the same complete error set as the field controls.
- Feature forms should supply translated `errorLabels` for their user-facing
  fields. Unmapped errors remain visible as a technical field path rather than
  being silently omitted.

### Query cache consistency

- The shared QueryClient must keep `refetchOnMount: true`. A mutation or realtime
  event may invalidate a query while its owning screen is unmounted; remounting
  that screen must reconcile the stale cache with the server.
- Every successful mutation invalidates the stable root key for its entity and
  all dependent query families. Cross-feature consumers import those keys/hooks
  through the feature's public API rather than duplicating cache keys.
- A query may opt out of mount refetching only when its data is genuinely static
  for the session and the exception is local, documented, and tested. Never
  disable mount refetching globally to reduce request volume; use `staleTime` for
  that purpose.
- Business-critical cross-feature lookups may use `refetchOnMount: "always"`
  when they must be reconciled on every workflow entry even while technically
  fresh. Fiscal Years uses this policy because Workforce Planning depends on it.

Current examples:

- Geographical reference-data pages live under `src/modules/reference-data/geographical-information`.
- Home dashboard composition lives under `src/modules/hr/home`.
- File listing and media preview live under `src/platform/file-manager`.
- Advanced tools are split by capability into `external-tools`, `localization`, and `track-changes`; reusable code stays inside the owning subfeature unless it is domain-neutral and used elsewhere.
- Notification API access, query state, realtime handling, and UI live under `src/platform/notifications`.
- User-profile API access and query hooks live under `src/platform/auth/profile`.
- Cross-domain report viewers and report API access live under `src/shared/reporting`; domain report pages remain with their owning module feature.
- Fiscal Years live under `src/modules/accounting/fiscal-years`; other modules consume their lookup/query surface through the Accounting public API.
- Generic SignalR connection infrastructure lives under `src/lib/signalr`.
- Reusable content wrapping and sidebar context live under `src/shared`.

## App Router Rules

- Keep route groups organizational, for example `(main)`, `(auth)`, `(analytics)`, `(security)`, and `(platform)`.
- Route groups must not change public URLs unless the URL change is explicitly required.
- Keep `page.tsx` files thin and import a feature page component.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` at the nearest meaningful route boundary.
- Do not duplicate route-level business logic in App Router adapters.
- Keep application routes centralized in `src/config/routes.ts` and use typed routes.

## Naming Rules

- Use lowercase kebab-case for directories: `global-presence`, `file-manager`, `media-viewer`.
- Use PascalCase for React components: `CountriesPage.tsx`, `ContentWrapper.tsx`.
- Name route-level feature components with the `Page` suffix.
- Name hooks with the `use` prefix and camelCase: `useCountryQueries.ts`.
- Name types by domain concept, not generic abbreviations.
- Avoid `My` prefixes for new reusable components. Existing names may be migrated incrementally.
- Use `index.ts` only as a deliberate public API, not as a universal export barrel.

## Required Checks

Before completing a structural change, run:

```powershell
npm.cmd run check:architecture
npm.cmd run type-check
npm.cmd run type-check:strict
npm.cmd run lint -- --quiet
npm.cmd run test:module-generator
npm.cmd test
npm.cmd run build
npm.cmd run measure:build
```

`check:architecture` is implemented in `scripts/check-architecture.mjs` with
ownership declarations in `scripts/module-boundaries.mjs`. It checks static and
literal dynamic dependency direction, target module completeness, declared
cross-owner dependencies, public APIs, import cycles, unsafe
transformed-optional Zod schemas, manual top-level-only `MyForm` error projection,
global disabling of stale-query refetch on mount, and static local `*Form` /
`*Dialog` imports from feature `*Page.tsx` files that would violate the lazy
interaction-boundary policy. Any new exception must be justified in code review
and reflected here.

## Future Change Checklist

- [ ] Start from the feature implementation request, review artifact, and affected generated phase packet.
- [ ] Classify each optional view independently for web/mobile before adding a route or component.
- [ ] Identify the owning module/platform capability before creating files.
- [ ] Inspect existing shared components and tests before creating or replacing UI.
- [ ] Preserve shared behavior and configure it through public props; document any explicit exception.
- [ ] Keep the App Router adapter thin.
- [ ] Keep route entry limited to first-paint UI; dynamically load and conditionally mount interaction-only forms, dialogs, and heavy optional views.
- [ ] Keep heavy providers and runtimes at their nearest real consumer; do not promote date/report/viewer providers to the root for convenience.
- [ ] For auth changes, measure login first paint and post-login transition separately; never prefetch a protected route before the new session is committed.
- [ ] After every material runtime/architecture finding, update this canonical guide with the observed problem, root cause, decision, verification, and any regression-prevention rule before handoff.
- [ ] Keep business code independent from Shell and App Router internals.
- [ ] Confirm shared code has no feature-specific imports.
- [ ] Build optional control schemas from the shared Zod form primitives.
- [ ] Flatten `MyForm` errors through `toFormErrorMessages()` and provide translated field labels.
- [ ] Invalidate stable root/dependency keys after mutations and verify stale inactive data refetches on remount.
- [ ] Use the established lowercase directory and PascalCase component naming.
- [ ] Add or update a feature/module `index.ts` only when a public boundary is needed.
- [ ] Run the architecture, type, lint, test, production build, and `measure:build` checks.
