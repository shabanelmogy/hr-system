# Angular role home — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S2-A3 — Role-aware home and tenant summary |
| Child Feature ID | angular-role-home |
| Child feature name | Angular role-aware home and tenant summary |
| Owner | Platform Tenants / Shell Web |
| Depends on | angular-module-navigation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact S2-A3 after current Phase 00 21-source manifest, 253 recipes and planning pass; G0-G3 fixed; remaining G4 hosted-only |

## 1. Child boundary and outcome

Current Next DashboardLanding sends normal users to module discovery and global super_admin to TenantDashboardPage. Port those read journeys using the existing server summary. Six metrics, account capacity, subscription counts, recent tenants and subscriptions expiring within 30 days display real data. No new business entity/write/lifecycle, made-up values or all-tenant client aggregation. Tenant/Geography management actions are Deferred FOLLOW-015 until actual Angular routes exist; do not render dead actions.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.home.landing | Web | /home | Open correct workspace | Role-based entry | P-007 | Existing module launcher | web-next/src/shell/dashboard/DashboardLanding.tsx | Implemented | Cards Required; other views Excluded | Restore/loading; anonymous redirect; no draft | Online authoritative | Existing catalog fixtures only | Trusted session, existing tenant-workspace policy | Same launcher EN/AR/compact/wide | URL alias redirects to /apps; business children remain FOLLOW-015 |
| platform.home.landing | Mobile | current home | Retain native entry | Existing native cards | P-007 | Existing native home | mobile-react/src/shell/home/presentation/screens/HomeScreen.tsx | Adapted | New views Excluded | Native retained | Existing native policy | No new data | Existing native policies | Native ergonomics/RTL | No native rewrite |
| platform.tenants.dashboard | Web | /home (global), /super-admin | Review current platform capacity/subscriptions | Read-only KPI/summary lists | P-010 | Shared metric/panel/progress/status | web-next/src/platform/tenants/TenantDashboardPage.tsx | Implemented | Cards/summary lists and embedded subscription distribution Required; standalone Grid/Table/Tree/Chart/Report/Import/Export Excluded; drill-down Deferred FOLLOW-015 | Loading/error/retry/forbidden/zero/empty; no draft/conflict | Online authoritative snapshot | Synthetic summary fixtures only | Exact super_admin; server controller authoritative | 6 desktop KPIs/compact scroll, EN/AR modes, internal list scroll | Actions to unported management pages deliberately absent |
| platform.tenants.dashboard | Mobile | existing super-admin-dashboard | Retain existing native summary | Existing native KPI cards | P-010 | Existing AppMetricCard/AppCard | mobile-react/src/platform/tenants/presentation/screens/TenantDashboardScreen.tsx | Adapted | New views Excluded; existing native summary retained | Native states retained | Existing native policy | No new data | Existing native route/server policy | Native touch/RTL | Existing native getAll aggregation retained; no new native implementation |

## 3. Closest existing reference

Reviewed web-next/src/shell/dashboard/DashboardLanding.tsx; platform/tenants/TenantDashboardPage.tsx, types.ts, tenantApi.ts, components/TenantStatusChips.tsx; shared MetricCard and SurfaceCard/ContentWrapper; mobile-react/src/platform/tenants/presentation/screens/TenantDashboardScreen.tsx. Native currently summarizes its existing getAll query; retained behavior is Adapted, not copied as a new Angular client aggregate.

## 4. Reuse and composition contract

Reuse current application frame/page header/surface/feedback, module discovery and scoped HTTP state pattern. Extend Shared SurfaceCard generically with optional accent/icon/fill/compact; add generic MetricCard, ProgressMeter and StatusBadge only for the audited gap. Shared receives labels/values and emits generic actions, no auth/business types. Platform Tenants owns schema/service/scoped summary state and dashboard composition; Shell owns role landing.

## 5. Screen and workspace contract

Normal /home redirects to the existing /apps launcher after trusted session restore. Global /home and /super-admin show the actual dashboard with current header/sidebar. Direct ordinary-user /super-admin renders Forbidden and zero summary requests. Global role does not enter tenant apps. No management/CRUD route placeholder is treated as implemented. Snapshot and lists are read-only; no drill-down until the target owner is ported.

## 6. Typed transport and server criteria

Existing credentialed HTTPS GET /api/v1/tenants/getDashboardSummary; controller requires super_admin. Strictly validate finite integer counts, known status keys, list identities and parseable dates. Server summary filters active tenant lifecycle; totals are current snapshot, expiring window is server now through +30 days, recent/expiring lists are bounded to 8. No tenantId/client-supplied scope, bearer tokens or browser storage. Native/API/schema unchanged.

## 7. Create, edit, view, and lifecycle contract

Read-only current summary, explicitly no tenant create/edit/archive/restore/entitlement mutation. Existing server owns capacity/status/effective expiry rules. View all returned sections and empty states. No domain property transition, migration or new mock generator; clearly synthetic read fixtures cover realistic counts/statuses/long names/dates.

## 8. UX states, permissions, offline, and mock data

Finite accessible loading, error/retry and Forbidden. Empty lists/zero counts show actual zeros and bilingual current empty messages; no placeholder metrics while loading. No dirty draft/conflict/write uncertainty. Online authoritative summary, no offline authorization/cache. Existing native policy retained.

## 9. Concurrency, transactions, and consistency

One scoped summary subscription per dashboard component; scope replacement/logout synchronously hides old data and cancels outstanding read; destruction cancels. Explicit retry after error, no automatic retry loop or duplicate request. No second AuthSession or SQL transaction. Current API remains authoritative even when UI role checks pass.

## 10. i18n, RTL, accessibility, and responsive behavior

All labels/statuses/count plurals from existing core catalog and SQL overrides. Dates and numbers use current locale; no fabricated date/limit. KPI row horizontal scroll at compact width, 6 columns at desktop; two bounded panel rows, internal scroll lists, responsive RTL/logical layout. Progress announces label/value/percentage; decorative icons hidden. Current P-010 is activated with reviewed actual Web/native source and explicit snapshot/period/drill-down contract.

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Global administrator | Tenant summary | Read summary | GET /api/v1/tenants/getDashboardSummary | N/A exact existing super_admin role | Global current snapshot | Read permitted | Role landing plus direct state membership, no query for ordinary user | Existing native route retained | Dashboard | لوحة التحكم | Ordinary direct URL Forbidden, no summary request; API remains role-authoritative |
| Tenant user | Own workspace | Open applications | Existing modules catalog | Existing server exact submodule grants | Trusted current tenant | Read permitted | Existing session/tenant-workspace guards | Existing native home | Applications | التطبيقات | Anonymous login redirect and global-role exclusion |

Bounded G0-G3: exact read journeys, source ownership/roles/periods, API shape and shared audit fixed; requester explicitly continues migration and reviews at end. Remaining G4 is hosted-only PROD-002/017/019/RISK-018. Management/drill-down/context/editor work stays FOLLOW-015/012/014. No blocking Required summary question remains.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Current source audit | Existing summary/controller scope verified; no API change | documentation/modules/platform/features/angular-role-home/angular-role-home-evidence.md |
| 2 | Web | Verified | Current Phase 00 gate | Actual role entry/summary and focused checks | Same evidence ledger |
| 3 | Mobile | Verified | Web verified | Retained native focused regression | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Actual API/SQL summary plus fixture denial/race/RTL/browser | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase 06 Verified | Canonical books/manifest/generated/education | Same evidence ledger |

Next-step rule: no sibling runtime until this child is Verified and documentation/closure is Closed.

## 12. Verification contract

Strict schema/duplicate/date/zero tests; session replacement/cancellation/role/dedupe/error tests; production build/types/catalog/architecture; compact/wide EN/AR modes; six metrics and real returned panel data; empty/forbidden; no dead action links or session storage; actual API summary and reload/logout separately from fixtures. Compare current source geometry/sections without claiming unported management workflow parity.

## 13. Child exit gate

- [x] Current Phase 00 and exact bounded authorization before runtime.
- [x] Role landing and all read-only summary sections Verified.
- [x] Browser/live/retained regressions Verified.
- [x] Canonical documentation and education after Phase 06 Verified.
