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
`/finance/ledger-setup/fiscal-years` after this isolation is about `2.78 MiB`, down from the
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
| `/finance/ledger-setup/fiscal-years` | ~2.78 MiB | **2.32 MiB** |
| Largest measured First Load route | ~3.09 MiB | **2.77 MiB** |

The emitted JavaScript set changed from `230` chunks / `23.36 MiB` to `263`
chunks / `24.22 MiB`. That total-on-disk number remains below the `26 MiB`
budget and is not used as a proxy for route startup: the important shared and
per-route first-load measurements decreased substantially while heavyweight
report/PDF runtimes remain isolated from ordinary routes. The largest emitted
chunk remains under the `12 MiB` budget and the largest route remains well under
the `4.5 MiB` First Load budget.

The Phase 11 budget baseline was refreshed on 2026-09-18 after the controlled
dependency work. The current build emits `270` chunks / `24.39 MiB`; the largest
chunk is `11.06 MiB`. The protected shared First Load intersection is `26` chunks
/ `1.60 MiB` across `52` protected routes, and the largest measured route is
`/appointments` at `2.33 MiB`.

`measure:build` now enforces route-class budgets in addition to the original
global backstops: error fallback `1.10 MiB`, public auth `2.15 MiB`, protected
shell/launcher `2.25 MiB`, business application `2.55 MiB`, heavy feature entry
`2.75 MiB`, plus a `1.85 MiB` protected-shared intersection cap. The detailed
baseline and class definitions live in `performance-baseline.md`. Any budget
increase requires an explicit product/architecture justification and an updated
baseline; new routes default to the business-application class until deliberately
classified otherwise.

Final verification for this closure includes architecture check, normal and
strict TypeScript, full quiet lint, module-generator self-test, full Vitest,
documentation generation/check, production build, bundle measurement, focused
backend summary tests, and the post-build runtime smoke gate. Future page-loading
work should be evidence-driven feature tuning rather than reopening these shared
bootstrap decisions.

The authenticated browser smoke used the built-in development Admin flow and
verified `login -> dashboard -> /finance/ledger-setup/fiscal-years` with real client
hydration. The final run had no console/runtime errors, session and realtime-token
requests returned `200`, and SignalR negotiated through the same-origin BFF and
started directly on Long Polling. The super-admin smoke separately verified
`login -> / -> /super-admin -> tenant dashboard summary`; the warmed
`/super-admin` document completed in about `0.19 s` and the dedicated summary
request in about `0.29 s` on the local development stack. Treat the first dev
compile separately from these warmed runtime timings.

On 2026-09-17 an additional development-only Instant Navigation failure was
reproduced after a long-running Turbopack dev session had absorbed several shell
and instrumentation edits. A normal authenticated-shaped `/` request returned
`200`, while the same route through Next's Instant Navigation testing path
returned `500` with `Could not validate instant ... target segment was prevented
from rendering`. The current source was then verified against Next `16.3.5`'s
local Instant Navigation implementation: that wrapper is emitted when validation
cannot reach the expected target boundary because an error was thrown outside it.
No current shell component required an `instant = false` exemption. After a clean
restart of the ERPSYSTEM `next dev` process, both the normal `/` request and the
Instant Navigation testing request returned `200` (the latter with postponed PPR
state), and the authenticated browser resumed its session/dashboard requests
without a server render error. Type-check and the architecture gate also passed.

**Development prevention rule.** When an Instant Navigation validation error
appears immediately after structural App Router, provider, instrumentation, or
Cache Components edits, first reproduce the route in both normal and Instant
Navigation validation modes. If current source is structurally valid but only the
long-running Turbopack process fails, restart that project's dev server before
changing route semantics. Do not hide stale HMR/validation state with
`instant = false` or by disabling Cache Components. Also remember that Next's
Navigation Inspector cookie is scoped to `localhost`, not to a port; when several
local Next projects are in use, close the Inspector or clear its testing cookie
when switching projects if validation behavior is unexpectedly shared.

The organizational-structure index later exposed a separate deterministic case:
`/basic-data/organizational-structure` existed only to call `redirect()` from its
Server Component page. In Next `16.3.5`, `redirect()` throws `NEXT_REDIRECT` and
terminates rendering of that segment; Instant Navigation validation can therefore
report that the target segment was prevented from rendering even though the
redirect is intentional. Entry-point redirects that do not need render-time data
now belong in `next.config.ts` so they execute before rendering. Do not keep an
otherwise empty App Router page whose only job is to throw a redirect, and do not
silence this case with `instant = false`. The obsolete `/organizational-structure/manage`
alias was removed instead of preserving an unused compatibility route.

The same route also exposed a real development SSR failure hidden behind the
Instant Navigation wrapper. The stack moved through several eagerly evaluated
barrels as they were narrowed: `feedback/states` pulled `EmptyChartState`, which
pulled the complete charts/Recharts graph; the organizational multi-view loaded a
card-only header and MUI Grid even while the active view was Grid; and the shared
`MyDataGrid` shell still evaluated the `@mui/x-data-grid` toolbar graph on the
server even though the actual DataGrid had already been marked `ssr: false`.
Clean Turbopack boots overflowed during these module evaluations and Next fell
back to client rendering.

The fix follows the runtime boundaries already intended by the UI: low-level
shared components use narrow imports, the card-only header is loaded only with its
view, the cards layout uses CSS grid instead of pulling MUI Grid into the default
route, and the organizational DataGrid shell is client-only together with its
MUI X runtime. A clean dev restart now renders `/basic-data/organizational-structure/branches`
without `RangeError` or the client-render fallback. Shared low-level components
must keep heavyweight optional runtimes out of broad barrels, and a browser-only
widget must move its whole runtime shell behind the client boundary rather than
leaving toolbar/hooks in SSR while only its innermost widget is client-only.

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

### Browser E2E and CI testing contract

Phase 8 closed on 2026-09-18 with Playwright as the browser-level owner and
Vitest remaining the unit/integration owner. `vitest.config.ts` must exclude
`e2e/**`; do not rename or duplicate Playwright scenarios merely to make Vitest
ignore them.

The Playwright upstream is deterministic and local to the test process. It models
multi-tenant/multi-company authentication, permissions, session refresh/expiry,
company-specific data and bounded feature endpoints while all browser traffic
still passes through the real Next BFF and its HttpOnly cookie/session behavior.
Browser CI must not depend on production credentials, a persistent developer
database or customer data.

`playwright.config.ts` keeps the mutable fixture serial (`workers: 1`) until each
worker owns an independent backend state. CI runs the already-built application
through `next start`; local development may reuse the development server. Desktop
Chromium owns the main suite and the focused mobile project owns tests tagged
`@mobile`. Trace, screenshot and video are retained on failure and CI uploads the
Playwright report/test-results artifacts.

The required browser confidence model is:

- auth: anonymous redirect, Demo Login, tenant/company selection, logout,
  successful refresh, terminal expiry and auth-service `503`;
- authorization: denied `403` and allowed super-admin boundary;
- company context: verified switch plus stale-company data isolation;
- business: Countries search/validation/create/update/API failure/unsaved guard,
  Fiscal Years create/update, and Appointments/HR ownership-boundary smoke;
- runtime: Back/Forward, hard refresh, App Router `404`, live RTL switch and
  same-document PPR/Instant Navigation;
- mobile: login controls plus authenticated launcher/company context.

Prefer accessible roles, names and labels over CSS implementation selectors. A
PPR/transition tree can temporarily contain hidden and visible copies of the same
semantic heading; when that is expected, constrain the locator to the visible
semantic element instead of using `.first()` as a brittle ordering assumption.
Only add a test ID when the user-visible semantics cannot uniquely express the
domain action.

Final Phase 8 closure evidence was production build `68/68`, Vitest `155/155`
files / `544/544` tests, and Playwright `21/21` in CI mode against `next start`.
Web CI installs Chromium after the build, executes `npm run test:e2e`, and uploads
failure artifacts. New auth/company/navigation/shared-form regressions must extend
this suite rather than relying on manual browser checks.

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

## Observability and production diagnostics

The first production-observability foundation was applied on 2026-09-17.

**Observed problem.** The API already had OpenTelemetry and an
`X-Correlation-ID` contract, while the Next.js BFF only copied a backend
correlation header on the response. The web request, BFF operation and backend
call therefore did not have one explicit BFF-owned correlation boundary. SignalR
also logged raw library error strings and, after automatic reconnect was
exhausted, retried on a fixed five-second timer indefinitely. A WebSocket-style
`access_token` query value could additionally reach a backend URL even though the
same-origin BFF intentionally uses HTTP Long Polling rather than WebSocket
tunnelling.

**Decision.** Next.js server instrumentation uses OpenTelemetry with service name
`ErpSystem.Web` and service namespace `ErpSystem` when `WEB_OTEL_ENABLED=true`.
Registration is opt-in so ordinary local/development servers do not create
exporter noise. When telemetry is explicitly enabled in self-hosted production,
configuration must name an OTLP endpoint and sampler; the application does not
accept `@vercel/otel`'s implicit localhost exporter or implicit 100% sampling as a
production configuration. Vercel-managed telemetry may own the exporter.
Distributed trace propagation is restricted to configured ERP backend origins.
Each generic API or SignalR BFF
request creates a server-owned correlation ID, forwards it as
`X-Correlation-ID`, returns it to the browser, and adds only safe route/method/
status/failure-classification attributes to ERP BFF spans. Browser-supplied
correlation IDs are not the trusted BFF operation identity. SignalR diagnostic
logs contain classifications only, never raw transport messages, and duplicate
classifications are suppressed for a bounded window.

**Implementation impact.** `src/instrumentation.ts` conditionally registers
`@vercel/otel` and marks `onRequestError` spans failed without recording raw
exception messages.
`src/lib/observability/` owns correlation and BFF tracing primitives. The API and
hub Route Handlers apply the shared correlation contract and traced backend-call
wrapper. SignalR manual restart delay progresses through 5, 15, 30 and 60 seconds
and remains capped at 60 seconds; a successful connection or explicit online/
session transition resets the backoff. The hub proxy moves a query-string
`access_token` into the Authorization header and removes it from the backend URL
before tracing/fetching. `otelEnvironment.ts` validates the installed
`@vercel/otel` runtime contract before registration: enabled self-hosted production
requires an explicit OTLP endpoint and sampler, endpoint URLs must be HTTP(S)
without embedded credentials/query/fragment, the supported trace protocols are
`http/protobuf` and `http/json`, and ratio sampling must be from `0` through `1`.
It also rejects a browser-telemetry/server-export mismatch, `OTEL_SDK_DISABLED`
while the application switch is enabled, service-name overrides away from
`ErpSystem.Web`, and propagator configuration that drops W3C `tracecontext`.
Collector credentials remain secret-backed `OTEL_EXPORTER_OTLP_HEADERS` values
and are never copied into application diagnostics.

Tenant/company enrichment follows the authentication trust boundary. Only a route
that has already received validated `SessionClaims` from `resolveSession()` may
call `annotateActiveVerifiedSessionScope`; current examples are the session and
realtime-token routes. Those spans use the stable `erp.tenant.id` and
`erp.company.id` attributes. The catch-all API/SignalR proxies must not trust a
browser-supplied tenant/company header, decode an unverified bearer payload for
telemetry, or add a separate session-validation request solely to gain scope tags.
That would either make telemetry forgeable or add a serial request to every BFF
call. Deeper business traces already execute behind backend authentication and are
the correct place for any additional scope enrichment required by the API.

### Client errors, navigation and Web Vitals

**Observed problem.** `global-error.tsx` and the shared `RouteError` already gave
users recovery UI, but browser failures stopped there. There was no early global
error/unhandled-rejection observer, no Web Vitals reporter, and no App Router
navigation timing export. Sending raw browser errors or URLs directly to a
Collector would also risk leaking reset/invitation tokens, query parameters,
stack-frame URLs or other user-controlled text.

**Decision.** Client observability is opt-in through
`NEXT_PUBLIC_WEB_TELEMETRY_ENABLED=true` and uses a same-origin
`/api/telemetry/client` ingestion route. The browser sends only a small allowlisted
contract: error source plus a bounded error classification and safe Next digest,
Web Vital name/value/delta/rating/navigation type, or App Router navigation type
plus route-commit duration. Session revalidation and SignalR diagnostics reuse the
same endpoint with bounded failure/phase classifications and an optional bounded
suppressed-repeat count. They never send raw transport/session error text. The
client contract never sends error messages, stacks, current/target URLs, query
strings, Web Vital IDs, tenant/company IDs, cookies or bearer tokens. The
telemetry fetch explicitly omits credentials and referrer data. The server
normalizes the payload again, caps it at 2 KiB, drops it when `WEB_OTEL_ENABLED` is
off, and records the accepted event as an `ErpSystem.Web.ClientTelemetry` span.

**Implementation impact.** `src/instrumentation-client.ts` installs the early
`error` and `unhandledrejection` observers and starts App Router transition timing.
The isolated `ClientObservability` client component uses `useReportWebVitals` and
the committed pathname/search-parameter state to close navigation timing without
turning the root layout into a client boundary. `global-error.tsx` and the shared
`RouteError` explicitly report their caught errors because React error boundaries
do not guarantee a matching global browser error event. The browser/server payload
contract lives under `src/lib/observability/`, and the exact telemetry Route
Handler is intentionally separate from the generic authenticated API proxy.

**Verification.** Focused tests cover allowlist normalization, rejection of invalid
performance/diagnostic payloads, disabled telemetry, credential/referrer omission,
safe error/session/SignalR classification, Web Vitals/navigation reporting,
server-disabled dropping, ingestion normalization, content-type enforcement and
the body-size cap. Normal TypeScript remains a required gate for the integrated
root/layout convention.

**Prevention rule.** Do not add raw `Error.message`, stack traces, filenames,
browser URLs, query parameters, arbitrary error names, Web Vital IDs or session
credentials to client telemetry. New client signals must extend the shared
allowlisted contract and be normalized on both sides of the same-origin boundary.
Client telemetry must stay fail-open: an exporter or ingestion failure must never
block navigation, rendering, recovery UI or business requests.

### Production collector, dashboards and alerts

The application defines the signals and verification contract while the selected
hosting/observability platform owns Collector topology, storage/retention,
dashboard resources, SLO thresholds and alert delivery destinations. This keeps
provider-specific infrastructure out of the frontend runtime while still making
production readiness testable.

The minimum production view must expose request/error/latency for
`ErpSystem.Web` by stable route, BFF backend latency/status by stable route and
channel, transport timeout/network failure classifications, and the matching
`ErpSystem.Api` trace path. Client navigation/Web Vitals and global client errors
arrive through the same-origin client telemetry route; SignalR failure/reconnect
signals belong on the same operational view. Tenant/company IDs are trace-drilldown attributes;
they must not become dashboard or alert grouping labels because that creates
unbounded cardinality and can expose customer identifiers to broad operational
channels.

Production alerts must cover sustained web 5xx errors, BFF 502/503/504 or timeout
growth, latency breaching the environment's approved SLO, significant client
error/Web-Vitals regression when those signals are enabled, and sustained
realtime connection/reconnect failure. The deployment owner selects numerical
thresholds only after a staging/production traffic baseline exists. Alert payloads
use service/environment/stable-route/failure-class labels and correlation/trace
links; they do not contain bearer tokens, cookies, request bodies, raw exception
messages, tenant names or user PII.

Before an external production launch with `WEB_OTEL_ENABLED=true`, run a staging
smoke through the real proxy and Collector. Confirm that `ErpSystem.Web` arrives
with the expected service namespace, one controlled BFF call returns a correlation
ID and produces a web -> BFF -> `ErpSystem.Api` distributed trace, handled
timeout/5xx cases retain safe status/failure classification, and exported
attributes contain no token/query/payload secrets. Exercise an already-verified
session route to confirm tenant/company scope appears only from validated server
session data. Finally verify the required dashboards are populated and route a
controlled test condition through every production alert destination. These are
deployment release gates; source tests cannot prove Collector reachability,
retention, dashboard provisioning or alert delivery.

**Verification.** Focused coverage owns correlation generation/forwarding,
caller-correlation rejection, token-query removal, SignalR failure
classification, warning suppression, capped backoff, and production OpenTelemetry
configuration validation. Normal/strict TypeScript, architecture, lint and the
documentation generation check remain required before the Phase 6 slice is handed
off; the Collector/dashboard/alert smoke above remains a production-deployment
gate.

**Prevention rule.** Never put bearer tokens, cookie values, raw SignalR error
strings, query-string secrets or unbounded user-controlled identifiers into logs
or custom telemetry attributes. Catch-all BFF spans use stable route patterns,
not entity-specific paths. New BFF calls must preserve trace context only to trusted
ERP backend origins and must expose a safe correlation identifier on handled
failures as well as successful responses. Realtime retry logic must use bounded
backoff and classified/throttled diagnostics rather than tight retry/log loops.
Never add a BFF session lookup purely for telemetry enrichment and never recover
tenant/company scope from an unverified browser header or token payload. If the
runtime exporter changes, update `otelEnvironment.ts`, `.env.example`, this guide
and the deployment smoke contract together so permissive library fallbacks cannot
silently become production policy.

## Browser security and CSP rollout

The Phase 7 browser-security rollout started on 2026-09-17 with a CSP
**Report-Only** baseline and is now enforced. The pre-existing browser headers
already provided `nosniff`, strict referrer handling, restricted
camera/microphone/geolocation, same-origin framing and HSTS, but there had been no
Content Security Policy capable of constraining browser resource origins.

**Rendering constraint.** The application intentionally uses Next `16.3.5` Cache
Components and Partial Prerendering. The installed Next CSP guide states that a
per-request nonce forces dynamic rendering and is incompatible with PPR because
the prerendered shell cannot receive the request nonce. Do not replace the Phase 3
static/PPR runtime architecture with nonce-based rendering merely to satisfy CSP.
Next's SRI-based CSP support remains experimental in this version and is not a
production dependency until it has been evaluated independently against the real
build and runtime.

**Decision.** `src/config/browserSecurity.ts` owns one generated CSP contract and
`next.config.ts` emits it as enforced `Content-Security-Policy`. The policy does
not use broad host wildcards. Its current source inventory is evidence-driven:

- Google Identity Services uses the documented
  `https://accounts.google.com/gsi/` parent plus its exact client script and style
  URLs;
- Syncfusion PDF viewer resource files are currently loaded from
  `https://cdn.syncfusion.com` by the file-manager PDF viewer;
- the configured report origin is admitted to `connect-src` and `frame-src`
  because reports are fetched and/or framed there;
- a configured production SignalR hub contributes only its validated HTTP(S)
  origin and corresponding WS(S) origin, while development continues to use the
  same-origin hub BFF and permits local HMR WebSocket traffic;
- report/file media that is deliberately created in-browser accounts for the
  required `blob:` / `data:` sources;
- application fonts are packaged through `@fontsource`, so Google Fonts origins
  are not opened by default.

The static/PPR-compatible policy currently retains `script-src 'unsafe-inline'`
and `style-src 'unsafe-inline'` because the application/Next runtime contains
inline bootstrap/script/style behavior and MUI/Emotion emits runtime styles.
`script-src-attr 'none'` still rejects inline HTML event-handler attributes. These
allowances are explicit security tradeoffs, not permission to add arbitrary new
inline code. A future evidence-backed hardening pass may externalize app-authored
inline bootstrap code or adopt a stable hash/SRI strategy if that can remove a
script allowance without sacrificing PPR; experimental SRI is not a current
production dependency.

Google login currently uses popup UX, so the global browser headers also use
`Cross-Origin-Opener-Policy: same-origin-allow-popups`. This preserves popup
communication for Google Identity Services while retaining same-origin opener
isolation for ordinary navigation. Do not add `Cross-Origin-Embedder-Policy`
globally without a separate compatibility review because third-party identity,
reporting and viewer assets are legitimate cross-origin consumers.

### CSP violation collection and privacy

`/api/security/csp-report` accepts both legacy `application/csp-report` payloads
and Reporting API `application/reports+json` batches. The endpoint is deliberately
separate from the generic authenticated API proxy, rejects explicit cross-site
mutations, rejects unsupported content types, caps the request at 16 KiB and
normalizes every accepted record before diagnostics are emitted.

The normalized record contains only the effective directive, a bounded blocked
source classification, report/enforce disposition, optional HTTP status and—only
for an external network source—the normalized origin. Document URLs, source-file
paths, referrers, CSP samples, full blocked URLs, path/query/fragment data and
credentials are discarded. Same-origin violations never retain the page/resource
path. This prevents reset/invitation tokens or business identifiers in URLs from
turning browser-security diagnostics into a second data-leak path.

Legacy `report-uri /api/security/csp-report` remains available after enforcement.
Modern `report-to` is emitted only when
`WEB_PUBLIC_ORIGIN=https://...` is configured, because `Reporting-Endpoints`
requires a secure absolute endpoint URI. A missing deployment origin must not
produce a dangling Reporting API configuration.

### Enforced state and release smoke

The shipped path now enforces `Content-Security-Policy`; there is no default mode
switch that silently leaves Production in Report-Only. A Chrome HTTPS smoke loaded
the login surface, Next development runtime, MUI/Emotion styling and Google GIS
client under enforcement without an observed CSP block. An explicit enforced CSP
report returned `204` and the server diagnostic retained only the normalized
directive, external origin, disposition and status—not the supplied private path,
query or token-like value.

The production runtime was also started from the optimized build. `/login`
returned `200` with `Content-Security-Policy`, no
`Content-Security-Policy-Report-Only`, no production `'unsafe-eval'`, no broad
development `ws:`/`wss:` schemes, and `upgrade-insecure-requests`. The `68/68`
page production build retained application routes as PPR (`◐`) while the CSP report
Route Handler remained dynamic (`ƒ`). Focused browser-security coverage passes
`12/12`; the full frontend suite passes `155/155` files and `542/542` tests;
normal/strict TypeScript, architecture, i18n, lint, module-generator, dependency
audit and configured bundle budgets are green.

Source inspection accounts for Google popup auth, production SignalR HTTP/WS
origins, blob/report frames, Syncfusion PDF resources, file/media `blob:`/`data:`,
same-origin Hangfire and configured public-API external frames. A local Demo Login
attempt did not establish an authenticated session in the current environment, so
real protected deployment data was not fabricated merely to claim a runtime pass.
Before an external Production launch, exercise the real authenticated Google popup,
SignalR connection, report/PDF viewers, file/media previews, Hangfire and configured
external-tool frames with representative environment data. This is a release smoke
gate rather than a reason to keep the source CSP in Report-Only. Any confirmed
violation must be classified and reflected in the bounded central source inventory
and regression tests. Demo Login remains intentionally available in both
development and Production under the current product policy. Do not remove or hide
it as part of Production readiness unless a future explicit product decision changes
that requirement.

**Prevention rule.** Do not solve a CSP violation by adding `*`, a broad scheme or
an unrelated third-party origin. Do not add raw CSP reports to logs or telemetry.
Update the centralized policy, its normalization tests, this guide and the Phase 7
inventory together whenever a new browser integration genuinely requires a new
source.

### CI Definition of Done and accessibility/browser regression policy

Phase 12 consolidates the frontend's deterministic release contract. The web CI
installs from the lockfile, audits production dependencies, enforces architecture,
i18n, lint and the single strict TypeScript policy, runs critical-infrastructure
coverage thresholds with an uploaded report, verifies the module generator, builds
the production application, enforces the Phase 11 bundle budgets, runs Playwright
against `next start`, and verifies generated documentation.

The browser suite now includes automated WCAG A/AA smoke through
`@axe-core/playwright` for the public login route, authenticated application shell,
a representative Countries list/create interaction and mobile login. The first
baseline run exposed real shared defects: `LanguageSelector` rendered a visual MUI
label without a programmatic Select association; `ThemeToggler` and responsive
brand links could become icon-only controls without accessible names; sidebar
section markup used a semantic list whose direct children were not list items; and
the shared `FormHeader` subtitle reduced an already-secondary foreground with
additional opacity until contrast fell below the automated WCAG threshold. Fix
these problems in the shared owner rather than excluding the axe rule or copying
route-local patches. When a modal interaction is tested, scan the underlying page
before opening it, then scope the interaction scan to the active dialog so hidden
background content is not confused with the modal surface.

Browser-security regression coverage also reaches the actual production response:
the Playwright smoke asserts an enforced `Content-Security-Policy`, no Report-Only
header, no production `'unsafe-eval'`, and the core hardening headers configured by
Next. CI may retry a failed browser test to preserve diagnostic traces, but
`failOnFlakyTests` is enabled there: a pass on retry does not make the release gate
green.

That policy immediately exposed a formerly hidden 404 smoke flake. The test used
`/login/e2e-missing-route`, while `isPublicRoute()` historically treated every
auth-route prefix as public. The request could therefore enter the protected
catch-all layout without a session and sit on its bootstrap loader before the
not-found surface completed. Public auth pages are now exact matches; only genuine
static prefix families such as `/.well-known/*` and `/_next/*` use prefix matching.
Unknown application routes remain protected by default, and the 404 browser smoke
establishes an authenticated context before exercising the catch-all. Do not make
an arbitrary path public merely to simplify a 404 test.

The same fail-on-flaky policy also exposed a server-search timing race on the
Countries smoke. Shared list state debounces the search term and React Query keeps
`placeholderData` from the previous result while the next BFF request is in flight,
so asserting that the old row disappeared immediately after `fill()` could pass or
fail depending on render/network timing. Browser tests for debounced server filters
must synchronize with the matching BFF response (or another deterministic state
transition) before asserting the filtered rows; do not paper over the race with
arbitrary sleeps or disabled retries.

Deterministic PR CI is intentionally separate from deployment-only integration
smoke. Real Collector/dashboard/alert delivery, authenticated Google popup,
deployment SignalR, report/PDF/file viewers, Hangfire, configured external-frame
integrations require the target environment, credentials or representative data and
remain staging/Production release gates. Demo Login is intentionally allowed in
Production and is not part of the release-removal gate under the current product
policy.
Web Vitals and user-perceived latency should likewise be driven by stable browser
or production telemetry rather than machine-specific CI timing thresholds.

## App Router Rules

- Keep route groups organizational, for example `(main)`, `(auth)`, `(analytics)`, `(security)`, and `(platform)`.
- Route groups must not change public URLs unless the URL change is explicitly required.
- Keep `page.tsx` files thin and import a feature page component.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` at the nearest meaningful route boundary.
- Do not duplicate route-level business logic in App Router adapters.
- Keep application routes centralized in `src/config/routes.ts` and use typed routes.

### Phase 13 architecture governance manifest

**Observed problem.** Ownership and route-group enforcement existed in code, but
an engineer still had to inspect `module-boundaries.mjs` plus the App Router tree
to reconstruct the current ownership map. Prose examples could also drift from
the filesystem without a dedicated freshness check.

**Decision.** `scripts/module-boundaries.mjs` owns the small set of explicit
`documentedRouteOwnership` contracts, while
`scripts/architecture-governance.mjs` generates
`documentation/web-next/architecture/frontend-architecture-manifest.md` from the
live policy and protected App Router pages. `check:architecture` verifies those
canonical routes still belong to their declared bounded context, and
`check:governance` verifies the generated manifest is byte-current.

The same governance check reads each registered business module's
`documentation/modules/<module>/module.json`. Its `webNextSurface` must be
`active` and must point back to the same owner, `src/modules/<owner>` root,
`moduleDefinition.tsx`, and an existing module Web README. The generated manifest
includes that module-documentation parity table. Module package prose may add
context, but the machine-readable manifest is the freshness contract.

**Regression rule.** Do not hand-edit the generated architecture manifest. For an
intentional route/ownership move, change the owning policy and source tree,
regenerate with `npm run generate:architecture-manifest`, review the manifest diff,
update the owning module package when its Web status/owner changes, then run
`npm run check`. CI runs the governance check independently as part of the
Definition of Done.

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
npm.cmd run check:governance
npm.cmd run type-check
npm.cmd run lint -- --quiet
npm.cmd run test:module-generator
npm.cmd run test:coverage
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
interaction-boundary policy. It also rejects chained `as unknown as` and silent
`@ts-ignore`/`@ts-nocheck` escape hatches. The hardened auth/session/realtime/
profile/tenant-management boundary files additionally reject trusted non-`unknown`
API response generics and direct `response.json()` casts. Any new exception must
be justified in code review and reflected here.

### Strict TypeScript and escape-hatch policy

**Observed problem.** The frontend historically kept a relaxed `tsconfig.json`
beside a second `tsconfig.strict.json`. Although both gates had become green, the
split left the editor/default `tsc` policy weaker than the CI-only strict policy
and encouraged local casts such as `as unknown as` to bridge mismatched contracts.

**Root cause.** Strictness was introduced as a migration check instead of being
promoted after the migration succeeded. A second configuration also made it
possible for test/config files outside the narrow strict include set to avoid the
same policy used by production source.

**Decision.** `tsconfig.json` is now the single TypeScript authority with
`strict: true` and `noImplicitAny: true`; `npm run type-check` checks the complete
project selected by that configuration. The duplicate strict config/script/CI
step is removed. ESLint treats explicit `any` and banned TypeScript comments as
errors. Chained `as unknown as` casts are forbidden by the architecture gate;
untrusted boundaries must narrow, parse, or adapt `unknown` instead.

Applied examples include a runtime-narrowed Navigation API adapter, a finite MUI
palette-token contract for shared text-field counters, a typed Zod/RHF Job
Description decision schema, removal of the Address Types query double cast, and
runtime parsers for session, realtime token/JWT, profile, tenant-management and
tenant-admin response contracts.

**Verification.** The full project passes the canonical strict `npm run
type-check` and architecture checks. The Phase 9 covered suite passes `162/162`
files and `565/565` tests. Its explicit critical-infrastructure baseline is
`80.81%` statements, `76.35%` branches, `81.54%` functions and `83.18%` lines;
CI floors are `79%`, `74%`, `80%` and `82%` respectively and the LCOV/JSON report
is uploaded by the web workflow. Production build, bundle, browser E2E and
documentation-generation checks remain part of the normal final handoff gate.

**Prevention rule.** Do not add a relaxed secondary TypeScript config, explicit
`any`, `@ts-ignore`/`@ts-nocheck`, or chained `as unknown as` to make a library/API
boundary compile. Model the real contract, validate `unknown` at untrusted runtime
boundaries, or add a narrow typed adapter. Prefer one project-wide strict policy
over parallel migration configurations. At security-critical and shared platform
response boundaries, generic TypeScript return types are not runtime validation:
receive untrusted successful data as `unknown` and parse/narrow it before use.
Coverage thresholds apply to the explicit critical-infrastructure inventory, not
to every rendered component; extend that inventory when new foundation behavior
becomes critical rather than writing metric-only tests.

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
