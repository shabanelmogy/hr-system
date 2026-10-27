# Error Logs — cross-platform review

Execution status: Error Logs V1 verified for the authorized development and automated scope on 2026-10-17. Authority: `documentation/plans/business/platform-error-logs/PLAN.md` and `decomposition/error-logs.md`. The evidence ledger separates deferred native acceptance and inherited release findings.

## 1. Ownership
Platform owns immutable error facts, a global retention singleton and scoped projections. Audit Trail owns successful data changes. API runtime, migration, company/system Web viewers and global retention settings are implemented; Mobile implements the same approved contracts.

## 2. Approved scope
Capture classified API HTTP statuses >=400, unexpected failures, each failed background-job attempt, and metadata-only Web/Mobile errors. Required users are Super Administrators and current-company actors with independent permissions. `Error Logs V1` is the delivered feature boundary; the implementation plan is Closed for the authorized automated scope.

## 3. Domain
An append-only entry has a GUID, UTC occurrence, source, severity, bounded safe actor/service/action/status/duration/correlation/summary/client/browser/IP metadata and optional diagnostic method frames. Trusted context alone supplies tenant/company attribution. The singleton retention setting defaults to 90 days, permits 1..3650 and carries a revision.

## 4. Rules

Current diagnostic bounds: up to eight exception nodes, 64 method frames, 128 sanitized lines / 512 characters each inside a 32768-character serialized JSON budget. Technical diagnostics and IP remain system-only; client reports cannot supply diagnostics. Full current contract is in the dated Rich bounded diagnostics amendment below.
API outer capture records every final HTTP >=400 once, including handled validation/business outcomes, 401, 403 and 404. Unauthenticated outcomes are system-only. Error-log routes, health noise and non-error cancellation are excluded. Queue or sink failure cannot change the original outcome. Retention edits compare revision and audit atomically; bounded scheduled cleanup alone deletes expired entries.

## 5. Client decisions
Web Grid/Cards/Detail/Export and Mobile Table/Cards/Detail/Export are Required. Web and Mobile retention viewing/editing are Required only for SuperAdmin. Chart, reporting, import, record CRUD, realtime and notification alerts are Excluded. Both clients are online authoritative; no offline diagnostic cache/replay.

## 6. Contracts
Company `GET /api/v1/error-logs`, `/{id}`, `/export` use `ErrorLogs:View/ViewDetails/Export` separately. SuperAdmin `GET /api/v1/system-error-logs`, `/{id}`, `/export` use `SystemErrorLogs:View/ViewDetails/Export`; `GET/PUT /settings` use `ErrorLogSettings:View/Edit`. Client ingress is `POST /api/v1/error-logs/client` with a strict metadata enum/GUID body and no scope or raw string fields. List envelope is `{items,totalCount,page,pageSize}`; export is at most 5000 rows.

## 7. UI composition

Diagnostics visibility correction preflight, 2026-10-19: use the existing shared P-001 detail section and EmptyState to expose an empty system diagnostic section explicitly. Populated and empty system details use Error diagnostics / تشخيص الخطأ; company technical visibility remains Excluded. This is a bounded Web presentation correction; missing historic data is not fabricated.

Current Web detail uses shared MyForm/FormSection/DetailFields and persistent CopyButton. Summary is first; request/user data is grouped; long technical text wraps LTR. Shared FormHeader handles long IDs and read-only FormFooter uses Close.
Use the reviewed Audit Trail P-001 list/detail patterns and shared Web/Mobile list, card, feedback and guard components. Retention uses P-005 singleton shared forms. Company views contain no diagnostic frames; system detail can contain bounded method frames without exception messages or raw stack.

## 8. States
Loading, empty, error/retry and forbidden are required. Settings require dirty-exit and stale-revision conflict/reload behavior. Export failures use shared feedback. Scope change clears current data before a new read.

## 9. Scope and security
System and company authority are separate; eight exact permissions are independently checked. Company list/detail/export are filtered server-side to the trusted current company, with fresh active-company and access checks. No request-supplied scope, raw exception/body/token/cookie/URL/query/connection detail is persisted or returned.

## 10. Persistence and side effects
Platform migration owns entry and settings tables. Capture is bounded and nonblocking; failed writes increment safe counters. Settings revision and security audit commit together. Cleanup uses bounded batches and configured retention.

**Phase 06 decision: Verified for the requester-authorized development/automated delivery.** API solution plus corrected architecture rerun totals 1,072 passing tests; live schema and repeat HTTP acceptance 27/27 passed. Web static/build and browser 3/3 passed. Mobile feature/route checks 46/46 plus shared date-filter test, strict types, focused lint, architecture/contracts/i18n, foundation/release-source gates and Android export passed. Exact commands and outcomes are in error-logs-evidence.md. No full-repository or physical/native release pass is claimed: inherited Mobile lint/test failures are `FOLLOW-006`, Web full-suite runner `FOLLOW-007`, SDK patch alignment `FOLLOW-008`, shell bundle budget `RISK-009`, physical-device checks `PROD-026`, actual production configuration `PROD-017`, and best-effort capture availability `RISK-010`.

Corrective follow-up on 2026-10-18: the client DTO identity contract was corrected from RFC UUID-only to canonical .NET GUID shape after reproducing a live HTTP200/17-row parse failure. Existing captured IDs and deduplication stay intact. Settings now groups independently guarded destinations through the existing Web sidebar and Mobile Settings screen. No new route, permission or schema is needed. Detailed current evidence and regression results are in error-logs-evidence.md; prior closure counts describe the original dated baseline.

## 11. Verification

2026-10-19 correction acceptance is Verified: 1077 API tests, 28 authenticated HTTP checks, 7 Web units, 3 detail/2 launcher browser cases, 7 native compatibility tests, full Web check/build and native typecheck. Live SQL round-trip passed at 20004 characters; no new relational migration. Complete evidence and inherited/manual limits: error-logs-evidence.md, Detail/copy and richer diagnostics acceptance.
API verification includes the applied live migration, 1,072 passing tests across the solution run plus corrected architecture rerun, 27 authenticated HTTP checks and nine-module model drift. Web verification includes the full static/build gate and three browser scenarios. Mobile and integrated acceptance are recorded in the evidence ledger, including 46 focused tests and the shared date-filter test. Feature correctness, inherited repository failures and physical acceptance (`PROD-026`) remain distinct.

## 12. Reuse
Reviewed references: `web-next/src/platform/audit-trail/pages/AuditTrailPage.tsx`, `web-next/src/platform/audit-trail/components/AuditTrailDetailsDialog.tsx`, `mobile-react/src/platform/tools/audit-trail/presentation/screens/AuditTrailScreen.tsx`, `mobile-react/src/platform/tools/audit-trail/presentation/components/AuditTrailDetailsModal.tsx`; singleton forms are named in the screen contract. These are navigation references, not Error Logs implementation evidence.

## 13. Localization and accessibility
All new visible strings require paired EN/AR keys, shared RTL behavior, keyboard/focus and accessible error controls. Web Grid/Cards and Mobile Table/Cards adapt across viewport sizes.

## 14. Delivery
Implement API, then Web, then Mobile, then integrated live verification. Customer education is Required after Phase 06 records Verified.

## 15. Evidence and closure
The current-evidence `required-files.json` registers actual API, Web and Mobile sources, contracts, migration, localization and tests. Phase 06 is Verified for the authorized delivery; Phase 07 education explains these delivered surfaces and keeps native/production/repository release notes explicit. The customer guide is `documentation/plans/business/platform-error-logs/education/error-logs.md` and is registered only after it exists.



## 16. Corrective follow-up — 2026-10-18

The requester reported a list load failure and requested a Settings menu for current and future settings. This is a correction to an existing client contract and a reorganization of existing destinations: no new business capability, route, permission, lifecycle or schema. Live API rows proved a persisted GUID versus RFC UUID mismatch; Web and Mobile now accept valid hash-derived GUIDs while rejecting malformed IDs. Both clients successfully parse the same 17-row live response. The server identity and retry deduplication remain unchanged. Web uses the existing shared nested sidebar group; Mobile uses a permission-filtered Platform link registry inside the existing Settings screen. All children retain independent route/action checks; the group cannot grant authority. Exact regression outcomes are appended to error-logs-evidence.md. Prior Phase06/07 results remain the dated baseline, not proof that this regression never existed.


## 17. Shared component fidelity correction — 2026-10-18

The requester rejected the filters and identified incomplete shared reuse. This is a corrective UI change under the existing P-001 contract. Existing instructions explicitly required shared header/toolbar/date controls; shared fields alone and older Audit Trail local layout were insufficient. Web now records replacement components and expanded-browser acceptance. No permission, retention, wire or schema changes. Mobile already composes AppListScreen/AppDataTable/AppDataCard and AppDateTimeField/AppSelectField/AppTextField; no Mobile runtime change or new device acceptance is claimed. Prior applied live-schema evidence remains applicable. Central reuse documentation now requires per-surface proof and expanded-filter inspection.

The user reaffirmed the mandatory shared-component rule: reuse existing, extend a compatible component generically, create a new reusable shared component only when no existing one fits. Final Grid fidelity preserves MyDataGrid toolbar/footer/navigation and adds generic toolbarFilters/emptyContent slots. Raw-grid imports now fail the architecture gate; the sole ClientDataGrid feature consumer in localization messages was migrated with its edit callbacks and permissions preserved. This does not add business scope or change wire/storage contracts.


## 18. Administration and Settings separation — 2026-10-18

User-approved navigation reorganization: Administration is an independent main-navigation group for operational screens, not a Settings tab. Web tenant navigation combines users/roles/invitations and existing diagnostic tools in Administration; company translations/offline policy/geographic scope/localization messages move to Settings. SuperAdmin has separate Administration (system error viewer) and Settings (retention), with original tenant/geography management retained. Mobile uses the same operation/configuration split through Platform route-link composition built from shared Card/Text/Button. Existing routes and API/security scope are preserved. Settings remains the configuration entry; this slice does not create a new Web settings page or tabs because the confirmed request is the independent section split.

## Settings workspace reconciliation — 2026-10-19

The requester supersedes the earlier independent Settings section: Administration now contains one Settings destination and its existing configuration workflows are actual shared tabs. Web /administration/settings uses FormTabs; Mobile /settings uses AppFormTabs and retains local device preferences. Child authority, services, edit forms, scopes, read-only and revision/conflict behavior remain owned by this feature. Error Logs viewers stay Administration siblings; retention remains a system-only tab. Existing direct child URLs remain compatible. No API/domain/schema change or migration. Current composition and acceptance are canonical in ../platform-settings/platform-settings-review.md and platform-settings-evidence.md; older dated navigation descriptions are historical.

## Settings card presentation — 2026-10-19

The retention tab now distinguishes its primary configurable duration from four operational values using existing shared MetricCard icon/description/footer/sizing options. Values, edit/revision/permissions remain unchanged. The Settings owner records shared surface fidelity and final verification in ../platform-settings/platform-settings-evidence.md; no API/schema change. Native retention behavior unchanged; device-preference shared section correction belongs to Shell Settings.


## Detail readability and copying correction - 2026-10-19 preflight

Requester supplies Web detail-dialog screenshots with clipped long diagnostics and asks for clearer details plus a copy action. Classification: bounded correction to existing Error Logs detail presentation, not a new error-capture/data capability. Web Required: existing shared MyForm/FormSection shell, message-first layout, responsive grouped metadata, wrapped selectable LTR diagnostics in a bounded scroll area, persistent copy action with accessible success/failure/retry feedback, and full visible-authorized text copying. Shared inventory found FormSection/MyForm and existing ErrorDialogHost clipboard behavior, but no reusable metadata description-list or copy-action component. Introduce generic DetailFields and CopyButton only for those missing shared contracts, and extract existing clipboard logic for reuse rather than duplicate it. Existing MyButton supplies the button surface. Do not recreate modal/card shells.

Scope/security: existing ErrorLogDetail entry plus sanitized method frames only; do not introduce raw exception message/stack/request payload fields or expand the API. Company copy/display excludes IP and diagnostics even if an unexpected response includes them. System copy may include only the projected fields already returned by the authorized detail API. Unknown/loading/error/no-record state disables/removes copying. Existing detail permission remains required. No new permission, mutation or migration. Web EN/AR and compact/light/dark are Required. Native Mobile is Excluded from this Web-dialog correction: its existing full-screen selectable text does not use the clipped Web dialog; no native clipboard dependency/surface is introduced. Existing Mobile contracts remain unchanged, and physical checks remain PROD-026.

Pattern: existing P-001 read-only detail inside the mandatory shared form-dialog shell, with FormSection for existing P-007 composition consistency. Data-entry creation/edit/filter/mock generator are unchanged; existing authenticated API fixtures exercise long technical strings. Verify shared clipboard transport, scoped report formatter, browser layout/long text/real clipboard/copy failure and company/system separation, plus type/lint/architecture/i18n/catalog and canonical documentation. Official browser clipboard behavior is checked before extraction; existing insecure-context fallback is preserved with reliable cleanup/focus restoration.


## Rich bounded diagnostics amendment - 2026-10-19 preflight

Requester asks to continue and retain the greatest useful error detail. Existing-system relationship: extend existing Platform Error Logs capture/projection; no new module or screen. Existing string-array diagnostics can carry richer bounded safe text without wire DTO or client schema changes. The current 32x120 method-name-only/4096 JSON cap is inadequate for deep exception diagnosis. Authorized change: up to eight exception nodes (including AggregateException branches), exception full type/HResult, safe numeric provider codes, stack method names/IL offset and optional source line numbers (never paths), up to 64 total frames; trusted HTTP method/route template/activity trace/span/request trace/runtime/application version/attributed tenant/company/user; Job ID/retry/runtime metadata. No exception.Message/ToString/Data, raw SQL, body, query, route values, headers, tokens, connection strings or source filenames are captured. SQL provider numerical error codes are useful without persisting private messages.

Scope/security impact matrix: system detail-only diagnostics remain system-only; company display/copy/export cannot access diagnostics or IP. Existing immutable record/retention/index/paging/dedup/nonblocking behavior stays unchanged. Diagnostics remain string[] so both clients already render and copy/view richer text; native full-screen selectable detail is Required to remain compatible, while native clipboard stays Excluded. No new field or builder control is required because this is read-only technical text, not structured business input. No creation/edit journey or mock generator change; tests supply trusted nested exceptions and long frames. Old records remain readable and cannot recover information never captured.

Data/edge contract: increase the application MethodFramesJson limit to 32768; the existing SQL column is already nvarchar(max); keep null/legacy JSON behavior; defensive sink budgets/canonical sanitization always apply, including aggregate cycles/overlong strings. Client reports cannot provide diagnostic lines. The standard Add-ErpModuleMigrations -Name ExpandErrorLogDiagnostics -Apply check found no relational change: both 4096 and 32768 map to the existing nvarchar(max). No empty migration is created. Verify the actual column, model drift and a rolled-back long-value persistence probe against the requester-authorized experimental database; no historical record rewrite. G0-G4 bounded start requirements pass: same owner/wire/security, enumerated metadata allowlist, shared presentation, compatibility and executable verification contract established before runtime. Expand current Error Logs V1 contract rather than create a parallel capability. Required acceptance: API nested/secret omission/truncation/company projection tests, migrations/model/schema, Web complete copying/long LTR wrapping/clipboard failure, native schema/projection tests and strict check, full current documentation gates. API architecture requires the reusable technical exception snapshot in BuildingBlocks, and Host/Platform consume it without cross-module Infrastructure references.


## Current detail/capture behavior - 2026-10-19

The shared Web MyForm detail uses FormSection, semantic shared DetailFields, a persistent shared CopyButton and shared clipboard transport also consumed by ErrorDialogHost. Error summary is first, request/user metadata is grouped, long identifiers wrap, diagnostics remain selectable LTR and vertically bounded inside the dialog. The whole permitted detail report is copied, including complete projected summary, local/UTC dates, status/duration (including zero), correlation and system-only diagnostics/IP. Clipboard failure is announced inline and the same button retries. Company projection and the client formatter both exclude IP/diagnostics even for an unexpectedly overbroad response. FormHeader now wraps long subtitles without losing its close control, and shared read-only FormFooter labels its existing close action correctly.

Server capture now stores eight distinct exception nodes / 64 total method frames, type/HResult/provider codes and recognized SQL numeric codes with fixed cause classifications. HTTP captures trusted method, route template (no route/query values), request/activity trace/span, runtime/application versions; jobs capture job/retry/version metadata. The sink adds attributed tenant/company/user identifiers to trusted server diagnostics only. Client-originated diagnostic arrays are discarded. Storage budget is 32768 serialized JSON characters, up to 128 lines and 512 characters per line, accounting for actual JSON encoder expansion; a DiagnosticsTruncated marker identifies a storage/frame/node limit. Legacy records keep their original limited data. Stack line numbers require available symbols; source paths and raw exception text remain excluded.

Schema finding: SQL's existing nvarchar(max) can already hold the richer payload; EF reports no relational drift for the application max-length change. The standard script applied/checks all nine registered modules without creating an empty migration. A live rollback probe round-tripped 20004 characters exactly, confirmed max_length=-1 and zero pending Platform migrations. The previous preflight expectation of an ALTER-column migration is superseded by this verified provider behavior. Reference: https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties .


Verification decision: Verified for the authorized development/automated scope, 2026-10-19. Final counts and scope limits are canonical in error-logs-evidence.md, Detail/copy and richer diagnostics acceptance: 1077 API tests, 28 authenticated live HTTP checks, 7 Web unit tests, 3 detail browser cases plus 2 launcher cases, 7 native compatibility tests, strict client checks and successful Web build. No new relational migration; live 20004-character rollback probe passed. PROD-026, RISK-009/010 and inherited FOLLOW-006–009 remain independently owned.
