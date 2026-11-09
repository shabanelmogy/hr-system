# System Error Logs managed reports — Angular profile

## 1. Ownership and existing-system relationship

Platform owns diagnostic records, filters, summary redaction and source authorization. Reporting owns managed contracts/templates/files/rendering. Consume only Platform.Contracts across modules; never foreign DbContext/entity access. Reuse existing ErrorLogStore filtering. No new engine, business entity or error-log mutation.

## 2. Verified source and requested outcome

Verified current source supports only countries/states/districts for global reporting. Current Error Logs has Grid/Cards/details/export and no report view. The requester confirmed managed RPT/PDF and the required API extension. New source key system-error-logs is the target, not current implemented support.

## 3. Data contract

Target fixed provider source under platform, global scope. Safe rows: Id, OccurredOnUtc, Source, Severity, UserName, Service, Action, StatusCode, DurationMs, CorrelationId, Summary, Client, Browser. Guid is invariant string; duration long is invariant string in Crystal XML to preserve range using existing supported scalar types. Exclude IP, diagnostics/stack/request payloads and tenant/company/user ids. Maximum5000rows; overflow is explicit, never partial.

## 4. Rules and enforcement

Bounded typed dates/user/source/status/search/column criteria exactly match ErrorLogCriteria. Share owner validation and filtering before row limit. Source adapter requires trusted nonempty super_admin actor; Reporting must independently enforce SystemErrorLogs:View plus global report grants before catalog/preview/download/lifecycle. No source permission bypass through tenant role grants.

## 5. Platform decisions

Angular Report Required. Existing Grid/Cards/detail/export retained. Import/Chart/new diagnostic writes/offline Excluded. New Next/native UI Excluded for this Angular request; existing API compatibility retained. Settings, separate Language/Translation, ops and comprehensive review are Required successors.

## 6. Transport and criteria

Existing managed catalog/version/preview routes and DTO envelopes remain the target. Fixed provider binding must be explicit in catalog/client rather than pretending to be an SQL View. Geography keeps its verified schema-bound View requirement. Changing the global entity CHECK needs an owned Reporting migration, separately applied/evidenced; no schema change is authorized in the initial source-adapter increment.

## 7. Shared composition

Header action maintenance2026-11-08: the existing composition adapter optionally
supplies a `headerActions(unknown)` callback. Application composition narrows the
instance to GlobalReportView and returns its existing current-PDF template.
SystemErrorLogsPage projects that template into PageHeader and opts into
externalActions only when the callback exists. Platform imports no Reporting
owner, and existing adapter mocks/consumers retain their compatible fallback.
The shared report workspace and PDF toolbar provide responsive sizing and bounded
scrolling; source/report grants and structured criteria remain unchanged.

Reuse PageHeader, GlobalReportView, existing managed template dialogs and PDF viewer. Feature owns criteria and permission bindings only. Extend shared typed entity/filter APIs coherently; no local viewer or raw HTTP UI.

## 8. UX and errors

Keep honest empty catalog until a real inspected/published RPT exists. Invalid filters are rejected before query, oversize requires narrowing, unauthorized source returns forbidden. Existing report state clears stale files/results on actor changes; provider errors and retries remain shared.

## 9. Consistency and security

Reuse template immutable versions, identity locks, fingerprints and file cleanup. Contract artifact changes require coordinated ERP/provider deployment. No publication or fake rendered PDF. Initial source-adapter increment has no external endpoint, registry activation or permission expansion.

## 10. Localization and accessibility

Reuse existing core/report labels; source title belongs to existing localization authority. Future Angular acceptance must cover EN/AR/lightdark390/1440, keyboard and internal scrolling. This preflight makes no browser report claim.

## 11. Implementation preflight

G0 owners, G1 P-001 shared report reference, G2 safe source and5000limit, G3 security/filter/overflow tests are resolved for initial Phase01 source-adapter increment. Root authorizes only that increment after current documentation gates. Managed artifact, binding/lifecycle migration and Angular integration remain subsequent work within this child and must be source-reviewed before activation.

## 12. Verification

Phase06 Not Verified. Required RED/GREEN adapter tests include trusted role, invalid filters, no read on denial, safe output, retained criteria and overflow. Actual owner store integration uses synthetic EF data. Full API restore/build/test remains required. No full RPT/PDF, hosted SQL or migration pass is claimed.

## 13. Operations and release

No dependency installation, hosted mutation, deploy or fabricated RPT. Existing production-report limits remain PROD-028; this source adds contract/provider/migration deployment needs before release. Record an owned central item when exact artifact/migration/runtime evidence exists.

## 14. Customer education

Required only after Phase06 Verified. No customer guide is registered as existing while report UI is incomplete.

## 15. Handoff

S4-A4c sole Active feature. Phase01 starts with owner safe-source adapter only. Do not mark report complete from a DTO/menu or adapter. Retain remaining managed pipeline/client/browser/real-provider acceptance explicitly; successors remain queued.

## 16. Phase01 safe source increment — 2026-11-06

Implemented ISystemErrorLogReportSource in Platform.Application with a narrow public
Contracts projection. The trusted actor must have a nonempty identity and super_admin
role; no endpoint or Reporting source activation exists yet. Consuming Reporting policy
must independently enforce SystemErrorLogs:View and report grants before use.
ErrorLogCriteriaPolicy is extracted without changing existing validation semantics;
both existing list/export handlers and this source reuse it. ErrorLogStore uses the
same Filter pipeline, projects only approved summary fields, and takes5001before
returning at most5000or explicit TooLarge. Duration remains long in the contract.
DI reuses one scoped store. Architecture allowlist explicitly registers the five new
public Contracts types; no package/framework dependency is added to Contracts.

RED: source test compile failed on the absent contracts/adapter. GREEN:24focused
source/handler/store tests pass, including9new cases. Independent bounded source
review found no unresolved P1/P2. Full API gate result is recorded separately in
verification/source-adapter-2026-11-06.json when complete. Initial full gate caught
the expected explicit public-surface allowlist mismatch; the approved narrow types
are now registered and the full solution is rerun. Phase06 remains Not Verified.
Managed contract/provider/binding/migration/UI/real RPT acceptance remains pending;
do not describe this source increment as a finished Report View.

Final source-adapter gate2026-11-06: full API restore/build/test pass,1304passed/3existing environment-dependent skipped; final incremental build0errors/1inherited analyzer warning. Focused24tests pass. Receipt verification/source-adapter-2026-11-06.json records exact source hashes and boundaries. PROD-031 owns the managed integration/provider/migration/real-template release acceptance. Phase06 remains Not Verified; adapter increment is verified, full Report View remains pending.

## 17. Managed integration acceptance — 2026-11-06

Current implementation extends the canonical managed artifact to six providers.
The safe global diagnostic source is module platform with explicit provider binding;
the catalog DTO declares BindingKind provider. Geography remains database-view bound.
Draft command/client reject a View for the provider and preserve geography validation.
Source filtering remains Platform-owned; duration is invariant string in Crystal XML
to preserve long range. Consumer policy requires nonempty trusted super_admin plus
SystemErrorLogs:View and global report action grants. Tenant creation and catalog
support are denied. Role grants cannot make diagnostics tenant-consumable; source
access administration is intentionally unavailable. Independent reviews found no P1/P2.

Angular Platform composes the report via SYSTEM_ERROR_LOG_REPORT; composition alone
binds the Reporting public API, preserving ownership. The report receives current
owner criteria without paging; invalid external criteria cancel rendering rather
than broadening the query. Shared template UI supports provider drafts and no View
query. Missing published RPT remains an honest empty state. No fake PDF/RPT evidence.

Requester image defect: MyDataGrid was609pxinside1328px; shared host flex:1 fixes
all applicable consumers. New browser assertions cover full width with hidden toolbar.
Requester TopBar debugger uses a small shared component, isDevMode-only, CSS viewport
width/height and600/900/1200intervals. Development resize and production absence pass.

Reporting migration20261106160838changes only the entity CHECK and was applied through
Apply-ErpModuleMigrations.ps1. A separate read-only probe confirms the actual CHECK,
zero pending Reporting migrations and actual SQL safe-source query with synthetic
future criteria; no real diagnostic values printed or business data written.
Phase06 Verified for bounded implementation; see verification/managed-report-2026-11-06.json.
Real provider deployment/fingerprint/reinspection/real RPT/PDF remains PROD-031; it
does not imply hosted render completion. Phase07 Arabic guide is registered after
verification. Settings is the next child; no whole-Super-Admin closure is claimed.
