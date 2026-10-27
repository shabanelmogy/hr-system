# Error logs and scoped diagnostics — Master Build Plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | platform-error-logs |
| Business capability | Error logs and scoped diagnostics |
| Owning module | Platform |
| Status | Closed |
| Target milestone | Error log viewer V1 |
| Last reviewed | 2026-10-19 |

Planning evidence: [Discovery](DISCOVERY.md), [current-system evidence](EVIDENCE.md), [research](RESEARCH.md), [decisions](DECISIONS.md), and [Error Logs contract](decomposition/error-logs.md). Applied runtime and verification evidence live in the feature books and error-logs-evidence.md.

## 1. Outcome and scope

Platform will retain bounded append-only records of API, background-job, Web and Mobile error outcomes and provide a paged, filtered, exportable in-app viewer. Super Administrators see a system-wide technical projection; active-company actors see only their current company's sanitized projection. A Super Administrator configures global retention.

### Required now

- Capture unexpected API/job failures and classified handled business/validation outcomes; receive metadata-only Web/Mobile runtime, boundary, rejection and network reports.
- Read-only list, detail and Excel export with trusted scope and bounded date/source/user/status/search criteria.
- Global singleton retention setting: default 90 days, allowed 1..3650, optimistic revision and atomic audit.
- Bounded periodic cleanup; no manual record delete, generic log-write endpoint, raw payload or third-party APM requirement.

### Deferred / excluded

| Capability | Decision |
| --- | --- |
| Physical Android/iOS acceptance | Deferred under `PROD-026`; automated Mobile evidence remains required. |
| Third-party APM, alerts/realtime, import, create/edit/archive/delete records | Excluded from V1. |
| Durable capture before host startup or while queue/database is unavailable | Production limitation under `PROD-017`; capture must never change the original outcome. |

## 2. Ownership, personas and scope

Platform owns immutable `ErrorLogEntry` facts and `ErrorLogRetentionSettings`; Audit Trail remains successful data-change history. A record is system-unscoped or carries verified tenant/company attribution; request input never assigns scope.

| Actor | Allowed projection | Critical restriction |
| --- | --- | --- |
| Super Administrator | System-wide rows, diagnostic method frames, settings | Never raw exception message/stack, body, token, cookie, credential, connection string, URL/query payload or arbitrary data. |
| Active company actor with exact permission | Current-company sanitized row/detail/export | No selector, system record or diagnostic frames. |

## 3. Domain rules and lifecycle

| Concept | Rule |
| --- | --- |
| `ErrorLogEntry` | Immutable Platform record: GUID, UTC occurrence, source, severity, bounded actor/service/action/status/duration/correlation/summary/client/browser/IP metadata, optional diagnostic method frames. |
| `ErrorLogRetentionSettings` | One global aggregate: retention days/revision and queue-depth/dropped/failed-write counters. Update compares expected revision and audits atomically. |
| Capture | Bounded nonblocking queue takes allowlisted material; failure/drop increments safe counters and never replaces/retries through/exposes the original error. Error-log endpoints are skipped to prevent recursion. |
| Cleanup | Scheduled bounded batches remove records older than configured retention; this is not a user delete action. |

Unexpected failures are captured once. API outer handling captures every HTTP status >=400, including 401/403/404 and handled business/validation outcomes, as classified warnings/errors; unauthenticated failures are system-only. Cancellation without an error and health/error-log capture endpoint noise are excluded. Client HTTP reports with an already captured server response are excluded. Web/Mobile deduplicate metadata fingerprints in a bounded window and never submit message, stack, URL/path, payload or credentials.

## 4. Permissions and API contract

| Actor | Exact permission | Operation | Scope |
| --- | --- | --- | --- |
| Active company actor | `ErrorLogs:View` | `GET /api/v1/error-logs` | Trusted current-company sanitized projection |
| Active company actor | `ErrorLogs:ViewDetails` | `GET /api/v1/error-logs/{id:guid}` | Trusted current-company sanitized projection |
| Active company actor | `ErrorLogs:Export` | `GET /api/v1/error-logs/export` | Trusted current-company projection; maximum 5000 rows |
| Super Administrator | `SystemErrorLogs:View` | `GET /api/v1/system-error-logs` | Global system projection |
| Super Administrator | `SystemErrorLogs:ViewDetails` / `SystemErrorLogs:Export` | `GET /{id:guid}` / `GET /export` | Global; diagnostic frames detail-only, export capped 5000 |
| Super Administrator | `ErrorLogSettings:View` / `ErrorLogSettings:Edit` | `GET` / `PUT /api/v1/system-error-logs/settings` | Global expected revision |

List/export criteria: `fromUtc`, `toUtc`, `userName`, `source` (`api|job|web|mobile`), `statusCode`, `search`, `page` (1-based), `pageSize`; server bounds and allowlists all criteria. Tenant routes are `/error-logs`; separate SuperAdmin routes are `/system-error-logs`. List is `{items,totalCount,page,pageSize}`; detail `{entry,diagnostics}`; settings `{retentionDays,revision,queueDepth,droppedCount,failedWrites}`; update `{retentionDays,expectedRevision}`. Client ingress remains `POST /api/v1/error-logs/client` with only `{source:web|mobile,kind:runtime|network|boundary|rejection,errorType:Error|TypeError|ReferenceError|RangeError|SyntaxError|NetworkError|unknown,eventId:guid}` and valid actor/system-admin authorization. No client scope input exists.

## 5. Experience and reuse

`ErrorLogs.PNG` and `ErrorLogs2.PNG` are visual references only. P-001 list/detail reuses Web `web-next/src/platform/audit-trail/pages/AuditTrailPage.tsx` and `components/AuditTrailDetailsDialog.tsx`, Mobile `mobile-react/src/platform/tools/audit-trail/presentation/screens/AuditTrailScreen.tsx` and `components/AuditTrailDetailsModal.tsx`, plus shared server-paged lists/cards/dialogs/feedback/guards. P-005 retention reuses typed singleton settings forms, not a one-row fake grid. EN/AR, RTL, keyboard/focus, responsive cards/table and forbidden/read-only states are required. Viewer/export/settings are online authoritative, without offline cache/replay.

## 6. Risks, rollout and verification

| Risk | Mitigation / acceptance evidence |
| --- | --- |
| Sensitive leak | Allowlist/redaction and SuperAdmin/company scope-denial tests; no raw persistence. |
| Duplicate/noisy capture | One API boundary, failed-attempt policy, client event-id/fingerprint dedup and recursion-exclusion tests. |
| Sink outage | Queue bound/drop/failed-write tests; original outcome unchanged. |
| Retention race/over-delete | Expected-revision/audit transaction and chunked cleanup tests. |
| Large export | Filter and 5000-row cap/projection parity tests. |

Apply Platform migration after API tests compile. Deploy schema then capture/cleanup, API, Web and Mobile in contract order. Production configuration remains `PROD-017`; capture availability is `RISK-010`; use forward fix or disable capture while preserving original errors.

### Feature Decomposition Gate

| Slice | Decision | Feature ID | Screen/Workflow Contract | Boundary / independent acceptance |
| --- | --- | --- | --- | --- |
| Error Logs V1 | Single feature | error-logs | `documentation/plans/business/platform-error-logs/decomposition/error-logs.md` | One immutable record/projection policy and retention setting form one release boundary; API list/detail/export/settings and both clients are verified as a vertical unit. |
| Settings tabbed workspace | Single feature | platform-settings | `documentation/plans/business/platform-error-logs/decomposition/platform-settings.md` | User-approved correction: one Settings destination inside Administration, existing configuration workflows rendered in permission-filtered tabs on both clients. No new business data or API. |

**ACTIVE_FEATURE_STEP:** None

### Settings workspace amendment — 2026-10-19

The requester explicitly supersedes the separate Settings section accepted on 2026-10-18: Settings must be a child of Administration and its contents actual tabs inside one screen, using existing shared screen components. Error Logs viewers remain Administration siblings. The exact authorized slice is `Settings tabbed workspace`; prior Error Logs V1 remains Closed. G0–G4 pass for this bounded composition: Platform owns the workspace, all child contracts/security/scope remain existing, P-007 navigation composition embeds P-005/P-001 children, shared FormTabs/AppFormTabs supply tabs, and focused/browser/export/documentation evidence is required before closure. No API, migration, generic settings DTO, global Save, new permission or business module is authorized. Physical Mobile acceptance remains PROD-026.

## 8. Quality gate and handoff

| Gate | Status | Evidence |
| --- | --- | --- |
| G0 Scope/ownership | Pass | Sections 1–3; DEC-022/023 resolved. |
| G1 Domain/security/data | Pass | Immutable records, projection/redaction, retention/revision/cleanup. |
| G2 Contracts/integration | Pass | Section 4 and executable contract. |
| G3 Web/Mobile design | Pass | P-001/P-005 gate and exact references. |
| G4 Delivery readiness | Pass for authorized implementation start | One active API-first contract; no runtime verification claimed. |

Implementation order: API, Web, Mobile, integrated verification, then documentation/closure. No stage is Verified without recorded evidence.

## 9. Central note references

| Note ID | Type | Reason |
| --- | --- | --- |
| `PROD-017` | Production | Production configuration/capture availability limitation. |
| `PROD-026` | Production | Physical Mobile acceptance separately deferred. |


## 10. Settings amendment closure — 2026-10-19

Settings tabbed workspace is Closed for requester-authorized automated/development scope. Phase06 verified then customer education completed. The platform-settings books/evidence own exact runtime and verification; existing inherited/native/production notes remain open with their canonical owners. No migration required.


## 11. Administration composition amendment - 2026-10-19

Requester extends the existing platform-settings navigation composition to collect Users/Permissions, Languages and similar administration in one application. Exact bounded contract: decomposition/platform-settings.md section 16 and applied books section 23. Existing dynamic module-launcher routes/shared cards are reused. Existing permission, scope and Settings-tab contracts remain authoritative; no new business module, API or migration. Verification/closure remains in the platform-settings evidence.


## Rich diagnostics authorized amendment - 2026-10-19

Requester explicitly extends the current error-log correction to maximize useful diagnostics. Bounded existing Error Logs V1 extension: safe technical exception/HTTP/job context in existing system-only diagnostics string array, widened bounded storage, same company/global authorization and retention. Exact preflight/rule/edge/impact/verification matrices are recorded under Rich bounded diagnostics amendment in the canonical applied books. G0-G4 pass for this bounded same-owner amendment; no new feature/module/public route or unsafe raw payload capture. Native existing selectable detail remains compatible; no new clipboard dependency. Run the standard migration/apply checks and verify live storage on the requester-authorized experimental database. SQL storage is already nvarchar(max), so increasing the application limit needs no new empty migration.


Rich diagnostics amendment acceptance: Verified for the authorized development/automated scope on 2026-10-19. Current applied evidence records 1077 passing API tests, 28 live HTTP checks, Web/native compatibility/browser acceptance and live-schema verification. SQL storage already supports the widened application bound, so the migration script creates no empty migration. New Web copying and existing native selectable detail preserve company/system authority. Original physical-device and repository release-budget notes remain open.
