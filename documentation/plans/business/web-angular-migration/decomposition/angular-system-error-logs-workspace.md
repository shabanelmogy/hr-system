# System Error Logs and Settings — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A4 — Super Admin System Error Logs and Settings parity |
| Child Feature ID | angular-system-error-logs-workspace |
| Child feature name | Super Admin System Error Logs and Settings parity |
| Owner | Platform system error-log reading and singleton retention settings |
| Depends on | angular-system-audit-workspace Verified client/education; shared Grid/CardList/forms/transport |
| Execution status | Closed — Phase06 Verified and Arabic education completed2026-11-06 |
| Runtime authorization | D42 exact existing-source slice; G0-G3 source contracts/review and Phase00 books/request/existing-only manifest/recipes/generation508/check/planning Verified2026-11-06. Only scoped Angular runtime authorized; remaining G4 release-only PROD-019/028/025/RISK-020 retain scope. No API/domain/schema/native rewrite. |

## 1. Child boundary and outcome

Implement the existing system-only routes `/super-admin/error-logs` and
`/super-admin/error-log-settings`: server Grid/Cards/search/criteria/paging,
permission-scoped structured detail/copy, bounded XLSX export and the singleton
retention summary/edit workflow. These share the existing Platform controller,
contracts and authorization family. Company error logs, global client-error
capture/ingestion bridges, log writers, retention jobs and native rewrites are
Excluded from this Angular client slice. No API/domain/schema/dependency change.

System UI texts, advanced operational tools and the comprehensive final
Super Admin review remain Required siblings. No invented CRUD, reports, import,
chart/tree, deletion, log-clear action or mock-data generator.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.system-error-logs | Web | /super-admin/error-logs | Inspect/export authoritative system failures | Server collection, structured read-only detail | P-001 | C-02 Grid/Cards; C-01 shared read-only detail dialog | web-next/src/platform/error-logs/pages/ErrorLogsPage.tsx; components/ErrorLogDetailDialog.tsx | Adapted | Grid/Table/Cards/Detail/Export Required; Tree/Report/Import/Chart Excluded | Initial/background/empty/error/retry/403/invalid range; independent detail/export errors | Online; no persisted log payloads | Excluded by source; fixtures only | super_admin plus distinct list/detail/export grants | EN/AR390/1440/light/dark; shared keyboard/footer, contained scrolling and copy feedback | Shared PrimeNG widgets; source explicitly disables selection checkboxes and column filters |
| platform.error-log-settings | Web | /super-admin/error-log-settings | Review capture health and change retention days | Singleton summary, one-field dialog, expected revision | P-005 | C-01 shared form dialog with Signal Forms; P-010 metric primitives only | web-next/src/platform/error-logs/pages/ErrorLogSettingsPage.tsx; components/ErrorLogSettingsDialog.tsx | Adapted | Detail/Form Required; Grid/Table/Cards collection/Tree/Report/Import/Export/Chart Excluded | Load/retry/403/read-only/dirty/pending/field errors/409/uncertain outcome | Online authoritative; no persisted draft | Excluded by source | super_admin + ErrorLogSettings:View; editing additionally Edit and not read-only | Shared field validation/focus, dirty/pending close guards and contained layout | Shared singleton/form composition, no generic resource engine |
| platform.system-error-logs | Mobile | Existing native ErrorLogsScreen | Retain current native viewer | Existing list/detail and validated adapters | N/A | New native conversion Excluded | mobile-react/src/platform/tools/error-logs/presentation/screens/ErrorLogsScreen.tsx | Excluded | All new native surfaces Excluded | Retained native states | Retained policy | No new generator | Existing native authorities | Browser compact proof is not native-device acceptance | No domain/native change |
| platform.error-log-settings | Mobile | Existing native ErrorLogSettingsScreen | Retain current native settings | Existing singleton settings and validated adapters | N/A | New native conversion Excluded | mobile-react/src/platform/tools/error-logs/presentation/screens/ErrorLogSettingsScreen.tsx | Excluded | All new native surfaces Excluded | Retained native states | Retained policy | No new generator | Existing native authorities | Browser compact proof is not native-device acceptance | No domain/native change |

## 3. Closest existing reference

The actual Next error-log pages, service, schemas, hooks, detail grouping/copy
formatter and current controller/store are the workflow authority. Countries is
only the shared collection/form discipline; do not copy its CRUD/lifecycle,
reporting, imports or business fields. Audit supplies verified scope/cancellation,
metadata/dialog and shared Grid composition, not its cursor/unknown-total or local
detail filters. Error logs use ordinary server pages and a known total.

## 4. Reuse and composition contract

Use MyDataGrid/CardList/PageHeader, shared entity-card composition, MetricCard,
RecordSummary, DialogPanel, FormContainer, NumericField, DateField, TextField,
OptionSelect, FeedbackState, notifications and shared buttons. Inspect shared
clipboard/download and multiline/read-only text support before adding helpers;
extend a generic shared owner only for an evidenced gap. Feature UI supplies
domain values, grants and callbacks. HTTP, parsers, criteria and command state
remain in feature services/state/utilities; public policy entries stay lightweight.

Keep each component in its folder with external HTML/SCSS. Small list criteria,
collection/card, detail/grouped fields, retention summary and retention form
compositions. No raw table/modal, second Grid shell, dynamic schema or form engine.

## 5. Screen and workspace contract

List defaults: Grid, page 1, size 25; sizes 10/25/50/100; known total; server's fixed
newest-first ordering. Thirteen system Grid columns: occurredOnUtc, source,
severity, userName, service, action, statusCode, durationMs, client, browser,
summary, ipAddress and details action. Source columns are unsortable. Keep shared
column tools, record/footer navigation and server paging. Selection checkboxes
are explicitly disabled in the source (`checkboxSelection={false}`), as is
autoSelectFirstRow, and must stay absent in Angular; there is no bulk action.
Only the explicit View action opens detail. Cards show summary/time/severity,
source/service, action/status, user, duration, client/browser and permitted View.
View switching retains applied criteria. Verified `useViewLayout.tsx` persists
the allowlisted view string and synchronizes storage/same-tab changes. Angular
has no corresponding shared primitive yet. Build it generically during this
slice and apply it to Error Logs plus the verified Tenant/Countries/States/
Districts consumers. FOLLOW-027 is the canonical Required follow-up. Persist no
business payload; unavailable views fall back safely and permission/dirty guards
remain authoritative. Source preference names are `error-logs-system-view`,
`tenants-view-layout`, `countries-view-layout`, `states-view-layout` and
`districts-view-layout`; implementation may namespace Angular's storage keys.

Search is bounded by the API at 120 characters; userName at 100. Criteria are
from/to day, userName, source api/job/web/mobile and the source status choices
400/401/403/404/409/413/422/429/500/502/503/504. Source day criteria are **UTC day
boundaries**, unlike Audit's local-day conversion. Invalid/inverted dates suppress
GET and show shared guidance. Search/filter/page-size changes reset page; no local
filtering/sorting of a remote page. The source explicitly sets disableColumnFilter;
no advanced column-filter control belongs here. The five actual toolbar criteria
remain Required in both views. The Grid toolbar/search/reset/settings link appear
when the shared filter toggle is open; Grid options remain a shared capability.

Keep the primary workspace free of outer scrolling; content/Grid/diagnostics own
contained scrolling. Back navigation, where present, is the shared arrow before
the title. Scope replacement masks old list/detail/settings/export state.

## 6. Typed transport and server criteria

Existing endpoints: GET `/api/v1/system-error-logs` with optional fromUtc/toUtc/
userName/source/statusCode/search plus page/pageSize; GET `/{guid}`; GET `/export`;
GET `/settings`; PUT `/settings` with retentionDays and expectedRevision only.
Exact successful status 200, credentials, bounded timeout and current API origin
through owning services. GUIDs include .NET hash-derived values; do not require a
particular UUID version. Validate unknown payloads, safe integers, nullable text,
ISO timestamps, enums, page metadata, duplicate IDs and requested detail identity.

Rows include id/occurredOnUtc/source/severity/userName/service/action/statusCode/
durationMs/correlationId/summary/client/browser/ipAddress. Detail is entry plus
diagnostics string array. Settings are retentionDays/revision/queueDepth/
droppedCount/failedWrites. Page is 1..100000 and size 1..100; the UI uses the four
source sizes. Source must be one of four literals; statusCode is 400..599 in API.

Export applies all current server criteria, not just visible rows; store rejects
more than 5000 matches. It returns the existing XLSX content type/name and thirteen
projected columns, including IP but no diagnostics. Preserve safe download names,
binary/error response distinction and cleanup; no client CSV substitute.

### Permission Action Matrix

| Action | Exact authority | Client barrier |
| --- | --- | --- |
| Route/sidebar/list/search/criteria/page/refresh | super_admin AND SystemErrorLogs:View | Scoped guard/read owner; no GET when denied |
| View/copy projected detail and diagnostics | Above list authority AND SystemErrorLogs:ViewDetails | No detail request or stale copy after grant/scope loss |
| XLSX export | Above list authority AND SystemErrorLogs:Export | Explicit request; pending/invalid criteria block repeat; read-only still permits this read action |
| Settings route/summary | super_admin AND ErrorLogSettings:View | Independent of list grant; scoped read authority |
| Edit/save retention | Settings view authority AND ErrorLogSettings:Edit AND not read-only | Enabled primary action validates; pending/dirty/revision/uncertain barriers |
| Company logs/capture/write/delete/import/report | Excluded here | No placeholder action or invented permission |

## 7. Create, edit, view, and lifecycle contract

Detail loads freshly; grouped action metadata has service/action/local time/UTC
time/duration/status/correlation; user metadata has user/IP/client/browser.
Summary preserves newlines, source/severity are translated badges, and system
diagnostics are escaped, focusable, direction-LTR and internally scrollable.
Empty diagnostics and missing detail are distinct states. Copy uses exactly the
same authorized projection and translated labels, including diagnostics only in
this system scope; provide bounded success/failure feedback. Do not copy hidden
fields, tokens or a raw response object.

Settings display retention days and four operational counters: revision,
queue depth, dropped count and failed writes. Editing changes only retentionDays:
required positive integer 1..3650. Shared Signal Form validation and server-field
mapping render errors beneath the field and focus it; Save stays enabled before
validation. Snapshot revision is sent as expectedRevision. Pending save blocks
repeat/close; ambiguous outcomes are not automatically replayed.

On 409, show conflict and allow reload of the authoritative revision while
preserving the user's draft for explicit review/save. Separate Load Current
confirms discard when dirty, fetches and resets both value and revision. Successful
save refreshes settings and closes with feedback. No automatic overwrite, retention
job run, log deletion or hosted settings write is part of verification.

## 8. UX states, permissions, offline, and mock data

Keep initial/background/empty/error/retry/invalid range/forbidden distinct, with
independent detail/export/settings feedback. Cancel on actor/criteria/destruction;
old diagnostics and download results never survive denied scope. Different grants
remain distinct: detail/export 403 does not invent loss of a separately valid list
grant; edit 403 cannot expose a write action or destroy an allowed read snapshot.
401 ends current actor reads; exact denied capabilities cannot retry around the
barrier. No offline persistence, query payload storage or automatic polling.

## 9. Concurrency, transactions, and consistency

Backend retains storage, sanitization, capture queue and retention ownership. List
GETs, detail, export and counters are reads; only the explicit settings PUT is a
client business mutation here. Revision protects concurrency. Successful save
invalidates only the settings owner; list refresh uses current criteria. No API
or EF migration, new error capture bridge, event bus or native rewrite.

## 10. i18n, RTL, accessibility, and responsive behavior

Use current platform-advanced-tools errorLogs/systemErrorLogs/errorLogSettings and
shared core EN/AR keys. New generic messages, only if necessary, use canonical
bilingual sources and generators. Preserve UTC labels, safe raw text, contrast,
focus/keyboard/dirty guards, first invalid field, Grid/Cards/footer reachability
and 390/1440 light/dark geometry. Native acceptance is explicitly separate.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | D42/current controller/store/Next source | Frozen existing source contracts and Phase00 books/manifest; no API rewrite | angular-system-error-logs-workspace-api.md |
| 2 | Web | Verified | Phase00 generation/check/planning and source review | All Required screens/actions, fixtures/browser/reference/full gates | angular-system-error-logs-workspace-web.md |
| 3 | Mobile | Verified | Web verified | Retained native source boundary recorded | angular-system-error-logs-workspace-mobile.md |
| 4 | Integrated live verification | Verified | Complete client ready | Fixture commands/export and hosted GETs only; exact limits | angular-system-error-logs-workspace-evidence.md |
| 5 | Documentation and closure | Verified | Phase06 Verified | Arabic education, final manifest/books/generated packets and next handoff | angular-system-error-logs-workspace-review.md |

## 12. Verification contract

**Next-step rule:** system UI texts, advanced operational tools and the final
whole-Super-Admin review remain Queued until this child has complete Required
runtime, Phase06 acceptance, Arabic education and canonical closure.

Meaningful DTO/service/criteria/grant tests, fixed server ordering/page/search,
UTC-day boundaries/invalid dates, actor replacement/denial/cancellation, detail
identity/diagnostics/copy projection, XLSX/error/5000 limit and cleanup, retention
range/field focus/revision409/reload-preserves-draft/dirty/pending/uncertain outcome.
Full npm run check; actual current Next and Angular EN/AR390/1440/light/dark
matrices for Grid/Cards/detail/settings; independent source review and shared
consumer regressions. Hosted reads only, no settings mutation or manufactured
error/audit data. Compact browser is not native verification.

## 13. Child exit gate

- [x] Existing-source owner/scope, exact action grants and two coherent screens identified.
- [x] Active P-001/P-005 patterns selected from actual sources; optional capabilities classified.
- [x] Phase00 books/request/existing-only manifest/source review and generation/check508/planning Verified before runtime; receipt verification/PREFLIGHT_2026-11-06.json.
- [x] Implement all Required clients and verify meaningful/full/browser/source/live-read scope:907tests/177files,8+8+36Angular/8Next,5owner regressions,24geography,hostedGET200andlogout204; receipt SYSTEM_ERROR_LOGS_2026-11-06.json.
- [x] Phase06 Verified, then Phase07 Arabic education and canonical closure;907tests/177files,508recipes/planning and registered portable receipt.

The Audit predecessor is Verified/Closed with full844 tests/158files, browser8+32,
Next8, four owner regressions, read-only hosted proof and Arabic education. Remaining
G4 items PROD-019/028/025/RISK-020 retain their scopes and do not excuse a new client
defect or authorize API/native/schema changes.

Source-preflight review2026-11-06: one initial P2 (incorrect inherited checkbox selection) was repaired in contract/request/books against the explicit source overrides. Follow-up review has no unresolved P1/P2. G0 owner/global scope, G1 existing two-screen patterns, G2 typed transport/shared gap boundaries and G3 verification plan are source-resolved; runtime waits for Phase00 checks and explicit bounded promotion. FOLLOW-027 remains Required implementation, not a release-only exemption.

Bounded runtime promotion2026-11-06: the exact S4-A4 Phase00 passed508recipes/planning and corrected source review, with G0-G3 frozen. This promotion does not make the overall migration Implementation Ready or waive FOLLOW-027/Required UI/runtime gates.

Requester navigation refinement2026-11-06: existing operational/error/settings viewers are grouped under the main Administration entry through generic shared nested navigation. Global Report Manager remains standalone after the requester reversed that specific relocation. Global Geography keeps its current branch. The new request for general all-filtered Excel/CSV export in PageHeader for Grid/Cards is a required successor, not claimed in this slice.
