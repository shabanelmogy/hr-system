# Angular role home — mobile applied profile

## 1. Ownership

Platform Tenants owns validated summary reads and global dashboard; Shell owns role-based home entry; existing module owner supplies ordinary-user applications. Exact S2-A3, no API/native runtime rewrite.

## 2. Current source

Current Next DashboardLanding/TenantDashboardPage/types/status chips, shared MetricCard and existing Angular Shared reviewed. Existing TenantsController is super_admin-only and PlatformTenantDashboardSummaryAdapter aggregates real SQL. Native TenantDashboardScreen reviewed and retained.

## 3. Domain and persistence

No new entity, column, permission, transaction or lifecycle. Existing summary filters active tenant lifecycle and counts current enabled/accounts/companies/capacity/effective subscription statuses; expiry window is now through 30 days; recent and expiry lists bounded to 8.

## 4. Rules

Ordinary /home opens /apps, global home opens summary. Ordinary direct /super-admin is Forbidden and never fetches summary. Client role presentation never replaces server authorization. Zero/empty are actual data, never fake metrics.

## 5. Platform decisions

Web snapshot/summary cards/panels/list viewing Required. Tenant/Geography management actions and drill-down Deferred FOLLOW-015 until actual Angular targets exist. Native existing screen is Adapted/retained; its current list-derived summary is not copied into the new Angular client. P-010 reviewed Active with explicit metric owner/scope/snapshot/window/drill-down contract.

## 6. Transport

Existing HTTPS GET /api/v1/tenants/getDashboardSummary with credentials, finite timeout, unknown-response validation; no bearer/client tenant selector/browser storage. API source and schema unchanged. Malformed counts/status/date/duplicate identities show an error, never a partially fabricated dashboard.

## 7. Shared composition

Reuse frame/page header/surface/feedback and current scoped query pattern. Extend SurfaceCard generically for optional accent/icon/compact/fill; add generic MetricCard/ProgressMeter/StatusBadge for gaps. Domain presentation supplies real values and translated labels through public Shared APIs.

## 8. States and lifecycle

Accessible loading, error/retry, forbidden, actual zero/empty lists. No dirty draft, mutation conflict or create/edit flow. One component-scoped subscription deduplicates reads and cancels on role/identity/destruction; synchronous identity mask prevents stale summary.

## 9. Permissions

Exact current super_admin role on server controller; no invented Manage or business permission. Ordinary user cannot request summary through presentation/direct state. Existing tenant catalog policy remains unchanged.

## 10. Impact

Angular Platform Tenants, Shared presentation and Shell home routing; no Next/native runtime behavior changes. All metrics come from the dedicated server aggregate, no download-all query or frontend status reconstruction.

## 11. Verification

Phase 00 books/manifest/current checks before runtime. Meaningful schema/duplicate/date/zero, identity cancellation/dedupe/role and capacity/date utility tests; strict types/templates/catalog/architecture/build; EN/AR/light/dark/compact/wide browser sections and actual API/SQL summary/reload/logout separately from fixtures.

## 12. Operations

No SQL migration/rollback needed for existing read-only API presentation. Local ignored Community key retained. Hosted/provider checks PROD-002/017/019/RISK-018 remain central. Rollback this bounded Angular role entry/summary only.

## 13. Localization and accessibility

Existing core and platform-tenants keys/status plurals and SQL overrides. Locale dates/numbers, labeled progress, accessible status chips and section headings; canonical colors/icons. Desktop 6-column metrics with compact horizontal scrolling and bounded panel lists; logical RTL/focus/scroll.

## 14. Delivery

Existing API/source stage first; exact bounded runtime only after current Phase 00/checks; native retained regression; integrated live; Phase 06 Verified before education/closure. One active feature.

## 15. Evidence

Current version-2 contract and applied books own evidence. Initial manifest includes existing sources only; later actual sources/tests added. FOLLOW-015 retains actual child screens, management/profile/context; FOLLOW-012/014 retain translation editor and business form acceptance.

Phase 06 Verified 2026-10-29: full Angular check passes 21 files/77 tests plus 6 architecture cases, strict templates/types/token/font/catalog checks and production build (430.14 kB initial / 115.42 kB estimated transfer), unchanged budgets and no build warning. Production home acceptance passes 14 scenarios: 8 EN/AR/light/dark/390/1440 cases plus zero/empty, retry/error, HTTP403, malformed success, ordinary-role denial/landing and scoped SQL-text fixture across reload. Eight actual current Next KPI comparisons match width/height exactly (150x82.09375 compact, 208x81.796875 wide; icon34x34); module source tile comparisons separately passed8. Actual API/SQL role landing, summary-value comparison, reload and both-role logout passes separately. Login 11 scenarios including real API and shell24 cases pass; module14 fixture regressions pass after shared read extraction. Retained Next summary1, native tenant2 files/5 tests and API summary2 Release tests pass. No full repository/API/native release-gate claim replaces historical R2 evidence.

Canonical report IMPLEMENTATION_REPORT.md distinguishes fixture reads, actual API/SQL, retained native aggregation and absent management actions. Shared scoped-read extraction is consumed by both existing module state and summary state. Strong secondary uses canonical brand2; owning platform-tenants captions load independently before rendering. Phase 06 is Verified; customer education is written afterward.
