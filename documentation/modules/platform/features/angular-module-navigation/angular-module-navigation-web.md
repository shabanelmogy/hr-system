# Angular module navigation — web applied profile

## 1. Ownership

Platform Modules owns catalog contracts/service/state and pages. Shell only composes public route/navigation APIs. Exact S2-A2 is requester-authorized continuation, with no API/native runtime rewrite.

## 2. Current source

Reviewed current Next ModuleLauncher/ModuleLauncherPage/ModuleOverviewPage/SubmoduleEntryPage, moduleApi/types/registry/routeRequirements, and five moduleDefinition files; native ledger overview and home. Current API ModulesController/catalog policy authorizes tenant purchase plus required domain permission.

## 3. Domain and persistence

Read-only typed server module catalog; no new entity, schema, migration, role, permission, business metric or write. Native/API remain unchanged.

## 4. Rules

Only server-permitted and known client module/submodule definitions are visible. Server entryPath never becomes an Angular href. Unknown or denied direct routes show Forbidden. Enabled areas without registered business screens use the existing modules.noAvailableFeatures empty state.

## 5. Platform and scope decisions

Web launcher/overview/area navigation Required. Business screens, role-specific home/dashboard, administration and context transitions Deferred FOLLOW-015. Native remains Adapted/retained; no new native feature surface. Cards Required, business Grid/Table/Detail/Chart/Tree/Report/Import/Export Excluded from this exact child.

## 6. Transport

GET /api/v1/modules/accessible uses existing HTTPS withCredentials, no bearer or storage. Parse unknown response strictly and reject malformed/duplicate safe identities. Finite timeout, explicit retry; server authority unchanged.

## 7. Shared composition

Reuse ActionButton/AppIcon/ApplicationFrame/PageHeader/SurfaceCard. Generic Shared LauncherGrid/FeedbackState fill the audited gap without domain/network/auth. Extend frame with optional navigation visibility for source /apps behavior. Platform pages compose through curated public APIs only.

## 8. States and lifecycle

Loading status, retryable error, forbidden and empty states are translated/accessibly labeled. Explicit parent links and deep reload work. No form/dirty/conflict/write lifecycle. Auth identity changes clear state/cancel transport and reject late result; no offline grant cache.

## 9. Permission model

Catalog endpoint is authenticated, and server filters purchased submodules by existing exact requiredPermissions. Client intersection only narrows the result. Own read-only navigation requires no invented broad Manage grant. Direct route callbacks re-evaluate membership.

## 10. Impact

Only Angular Platform Modules/Shared/Shell/routes and current documentation. Existing Next/native/API source unchanged. No business controller/DTO service dispatch is introduced. Source administration entries are excluded until actual client routes are ported.

## 11. Verification

Phase 00 source/books/manifest/checks before runtime. Meaningful contract parsing, request credentials, cancellation/late result/session replacement/dedupe tests; strict templates/types/catalog/architecture/build; compact/wide EN/AR modes; browser navigation/deep-links/retry/denial; actual API catalog acceptance separate from fixtures.

## 12. Operations and rollback

Client-only rollback; no SQL rollback or migration. Keep local ignored Community key private. Production origins/provider PROD-002/017/019 and RISK-018 remain central; focused passes do not replace unrelated full gates.

## 13. Localization and accessibility

Existing bilingual core catalog only, SQL override behavior preserved. Canonical module colors/tokens/fonts; safe translated-name fallback for authorized records. Native links/focus, logical RTL arrows and wrapping; source tile geometry compared at identical viewport.

## 14. Delivery

One active child: existing API source audit first, Web after bounded current Phase 00 gate, native retained regression, integrated live verification, then canonical closure. Phase 06 must be Verified before customer education.

## 15. Evidence and follow-ups

Current contract owns exact boundary; initial manifest contains existing evidence only, later extended with actual runtime/test files. FOLLOW-015 retains role dashboards, actual business children, full navigation, administration and context transitions; FOLLOW-012/014 retain translation editor/business form acceptance.

Phase 06 Verified 2026-10-29: full Angular check 16 files/69 tests, 6 architecture cases, strict templates/types/tokens/fonts/catalog and production build (428.32 kB initial, 115.19 kB estimated transfer) pass with unchanged budgets. Fourteen production browser fixture scenarios pass (8 EN/AR/light/dark/390/1440 navigation cases plus empty/error/403/malformed/cancellation/global-role denial). Separate actual API/SQL admin login/catalog/overview/reload/logout passes, returning real permitted modules. Current Next actual browser comparison verifies 8 tile/icon geometry cases: 196x188 and 98x98 at 390, 196x206 and 108x108 at 1440. Retained Next catalog/registry/route tests 3 files/13 tests; native module registration 4 tests pass. Current shell regression 24 cases and login 11 scenarios including live API pass. API rebuild of the embedded catalog succeeds, 79 inherited analyzer warnings/0 errors. Canonical catalog checks 21 sources/7126 keys; generated schema-3 version a128a5f4b0bd57aa5c989727bf9c6726209be4b7ee181424940ddcc8d72e3f60.

Current source policy also excludes global super_admin from tenant applications, preserving Next route-access. Eight canonical core module/area label pairs were added and generated through existing catalog tooling, retaining SQL override behavior. Current Phase 06 is Verified; canonical report IMPLEMENTATION_REPORT.md records scope, source comparison, resolved findings and retained-platform differences.

S2-A3 extracts the existing catalog lifecycle to Shared createScopedRead and retains its module scope/denial tests and 14 browser regressions. Area secondary accents use canonical brand2, matching the current MUI adapter. The normal home entry now redirects to /apps under the separately verified angular-role-home child.
