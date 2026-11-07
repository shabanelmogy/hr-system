# System Error Logs and Settings implementation

Spec: `documentation/plans/business/web-angular-migration/decomposition/angular-system-error-logs-workspace.md`.
Authority: D42/S4-A4; Phase00 source review/check508/planning Verified before runtime.
Current branch: `codex/angular-component-composition` in the existing shared checkout.

Global constraints: preserve unrelated changes; no API/domain/schema/dependency/
native rewrite, installation, hosted mutation, commit/push/merge/deployment.
Shared-first, typed contracts, external component resources, Angular22.2.3 and
PrimeNG22.1.4. Run meaningful red/green tests. Workers own only their assigned
files, do not edit public barrels/docs/config and do not spawn agents. Root owns
public integration, full quality gates, UI/negative/reference/live-read evidence,
independent review and canonical closure. No runtime acceptance from DTOs alone.

## Task 1: Typed system-only DTO, criteria and HTTP service foundation

Owner files only: `web-angular/src/app/platform/system-error-logs/types/`,
`services/`, `validation/` if needed, and `error-log.fixture.ts` with synthetic data.
Use Angular CLI for service scaffolding. No UI/route/policy/state/shared/docs edits.

Read the actual Next `platform/error-logs/types/errorLogs.ts`, validation/service,
current `SystemErrorLogsController`, `ErrorLogRequests` and `ErrorLogStore`.
Reuse the Angular Audit service/spec approach and current API origin token.

Freeze public names in `types/error-log.ts`: `ErrorLogSource`, `ErrorLogSeverity`,
`ErrorLogRow`, `ErrorLogPage`, `ErrorLogDetail`, `ErrorLogSettings`,
`ErrorLogCriteria`, `ErrorLogExport`. Row fields match the existing system DTO;
detail is entry/diagnostics; settings has retentionDays/revision/queueDepth/
droppedCount/failedWrites. Export is `{ blob: Blob; fileName: string }`.
Use readonly contracts, validated unknown payloads and safe integers. GUIDs are
.NET GUIDs including non-RFC-version hash IDs; no UUID-version restriction.
Preserve nullable values and raw text; no coercion, `any` or unchecked assertions.

Export parsing/parameter helpers with clear names; freeze service class
`SystemErrorLogService` in `services/system-error-log-service.ts`, with methods
`list(criteria: ErrorLogCriteria)`, `detail(id: string)`, `settings()`,
`saveSettings(retentionDays: number, expectedRevision: number)` and
`exportXlsx(criteria: ErrorLogCriteria)`, returning typed Observables.
Existing endpoint `/api/v1/system-error-logs`; credentialed exact HTTPS API origin,
exact successful200, finite timeout. GET page, detail, settings and XLSX export;
PUT settings sends only retentionDays/expectedRevision. Service never downloads,
stores UI state, requests company scope or captures logs. Respect injected current
origin and standard auth/CSRF interceptors rather than a new transport system.

Criteria: required page/pageSize, page1..100000, size1..100; source literal;
optional UTC timestamps, userName<=100, search<=120, statusCode400..599. Validate
inverted date ranges; emit only allowlisted query keys. List response page/size
must match the request; bounded rows, total count and duplicate IDs are checked.
Detail must match requested GUID. Retention1..3650 integer and safe nonnegative
revision/counters. Export retains full filtered server criteria and source XLSX
response, safe filename and binary-vs-error distinction; store's5000 cap stays
server authority, no CSV/page-only substitute. Use existing shared helpers when
they fit; owning service may validate the known XLSX protocol without UI code.

Tests cover accepted source DTOs/non-version GUIDs/nulls, malformed/mismatched
payloads, duplicate IDs/unsafe integers, invalid criteria without requests,
exact endpoint/query/status/credentials, PUT body/revision, HTTP errors and XLSX
filename/content/error cases. HTTP is mocked; no live calls. Run scoped tests and
lint for owned files; report exact commands/results and any remaining concern.
Do not run global format or full checks concurrently with root; format only owned
files. No commits. Return a concise report and exact public helper/type names.

## Task 2: Shared allowlisted view preference and all verified consumers

Root owns shared data helper/public entry, meaningful storage/scope/allowlist/
blocked-storage tests and integration with Error Logs plus the verified Tenant,
Countries, States and Districts owners. Source behavior is `useViewLayout.tsx`;
FOLLOW-027 is Required now. Persist only a view string and preserve existing
permission/dirty/pending guards. Fall back safely when storage or a view is
unavailable; do not persist business payloads. Prove actual route remount behavior.

## Task 3: Scoped read/detail/export/settings and command owners

Consume Task1 typed service. Separate five permissions, known-total remote paging,
UTC date criteria, explicit detail/copy and Blob cleanup. Retention uses shared
Signal Forms, field errors, dirty/pending/uncertain and expectedRevision409 flows.
Source explicitly disables selection checkboxes, auto-selection and column filters.

## Task 4: Focused UI, guarded routes and actual source parity

Compose shared Grid/Cards/filter/detail/metrics/form/button/feedback components;
external resources and small responsibilities. No local look-alike shells. Header
filter toggle controls toolbar/search/reset/settings/criteria visibility as in
source. Add actual permitted sidebar/direct routes. All source fields and actions
must be usable before browser/reference/negative matrices and read-only host proof.

## Task 5: Final source review, quality gates and documentation closure

Full Angular check, owner regressions, required matrices, reviewed source hashes
and portable evidence. Close FOLLOW-027 with proof. Phase06 Verified then Arabic
education/Phase07 and canonical generation/check/planning; next sibling only after
complete closure. Parent goal remains Active until every Super Admin workflow and
the comprehensive final review are complete.
