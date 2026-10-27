# Error Logs — API implementation profile

Phase 01 status: Verified on 2026-10-17. Migration 20261017114853_AddErrorLogs applied to the configured development database. API tests passed 1072/1072 across the full solution run and the focused 70-test architecture rerun after explicitly approving the metadata capture contract. Live authenticated HTTP acceptance passed 27 checks; model drift passed all 9 modules.

## 1. Ownership
Platform owns error entries, singleton retention and endpoint projections; Host provides generic outer HTTP capture. Cross-module jobs use a narrow Platform contract without another module's DbContext.

## 2. Scope
Records may be system-unscoped or carry trusted tenant/company attribution. Company queries require fresh active tenant, company, user, membership and company access checks; system queries require SuperAdmin role. Jobs scheduled from an authenticated HTTP request capture that trusted actor context; system-scheduled jobs remain system-unscoped. A background `BeginScope` override in a separate scheduling scope is not automatically propagated through Hangfire and must be passed by an explicit trusted integration if later required.

## 3. Domain

Application diagnostic JSON bound is now 32768 characters; existing SQL storage is already nvarchar(max). The standard script found no relational migration/drift. Live pending-migration and rolled-back 20004-character persistence checks passed.
Entries are immutable and append-only. `ErrorLogEntry.Create` bounds classifications, scope pairs and field lengths; EF stores indexed entries in `platform.ErrorLogEntries`. Settings are seeded at ID 1 with 90-day default, 1..3650 database check and optimistic revision. Cleanup deletes only expired entries in up to ten batches of 500 at worker startup and hourly.

## 4. Validation
Capture accepts bounded allowlisted metadata only. The sink accepts only known summary codes, client and browser classifications, parses IP literals, and strips unsafe identifier characters. Client report source/kind/errorType are exact allowlists and eventId is GUID; JSON unmapped members are rejected. List criteria are bounded and allowlisted. Revision mismatch is conflict.

## 5. Authorization
Eight exact permissions: `ErrorLogs:View`, `ErrorLogs:ViewDetails`, `ErrorLogs:Export`, `SystemErrorLogs:View`, `SystemErrorLogs:ViewDetails`, `SystemErrorLogs:Export`, `ErrorLogSettings:View`, `ErrorLogSettings:Edit`. The SuperAdmin role remains a distinct requirement for system operations.

## 6. Contracts
Use separate `/api/v1/error-logs` and `/api/v1/system-error-logs` routes. List `{items,totalCount,page,pageSize}`; detail `{entry,diagnostics}`; settings `{retentionDays,revision,queueDepth,droppedCount,failedWrites}`; update `{retentionDays,expectedRevision}` returns updated settings. Client POST returns 202. Row `source` is lowercase `api|job|web|mobile`, severity is `warning|error`; optional status/duration and metadata may be null. Filters: UTC range, userName, source, statusCode, search, 1-based page/pageSize; export <=5000.

## 7. CQRS and persistence
Sender-first controllers dispatch feature-owned commands/queries through `IErrorLogStore`. Platform EF migration owns tables/indexes and seeded settings. Read projections are server-filtered, deterministic and no-tracking. Retention update uses the Platform atomic SQL resource lock; revision and security audit share one transaction and no-op adds no audit.

## 8. Capture and cleanup

Current capture adds structural exception type/HResult/known SQL numeric codes and fixed causes, nested/aggregate nodes, method/IL/optional source-line frames and trusted HTTP route-template/trace/version or job/retry context. No raw exception message/SQL/body/headers/query/path values/source files. The sink computes actual serialized JSON cost, limits 128 lines/512 characters per line and emits truncation markers. Full allowlist and legacy behavior are recorded in Current detail/capture behavior below.
Outer Host middleware observes every final >=400 including handled statuses, once. Host exception handling passes safe classification and method names without raw persistence. Hangfire `IServerFilter.OnPerformed` records each failed attempt once under captured trusted scope. A 1024-entry bounded channel and scoped worker persist safely; outage/drop increments counters without changing original error. Client event IDs are deduplicated by trusted actor/tenant/company and persisted as a deterministic scoped ID. Scheduled cleanup is bounded. Skip error-log routes, health, benign cancellation and client duplicate server-response reports.

## 9. Integration
Platform permissions, application handlers, infrastructure store/worker/job and presentation endpoints are registered through module composition. Export uses ClosedXML and treats formula-looking values as text. Client ingress is authenticated, metadata-only, 2048-byte bounded and rate limited at 30/min.

## 10. Verification and status

Diagnostics section visibility correction, 2026-10-19: Web displays an explicit empty state for an empty authorized diagnostics array. API projection, company/system authority, capture, wire contracts and schema are unchanged; no migration or database mutation applies.

Current 2026-10-19 amendment is Verified: Release solution restore/build plus all 1077 tests pass; authenticated live acceptance passes 28 checks, including new metadata persisted and scope-projected. Actual nvarchar(max)/zero pending Platform migrations and exact long-value rollback probe pass. No new empty migration. Final cross-platform outcomes and inherited release gates: error-logs-evidence.md.
Platform migration apply passed on 2026-10-17. The solution run and corrected architecture rerun account for 1,072 passing tests; the original architecture failure concerned approval of four exact new public capture types and was resolved with an explicit narrow allowlist, then all 70 architecture tests passed. The Platform suite passed 291 tests and the integration suite passed 168, including bounded cleanup at 5,001 expired rows, fresh/boundary/future preservation, competing settings revisions and atomic audit. The Host oversized-report regression verifies HTTP 413. Authenticated live HTTP acceptance passed 27 checks against the development database, covering scope denial, strict metadata JSON, body limit, retry deduplication, UTC, retention conflicts and real XLSX. Model drift passed all nine modules and the Infrastructure dependency audit found no vulnerable packages. These results verify the API stage; native device acceptance remains separately owned by Mobile.

## 11. Phase 00 handoff
`required-files.json` now registers actual API runtime, migration, Host and test sources. Extend the manifest with Web/Mobile paths only after they exist. `PROD-017` tracks production capture availability limits.


## 12. Persisted identifier contract — 2026-10-18

ErrorLogRow.Id is a .NET Guid. For Web/Mobile captures the sink derives its stable identity from scoped source/actor/event SHA256 material; these GUIDs need not carry RFC UUID version/variant bits. Client response validation must accept canonical hexadecimal GUIDs and must not rewrite/filter/drop valid existing records. API HTTP200 list and detail were verified during the reported client load failure. No API runtime/schema change is needed for this correction; preserving existing IDs also preserves capture retry deduplication. Client-generated EventId remains a GUID and the strict metadata-only ingress contract is unchanged.


Web shared-filter correction on 2026-10-18 changes presentation only. UTC day bounds, source/statusCode/userName/search/page/pageSize criteria, scope isolation, fixed descending order and filtered XLSX contract stay unchanged. No migration or database operation is needed; prior applied live-schema evidence remains valid. Expanded browser criteria verification consumes the existing contract.


Administration/Settings regrouping on 2026-10-18 changes client navigation only. Existing company/system read/export and global retention routes and permissions, sanitization, revision, SQL schema and migrations are unchanged. Regenerated client catalog adds core Shell labels; API publication must carry the matching embedded catalog. No migration is required.

## Settings workspace reconciliation — 2026-10-19

The requester supersedes the earlier independent Settings section: Administration now contains one Settings destination and its existing configuration workflows are actual shared tabs. Web /administration/settings uses FormTabs; Mobile /settings uses AppFormTabs and retains local device preferences. Child authority, services, edit forms, scopes, read-only and revision/conflict behavior remain owned by this feature. Error Logs viewers stay Administration siblings; retention remains a system-only tab. Existing direct child URLs remain compatible. No API/domain/schema change or migration. Current composition and acceptance are canonical in ../platform-settings/platform-settings-review.md and platform-settings-evidence.md; older dated navigation descriptions are historical.


## Web detail readability/copying scope - 2026-10-19

Web dialog readability and copying use the existing authorized ErrorLogDetail projection only. API/domain/schema/security contracts are unchanged; no migration applies.


## Rich bounded diagnostics amendment - 2026-10-19 preflight

Requester asks to continue and retain the greatest useful error detail. Existing-system relationship: extend existing Platform Error Logs capture/projection; no new module or screen. Existing string-array diagnostics can carry richer bounded safe text without wire DTO or client schema changes. The current 32x120 method-name-only/4096 JSON cap is inadequate for deep exception diagnosis. Authorized change: up to eight exception nodes (including AggregateException branches), exception full type/HResult, safe numeric provider codes, stack method names/IL offset and optional source line numbers (never paths), up to 64 total frames; trusted HTTP method/route template/activity trace/span/request trace/runtime/application version/attributed tenant/company/user; Job ID/retry/runtime metadata. No exception.Message/ToString/Data, raw SQL, body, query, route values, headers, tokens, connection strings or source filenames are captured. SQL provider numerical error codes are useful without persisting private messages.

Scope/security impact matrix: system detail-only diagnostics remain system-only; company display/copy/export cannot access diagnostics or IP. Existing immutable record/retention/index/paging/dedup/nonblocking behavior stays unchanged. Diagnostics remain string[] so both clients already render and copy/view richer text; native full-screen selectable detail is Required to remain compatible, while native clipboard stays Excluded. No new field or builder control is required because this is read-only technical text, not structured business input. No creation/edit journey or mock generator change; tests supply trusted nested exceptions and long frames. Old records remain readable and cannot recover information never captured.

Data/edge contract: increase the application MethodFramesJson limit to 32768; the existing SQL column is already nvarchar(max); keep null/legacy JSON behavior; defensive sink budgets/canonical sanitization always apply, including aggregate cycles/overlong strings. Client reports cannot provide diagnostic lines. The standard Add-ErpModuleMigrations -Name ExpandErrorLogDiagnostics -Apply check found no relational change: both 4096 and 32768 map to the existing nvarchar(max). No empty migration is created. Verify the actual column, model drift and a rolled-back long-value persistence probe against the requester-authorized experimental database; no historical record rewrite. G0-G4 bounded start requirements pass: same owner/wire/security, enumerated metadata allowlist, shared presentation, compatibility and executable verification contract established before runtime. Expand current Error Logs V1 contract rather than create a parallel capability. Required acceptance: API nested/secret omission/truncation/company projection tests, migrations/model/schema, Web complete copying/long LTR wrapping/clipboard failure, native schema/projection tests and strict check, full current documentation gates. API architecture requires the reusable technical exception snapshot in BuildingBlocks, and Host/Platform consume it without cross-module Infrastructure references.


## Current detail/capture behavior - 2026-10-19

The shared Web MyForm detail uses FormSection, semantic shared DetailFields, a persistent shared CopyButton and shared clipboard transport also consumed by ErrorDialogHost. Error summary is first, request/user metadata is grouped, long identifiers wrap, diagnostics remain selectable LTR and vertically bounded inside the dialog. The whole permitted detail report is copied, including complete projected summary, local/UTC dates, status/duration (including zero), correlation and system-only diagnostics/IP. Clipboard failure is announced inline and the same button retries. Company projection and the client formatter both exclude IP/diagnostics even for an unexpectedly overbroad response. FormHeader now wraps long subtitles without losing its close control, and shared read-only FormFooter labels its existing close action correctly.

Server capture now stores eight distinct exception nodes / 64 total method frames, type/HResult/provider codes and recognized SQL numeric codes with fixed cause classifications. HTTP captures trusted method, route template (no route/query values), request/activity trace/span, runtime/application versions; jobs capture job/retry/version metadata. The sink adds attributed tenant/company/user identifiers to trusted server diagnostics only. Client-originated diagnostic arrays are discarded. Storage budget is 32768 serialized JSON characters, up to 128 lines and 512 characters per line, accounting for actual JSON encoder expansion; a DiagnosticsTruncated marker identifies a storage/frame/node limit. Legacy records keep their original limited data. Stack line numbers require available symbols; source paths and raw exception text remain excluded.

Schema finding: SQL's existing nvarchar(max) can already hold the richer payload; EF reports no relational drift for the application max-length change. The standard script applied/checks all nine registered modules without creating an empty migration. A live rollback probe round-tripped 20004 characters exactly, confirmed max_length=-1 and zero pending Platform migrations. The previous preflight expectation of an ALTER-column migration is superseded by this verified provider behavior. Reference: https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties .


Verification decision: Verified for the authorized development/automated scope, 2026-10-19. Final counts and scope limits are canonical in error-logs-evidence.md, Detail/copy and richer diagnostics acceptance: 1077 API tests, 28 authenticated live HTTP checks, 7 Web unit tests, 3 detail browser cases plus 2 launcher cases, 7 native compatibility tests, strict client checks and successful Web build. No new relational migration; live 20004-character rollback probe passed. PROD-026, RISK-009/010 and inherited FOLLOW-006–009 remain independently owned.
