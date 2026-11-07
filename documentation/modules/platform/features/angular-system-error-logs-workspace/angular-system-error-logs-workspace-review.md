# System Error Logs and Settings — master applied review

## 1. Ownership

Platform owns the existing system error-log viewer, projection/export and singleton retention setting. D42/S4-A4 is an Angular existing-source parity slice. Capture writers, queue, storage, retention jobs, company logs and native clients retain their existing owners. Phase00 and Phase06 client acceptance are Verified2026-11-06. Existing API/native behavior is retained; only the Angular client was implemented.

## 2. Verified current source and target

Verified current Angular and Next source provide the system-only Grid/Cards viewer, thirteen columns, five criteria plus search, permitted detail/copy/XLSX and singleton retention summary/edit workflow. Typed services validate unknown responses, GUID identity, UTC calendar bounds, safe filenames and command outcomes. Separate role/action grants, actor cancellation, revision conflicts and dirty/pending/uncertain recovery are implemented. Current complete evidence is recorded in section12; earlier foundation receipts remain historical. No business/API/schema/native rewrite.

## 3. Data contract

GUID log ID; occurredOnUtc; source api/job/web/mobile; severity warning/error; nullable userName/service/action/statusCode/durationMs/correlationId/client/browser/ipAddress; summary text. Page items/totalCount/page/pageSize. Detail entry/diagnostics array. Settings retentionDays/revision/queueDepth/droppedCount/failedWrites. Unknown payloads require safe typed validation, not unchecked casts or duplicate DTOs.

## 4. Business rules and authorities

All system endpoints require super_admin. SystemErrorLogs:View, ViewDetails and Export are distinct. Settings View and Edit are independent exact grants; editing also requires not read-only. Retention integer1..3650 with nonnegative safe expectedRevision;409 preserves draft and requires explicit revision review. No log CRUD or invented Manage action. API remains authoritative.

## 5. Platform capability decisions

Web Grid/Table/Cards/Detail/Copy/Export and singleton settings Required. Tree/Chart/Report/Import/log create/edit/delete/mock generator Excluded by actual source. Retained API/native behavior is inspected, not rewritten. New native conversion and company/capture/ingestion runtime Excluded. UI text/advanced tools/final review remain Required siblings.

## 6. Transport and criteria

GET /api/v1/system-error-logs with UTC from/to day bounds, userName<=100, source literal, statusCode400..599, search<=120, page1..100000 and pageSize1..100. UI default25 and sizes10/25/50/100, server fixed newest order, known total,300ms trimmed search debounce. GET /{guid}, /export and /settings; PUT /settings sends only retentionDays/expectedRevision. Export covers all criteria and server rejects more than5000 matches; XLSX thirteen projected columns, no diagnostics. Owning services use existing credentialed transport and exact200/validated identity/bounded timeouts.

## 7. Shared composition and gaps

MyDataGrid/CardList/PageHeader, shared entity-card typography, MetricCard/RecordSummary/DialogPanel/Signal Forms/fields/feedback and buttons remain the public composition boundary. Error Logs has no selection checkboxes, auto-selection or advanced column filters; only explicit View opens details. Shared CardList flex growth fills the available viewport; fit/min320 provides three wide columns and one compact column. Feature ErrorLogCardHeader reuses the shared entity-card header mixin. CopyButton reads the authorized projection at click time; TextPanel escapes diagnostics and bounds internal LTR scrolling. createViewPreference restores/synchronizes only an allowlisted presentation string for Error Logs/Tenants/Countries/States/Districts; FOLLOW-027 is Verified. Composition groups existing operational/error/settings entries under Administration using shared nested NavigationList. Global Geography retains its existing branch; Global Report Manager stays standalone after the requester reversed its proposed move. Future operational entries appear only after actual authorized implementation.

## 8. States, lifetime and privacy

Separate loading/background/empty/error/retry/invalid-range/forbidden and independent detail/export/settings outcomes. Actor replacement cancels and masks obsolete snapshots. Denials remain capability-specific: detail/export403 does not erase a separately authorized list; edit403 cannot re-enable save or leak a stale command result.401 invalidates current actor reads. Diagnostics are escaped authorized system text, never raw application-error feedback. No persisted log data or offline query cache.

## 9. Consistency and mutation effects

Known-total paging and filtering remain server-owned. Detail matches its GUID; export includes the applied criteria, invokes the existing dedicated XLSX endpoint, cleans Blob URLs and emits scoped success feedback. Retention PUT sends only retentionDays/expectedRevision. Conflict Reload preserves the draft and refreshes authoritative counters; Load Current confirms discard and resets value/revision. Pending/uncertain/scope replacement prevent replay or stale acceptance. UTC bounds reuse shared isDateOnly and cover0001..9999 without Date.UTC year offsets. Newly requested general Excel/CSV export for all filtered pages and both Grid/Cards is a separate successor; this acceptance does not claim that new capability exists.

## 10. Localization and accessibility

Existing platform-advanced-tools namespaces errorLogs/systemErrorLogs/errorLogSettings plus shared core EN/AR. UTC criteria are intentional and differ from Audit local-day bounds. Shared error-under-field/first-invalid focus/dirty/pending guards and keyboard/RTL remain mandatory. Contained page/Grid/diagnostic scrolling; shared back arrow before title where applicable.390/1440/light/dark acceptance must exercise both views and settings.

## 11. Implementation preflight

Exact two-screen version2 contract selects Active P-001 and P-005 from actual sources. Current source, request matrices, four initial books and existing-only manifest are prepared before runtime. Independent source review has no unresolved P1/P2 after correcting the explicit no-checkbox/no-column-filter overrides. Phase00 generation/check passes508recipes and planning passes with two inherited warnings. Exact bounded runtime promotion is recorded in the contract and verification/PREFLIGHT_2026-11-06.json. No source code existed at that checkpoint. Remaining external PROD-019/028/025/RISK-020 cannot change this frozen source workflow. No generated future Angular paths are registered.

## 12. Verification

Phase06 Verified2026-11-06 for the complete S4-A4 Angular client. The full npm run check exits0:907tests/177files,31architecture,4configuration,format/lint/catalog/tokens/fonts/types/build. Initial578.82kB retains RISK-020. Browser8list/detail/copy/XLSX/view/navigation +8retention +36negative cases and actual Next8reference cases pass. Shared regressions pass Tenant Management/Tenant Administrators/States/Districts/Audit (5); geography/navigation24passes and direct Tenant/Countries header comparisons4pass. View-preference16cases plus actual Error Logs8prove current consumption. Hosted4210 owned-session GETs list/detail/settings200, both routes rendered and logout204;0businesswrites. Independent scoped source reviews have no unresolved P1/P2. Receipt: verification/SYSTEM_ERROR_LOGS_2026-11-06.json; portable evidence: verification/final-2026-11-06/. No new native/API/database execution is claimed.

## 13. Operations and release

Retain current API/domain/schema/dependencies/native capture and retention processes. No EF migration or API runtime execution for this Angular-only slice. New visible text, only when needed, uses canonical generators. Publication remains PROD-019 and existing reporting release IDs keep their scopes. No commit/push/merge/deployment. FOLLOW-027 must be fixed before the current whole-Super-Admin goal is complete.

## 14. Customer education

Phase06 Verified precedes Arabic customer education at documentation/plans/business/web-angular-migration/education/angular-system-error-logs-workspace.md. Phase07 is complete; current client Closed2026-11-06 after final canonical generation/check/planning. Native/API/report publication limits remain explicit.

## 15. Handoff

S4-A4 client acceptance is Verified with current portable evidence and source hashes. Arabic education is complete and registered; canonical generation/check508/planning pass. Newly requested shared all-filtered Excel/CSV export, System UI texts/Settings host, operational tools and comprehensive final Super Admin review remain Required successors. Parent goal stays Active.

Dated refinement2026-11-06: S4-A4b adds real bounded server column filters, shared pagination presentation and compact Error cards. Its own Phase06/Phase07 are Closed; see angular-system-log-collection-consistency/verification/acceptance-2026-11-06.json. Historical counts above are retained for their original acceptance, not current gate totals. Hosted SQL rollout remains PROD-030. S4-A4c managed reports is Active; this does not imply report completion.
