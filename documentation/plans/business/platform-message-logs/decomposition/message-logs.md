# Company Message Logs — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata
| Field | Value |
| --- | --- |
| Contract version |2.0|
| Plan ID |platform-message-logs|
| Authorized slice |S1 Message Logs V1|
| Child Feature ID |message-logs|
| Child feature name |Company Message Logs|
| Owner |Platform|
| Depends on |existing sender/template/company scope|
| Execution status |Active|
| Status evidence |PLAN.md canonical roadmap|

## 1. Child boundary and outcome
Actual attributed Email capture/list/detail/filtered Excel. Accept when immutable redacted snapshot and truthful phase outcomes are visible only to owning company. Settings/purge remain queued child, no placeholder.

## 2. UI Pattern Gate (mandatory before implementation)
| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|platform.message-logs.workspace|Web|/administration/message-logs|inspect actual email attempts and export filtered history|immutable server history and redacted detail|P-001|C-01 read-only MyForm dialog; C-02 shared Grid/Cards|web-next/src/platform/error-logs/pages/ErrorLogsPage.tsx|Adapted|Grid/Cards/Detail/Export Required; Tree/Report/Import/Chart/Create/Edit Excluded|shared load/empty/retry/forbidden; dirty/conflict N/A read-only|online authoritative|deterministic safe attempt fixtures; editor generator Excluded|MessageLogs:View/Export; trusted company, no global bypass|EN/AR/theme RTL, first invalid focus, narrow internal scroll|Email attempt fields replace diagnostics; no global mode|
|platform.message-logs.workspace|Mobile|/message-logs|inspect actual email attempts and export filtered history|immutable server history and redacted detail|P-001|AppListScreen Table/Cards + read-only AppModal|mobile-react/src/platform/tools/error-logs/presentation/screens/ErrorLogsScreen.tsx|Adapted|Table/Cards/Detail/Export Required; Tree/Report/Import/Chart/Create/Edit Excluded|shared load/empty/retry/forbidden; dirty/conflict N/A read-only|online only; no cache/outbox|deterministic safe attempt fixtures; editor generator Excluded|MessageLogs:View/Export; exact route/callback guard|EN/AR/RTL, phone/tablet/touch, scroll/safe areas|read-only sample-free historical snapshot|

## 3. Closest existing reference
Review required-files.json for Error Logs and actual referenced sources. Reuse shared list/filter/detail/export or settings concurrency/form contracts, not error-log global authority or business fields. Current company email template resolver provides trusted attribution.

## 4. Reuse and composition contract
Web ContentWrapper/PageHeader/MyDataGrid/toolbarFilters/CardViewHeader/EntityCard/CardViewPagination/MyForm/FormSection/DetailFields/CopyButton/feedback/fields and SafeHtmlPreview where applicable. Native AppScreen/AppListScreen/AppDataTable/AppDataCard/AppFilterFormButton/AppModal/AppForm/AppStateView/AppHtmlPreview plus existing binary sharing. Settings owner FormTabs/AppFormTabs. No raw Grid, local look-alike shell, native browser dialog or duplicate data state. Only extend shared component generically if actual inventory proves a gap.

## 5. Screen and workspace contract
List newest attempt UTC/name/subject/recipient/state/phase/duration, template/lang filters and dates/status/recipient/search; additional controls in shared toolbarFilters. Grid/Cards share server state and footer. Detail shows actual redacted snapshot, sender/recipient/template/time/cause/SMTP numeric code/correlation, no live links; plain copy safe. Excel uses active scope/criteria, separate permission, max5000 results; narrow first when capped.

## 6. Typed transport and server criteria
GET /api/v1/message-logs criteria fromUtc/toUtc/status/templateId/recipient/search/page/pageSize; GET /{id:guid}; GET /export. Page1..1000000,size1..100, UTC bounds ordered, search<=200/recipient<=254, known IDs and pending/accepted/failed/cancelled/uncertain. Stable descending startedUTC/ID. Full detail HTML only in detail, metadata export capped5000. No POST/create/retry/delete. Subject<=512, snapshot<=65536; safe truncation marker, strict UTC/scope metadata.

### Permission Action Matrix
| Actor | Resource | Action | API/message | Exact permission | Scope | Read-only/direct guard | EN label | AR label | Denial |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|company member|MessageLogs|list/detail|GET list/detail|MessageLogs:View|company|route/query/detail guard|View message logs|عرض سجل الرسائل|global/foreign/missing grant denied|
|company exporter|MessageLogs|export|GET export|MessageLogs:Export|company|direct export guard, online required|Export message logs|تصدير سجل الرسائل|missing grant/foreign denied|

Other lifecycle actions Excluded. Labels/descriptions paired EN/AR, stable technical English claims.

## 7. Create, edit, view, and lifecycle contract
Only trusted sender creates capture. Pending before network, final accepted/failed/cancelled/uncertain; no user mutation/replay. Unattributed sends not assigned, no history backfill. Snapshot immutable after completion and independent of later template changes. Capture writes bounded best-effort isolated from business context.

## 8. UX states, permissions, offline, and mock data
shared load/empty/retry/forbidden; dirty/conflict N/A read-only. Feature-owned typed services, scoped queries, online boundary and explicit error/retry. No form on read-only history; settings uses RHF/Zod/shared field validation. Mock policy as UI Gate, no fabricated identity/tokens. Export temporary native files use existing cleanup/share helper.

## 9. Concurrency, transactions, and consistency
One attempt per invocation; no retry from capture failure. Separate capture DbContext, bounded timeout, no ambient business transaction corruption. Accepted cannot become failed after disconnect; timeout/cancel during transfer uncertain. Terminal completion once, safe pending after crash. Reads derive current active tenant/company access. Query keys user/tenant/company/criteria and detail ID; context remount closes detail.

## 10. i18n, RTL, accessibility, and responsive behavior
Paired owning EN/AR labels, semantic shared status/icons/fields, existing theme RTL; readable LTR technical identifiers and safe HTML. Keyboard/focus/close accessible, narrow internal scroll, native full-screen detail/safe areas. Physical acceptance PROD-026; no claim of an untested device. No native styling reimplementation.

## 11. Vertical execution ledger (strict one-active-step gate)
| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
|1|API|Verified|plan/preflight|source/tests/migration/schema/ACL|owning evidence book|
|2|Web|Active|API Verified|shared journey/tests/browser|owning evidence book|
|3|Mobile|Queued|Web Verified|shared native journey/tests/contracts/export|owning evidence book|
|4|Integrated live verification|Queued|Mobile Verified|live API/DB/client acceptance|owning evidence book|
|5|Documentation and closure|Queued|Integrated Verified|books/manifest/generated/education|owning evidence book|

## 12. Verification contract
Transport preflight/connect/auth/reject/accepted/disconnect/cancel/uncertain; no secrets/raw exception/provider response; scoped resolver; capture DB failure preserves send; immutable historical HTML; list/detail/global/foreign ACL; paging/filters/date validation; bounded safe XLSX; shared Grid/Cards controls/paging; native HTML navigation/offline/export cleanup. Actual migrations/live schema mandatory. Full relevant gates plus existing RISK-009/FOLLOW-006/007/008 distinguished. PROD-027 received-provider acceptance separate; no external test send. Five-point audit: history create/edit N/A, view/list/mock fixtures Required; settings create/default/edit/view Required, list N/A singleton, valid policy mock Required.

## 13. Child exit gate
Phase06 Verified before education. All authorized platform journeys/source/schema/ACL verified, actual-file manifest and canonical books reconciled, generated checks pass. Central notes retain inherited/manual checks. Only after documentation Closed may next child start. No sibling placeholder.

**Next-step rule:** one Active stage only, all later stages Queued; no sibling feature until integrated Verified and documentation Closed.

Persistence relationship reconciliation: current PlatformCompany is Infrastructure-owned Identity state. Keep Domain free of Infrastructure references; configure the real Company foreign key with a unidirectional HasOne<PlatformCompany> mapping in Infrastructure. Do not move the existing company model or add a forbidden Domain navigation merely for symmetry. Read authorization reuses ICompanyAccessService rather than depending on Error Logs store.
