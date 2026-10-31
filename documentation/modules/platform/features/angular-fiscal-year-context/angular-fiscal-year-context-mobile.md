# Angular Accounting working fiscal-year context — mobile applied implementation

Retain native header/modal/dirty registry and existing bearer transport; no new native runtime.

## 1. Ownership

Accounting owns fiscal years, company Current and personal user selection. Platform migration documentation owns only this Angular adaptation record. Root composition supplies a module-owned context component to generic Shell slots; neither Shell nor Shared owns financial rules.

## 2. Current evidence

Current Next/native selector, service/query/state and canonical fiscal-years manifest reviewed. Existing GET/PUT context endpoint is present and exact permission/controller/handler/store are verified. Available is every nonarchived year, not only Open. Current/default and personal override remain distinct.

## 3. Persistence

Existing Accounting FiscalYearUserSelections and company Current index/migrations are retained. No entity/schema/grant change authorized. Actual local existing API/SQL GET and personal preference PUT/re-read/restore pass. Company Current and year lifecycle are untouched; no production year created.

## 4. Bounded outcome

S2-A5 ports the existing header working-year read/select only. FiscalYears:View controls visibility and server authority; global role hidden. Company/actor change, empty/error/malformed/forbidden and uncertain response must be coherent. Angular runtime is now Phase06 Verified; see IMPLEMENTATION_REPORT.md.

## 5. Platform R/D/E

Angular context control and scope/tab/permission acceptance Required. All year CRUD/lifecycle/SetCurrent/period editor/Grid/Cards/Chart/Report/Import/Export/attachment flows Excluded in this child. Existing Next/native retained Adapted. Other workspace screens Deferred FOLLOW-015; shared dirty/business fields FOLLOW-014; SQL translation editor FOLLOW-012.

## 6. Transport

GET/PUT /api/v1/fiscal-years/context with Cookie credentials and actual CSRF on PUT; payload only fiscalYearId. TenantMember plus exact FiscalYears:View; AllowTenantReadOnly permits personal preference. Unknown response requires runtime schema/date/identity consistency validation; finite timeout and no bearer/browser storage.

## 7. Shared audit

Existing OptionSelect context/external commit, ContextBadge, FeedbackState and createScopedRead are close and must be reused/extended generically. Calendar icon and optional empty/invalid presentation are generic. Root-provided Shell context slot preserves Accounting ownership; no direct Shell/module business import.

## 8. Lifecycle states

Required loading, no available years/default, server failure/retry,403,malformed,current selection,pending,uncertain response,changed actor/company and disposal. One PUT only; failed response reconciles via GET. Preserve existing source name/current/date annotations. No reset item inferred from null DTO support.

## 9. Authorization

Client discoverability repeats exact permission; server remains authoritative. No global bypass or client tenant/company fields. Read-only subscription permits this personal preference but does not permit SetCurrent/lifecycle. Current native dirty approval remains unchanged.

## 10. Consistency design

TRANSITION_READINESS fixes generic AuthSession serialization and trusted revalidation; Accounting owns the year request/result and generation. Pause scoped reads before write; retain last verified header until coherent commit. Coordinate company/logout, stale response and cross-tab invalidation without trusting year/role payloads or adding a session store.

## 11. Verification

Preflight passes existing API17, Next2files/7 and native2files/10 tests. Actual local SQL/API has two available years: read200, changed existing selection persisted, original override/default restored, unknown400 retained prior context, logout204. This is no Angular year UI proof. Runtime acceptance now passes Angular99/architecture7, production15 year cases and actual Angular/API/SQL/two-tab/reload with original preference restored.

## 12. Operations

No migration or production fixture creation. Existing model/schema access verified through actual context API; SQL locking/concurrency source and existing unit coverage recorded without presenting EF InMemory as a new SQL stress proof. Hosted G4 remains PROD-002/017/019/RISK-018. Rollback future client slice only, not existing Accounting domain.

## 13. Localization/accessibility

Existing owning accounting fiscalYears.context keys, lazy namespace readiness, SQL company overrides, EN/AR logical layout, compact calendar icon, registered accessible selection/keyboard/focus/error/busy. Reuse generated catalog, do not duplicate hardcoded strings. Current source compact group requires source/Angular browser comparison when runtime exists.

## 14. Execution gate

Exact bounded runtime followed current Phase00/checks and STATE_CONTRACT. API/Web/Mobile/integrated acceptance are Verified; Phase06 Verified precedes education. Final manifest/report and generated packets own actual evidence; overall migration remains Draft.

## 15. Handoff

Only existing paths are registered in required-files.json. Current exact version2 contract and TRANSITION_READINESS own next work. The Accounting control, generic lazy Shell slot and serialized Platform barrier are implemented and verified. Next work is the separately contracted module context navigation. Prior company child is Verified/Closed.

Current acceptance: 24 files/99 tests, 7 architecture cases, 432.52kB initial/115.87kB transfer, 15 production year scenarios, actual UI/SQL roundtrip/tab/reload/restoration, company14/language20/shell24/home14/login10 regressions; existing API17/Next7/native10 pass. Source and native remain retained. See IMPLEMENTATION_REPORT.md.

S1-A12 Shared source evolution2026-10-30: existing createScopedRead now captures identity/defer/take1/empty error/current invalidation and DestroyRef teardown, preserving ReadState and old callbacks. Current services HTTP10000ms/parser/cookie policy unchanged;264unit/read40+8/context24/home14/company14/fiscal15/login10/language20 acceptance belongs to angular-scoped-read-lifetime-foundation/IMPLEMENTATION_REPORT.md. Role-home browser fixture now supports ANGULAR_API_ORIGIN with old localhost default. No API/domain/schema/native/resource change.
