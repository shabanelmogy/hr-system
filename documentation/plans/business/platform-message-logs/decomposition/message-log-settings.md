# Company Message Log Settings — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata
| Field | Value |
| --- | --- |
| Contract version |2.0|
| Plan ID |platform-message-logs|
| Authorized slice |S1 Message Logs V1|
| Child Feature ID |message-log-settings|
| Child feature name |Company Message Log Settings|
| Owner |Platform|
| Depends on |message-logs Closed|
| Execution status |Queued|
| Status evidence |PLAN.md canonical roadmap|

## 1. Child boundary and outcome
Per-company cleanup choices/audit/revision and bounded worker; no new capture/list ownership. Accept independently when disabled/presets/custom policy and safe cleanup work.

## 2. UI Pattern Gate (mandatory before implementation)
| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|platform.message-log-settings.workspace|Web|/administration/settings|configure company history cleanup|singleton retention policy shared form|P-005|Settings FormTabs + MyForm dialog C-01|web-next/src/platform/error-logs/pages/ErrorLogSettingsPage.tsx|Adapted|Detail/Edit Required; Grid/Cards/Tree/Report/Import/Export/Chart Excluded|shared load/retry/forbidden/read-only, dirty discard/field errors/409 reload|online authoritative|valid30/90/custom local draft only, no fake scope/revision|MessageLogSettings:View/Edit; trusted company, no global bypass|EN/AR/theme RTL, first invalid focus, narrow internal scroll|company policy replaces reference global error retention; explicit enable control|
|platform.message-log-settings.workspace|Mobile|/settings (message logs tab)|configure company history cleanup|singleton retention policy shared form|P-005|AppFormTabs + AppForm shared dialog|mobile-react/src/platform/tools/error-logs/presentation/screens/ErrorLogSettingsScreen.tsx|Adapted|Detail/Edit Required; Table/Cards/Tree/Report/Import/Export/Chart Excluded|shared load/retry/forbidden/read-only, dirty discard/field errors/409 reload|online only; no cache/outbox|valid30/90/custom local draft only, no fake scope/revision|MessageLogSettings:View/Edit; exact route/callback guard|EN/AR/RTL, phone/tablet/touch, scroll/safe areas|company scope and explicit policy controls|

## 3. Closest existing reference
Review required-files.json for Error Logs and actual referenced sources. Reuse shared list/filter/detail/export or settings concurrency/form contracts, not error-log global authority or business fields. Current company email template resolver provides trusted attribution.

## 4. Reuse and composition contract
Web ContentWrapper/PageHeader/MyDataGrid/toolbarFilters/CardViewHeader/EntityCard/CardViewPagination/MyForm/FormSection/DetailFields/CopyButton/feedback/fields and SafeHtmlPreview where applicable. Native AppScreen/AppListScreen/AppDataTable/AppDataCard/AppFilterFormButton/AppModal/AppForm/AppStateView/AppHtmlPreview plus existing binary sharing. Settings owner FormTabs/AppFormTabs. No raw Grid, local look-alike shell, native browser dialog or duplicate data state. Only extend shared component generically if actual inventory proves a gap.

## 5. Screen and workspace contract
Settings card states enabled/disabled and days. Edit has explicit enable Switch, preset30/90/custom select and conditional bounded days. Warn next cleanup applies shorter duration and deletion cannot undo. Save enabled, beneath-field errors/focus, dirty protection, conflict preserves draft. Separate View/Edit, read-only visible policy.

## 6. Typed transport and server criteria
GET/PUT /api/v1/message-log-settings. Response Enabled, RetentionDays, Revision; write same with ExpectedRevision. Days1..3650, revision>=0; default disabled/90. Exact scoped SQL lock and atomic audit. Worker technical port deletes bounded5000 expired rows/company/pass after locking/re-reading current policy; cutoff UTC exclusive. No policy change through client-owned tenant/company.

### Permission Action Matrix
| Actor | Resource | Action | API/message | Exact permission | Scope | Read-only/direct guard | EN label | AR label | Denial |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|company member|MessageLogSettings|view|GET settings|MessageLogSettings:View|company|route/query guard|View message log settings|عرض إعدادات سجل الرسائل|global/foreign/missing grant denied|
|company editor|MessageLogSettings|edit|PUT settings|MessageLogSettings:Edit|company|read-only and callback guard|Edit message log settings|تعديل إعدادات سجل الرسائل|missing grant/read-only denied|

Other lifecycle actions Excluded. Labels/descriptions paired EN/AR, stable technical English claims.

## 7. Create, edit, view, and lifecycle contract
Default without row; first save creates policy under scoped lock. ExpectedRevision rejects stale first/edit writer; no-op preserves. Atomic audit. Cleanup has no manual per-record delete action.

## 8. UX states, permissions, offline, and mock data
shared load/retry/forbidden/read-only, dirty discard/field errors/409 reload. Feature-owned typed services, scoped queries, online boundary and explicit error/retry. No form on read-only history; settings uses RHF/Zod/shared field validation. Mock policy as UI Gate, no fabricated identity/tokens. Export temporary native files use existing cleanup/share helper.

## 9. Concurrency, transactions, and consistency
Settings/audit atomic, first writer SQL lock, revision/rowversion. Cleanup rechecks locked persisted policy before delete, exact company cutoff/limit; multiple workers safe, disabled no delete. Company remount isolates open form/draft.

## 10. i18n, RTL, accessibility, and responsive behavior
Paired owning EN/AR labels, semantic shared status/icons/fields, existing theme RTL; readable LTR technical identifiers and safe HTML. Keyboard/focus/close accessible, narrow internal scroll, native full-screen detail/safe areas. Physical acceptance PROD-026; no claim of an untested device. No native styling reimplementation.

## 11. Vertical execution ledger (strict one-active-step gate)
| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
|1|API|Queued|previous child Closed|source/tests/migration/schema/ACL|owning evidence book|
|2|Web|Queued|API Verified|shared journey/tests/browser|owning evidence book|
|3|Mobile|Queued|Web Verified|shared native journey/tests/contracts/export|owning evidence book|
|4|Integrated live verification|Queued|Mobile Verified|live API/DB/client acceptance|owning evidence book|
|5|Documentation and closure|Queued|Integrated Verified|books/manifest/generated/education|owning evidence book|

## 12. Verification contract
Domain boundary/default/disabled/no-op/stale; SQL first-writer/audit; UTC cutoff/future/boundary/multi-company/batch/competing policy; Web/native preset/toggle/custom validation/dirty/conflict/read-only/settings tab and context isolation. Actual migrations/live schema mandatory. Full relevant gates plus existing RISK-009/FOLLOW-006/007/008 distinguished. PROD-027 received-provider acceptance separate; no external test send. Five-point audit: history create/edit N/A, view/list/mock fixtures Required; settings create/default/edit/view Required, list N/A singleton, valid policy mock Required.

## 13. Child exit gate
Phase06 Verified before education. All authorized platform journeys/source/schema/ACL verified, actual-file manifest and canonical books reconciled, generated checks pass. Central notes retain inherited/manual checks. Only after documentation Closed may next child start. No sibling placeholder.

**Next-step rule:** one Active stage only, all later stages Queued; no sibling feature until integrated Verified and documentation Closed.
