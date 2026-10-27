# Error Logs — implementation request and Phase 00 preflight

## Authority

Plan `platform-error-logs`, authorized slice `Error Logs V1`, one active feature `error-logs`. The approved plan and `documentation/plans/business/platform-error-logs/decomposition/error-logs.md` v2.0 own product decisions. Platform owns the feature. This file translates those decisions for implementation. Runtime and Phase 06 verification are pending.

The current Host logs unexpected exceptions and returns generic ProblemDetails; Audit Trail records successful data changes. Neither is a structured Error Logs viewer. Add an independent Platform slice. Host retains generic HTTP status observation through a narrow Platform.Contracts capture port. Hangfire, Platform scope/permissions, Audit Trail P-001, singleton P-005 forms and client telemetry are reuse surfaces, as traced in plan `EVIDENCE.md`. No other module accesses Platform DbContext.

## Approved behavior and contracts

Capture every final API HTTP >=400 once, including handled business/validation, 401/403/404; failed job attempts; and bounded metadata-only Web/Mobile errors. Exclude error-log endpoints, health noise, benign cancellation and duplicate client reports of server responses. A bounded queue and scoped worker persist safely; drop/write failure never changes original outcome. No raw message, stack, body, token, cookie, URL/query, credential, connection string or arbitrary client data is persisted. Method frames alone may appear in SuperAdmin detail.

Company `GET /api/v1/error-logs`, `/{id:guid}`, `/export` require respectively `ErrorLogs:View`, `ErrorLogs:ViewDetails`, `ErrorLogs:Export`, fresh active-company/tenant/company access and current-company sanitization. SuperAdmin `GET /api/v1/system-error-logs`, `/{id:guid}`, `/export` require role plus respectively `SystemErrorLogs:View`, `SystemErrorLogs:ViewDetails`, `SystemErrorLogs:Export`. Global `GET/PUT /api/v1/system-error-logs/settings` require separately `ErrorLogSettings:View` and `ErrorLogSettings:Edit`, independent of viewer permission. Eight permissions total.

Client ingress `POST /api/v1/error-logs/client` uses `[Authorize]` and `[AllowTenantReadOnly]`, a rate limit, and only `{source:web|mobile,kind:runtime|network|boundary|rejection,errorType:Error|TypeError|ReferenceError|RangeError|SyntaxError|NetworkError|unknown,eventId:guid}`. Unknown fields are rejected. Trusted actor/tenant/company scope is validated before enqueue; dedup includes all trusted scope and event ID.

List `{items,totalCount,page,pageSize}`; detail `{entry,diagnostics}`; settings `{retentionDays,revision,queueDepth,droppedCount,failedWrites}`; update `{retentionDays,expectedRevision}`. Server-bounded filters are `fromUtc,toUtc,userName,source,statusCode,search,page,pageSize`, with 1-based page and deterministic order. Safe XLSX export is limited to 5000 rows; 5001 is rejected. Immutable records have no user CRUD. The global retention singleton defaults to 90 days, allows 1..3650, compares revision and writes security audit atomically. Only scheduled bounded cleanup deletes expired entries.

## Business Rules Matrix

| ID | Rule | Primary owner | Outcome and required proof |
| --- | --- | --- | --- |
| BR-001 | Persist bounded allowlisted metadata only. | Application | Safe row/drop; redaction and hostile ingress tests. |
| BR-002 | Capture every final HTTP >=400 once; honor exclusions. | Application | Classified row/exclusion; HTTP status matrix. |
| BR-003 | Each job failed attempt and client event dedup use trusted scope; sink failure cannot affect source outcome. | Application | One row/drop counter; retry, dedup, outage tests. |
| BR-004 | Company projection requires fresh access and excludes system rows/frames. | Application | Scoped row or denial; cross-scope tests. |
| BR-005 | System operations require SuperAdmin role and exact action permission. | Application | Global row or denial; eight independent permission tests. |
| BR-006 | Retention range/revision and atomic audit; no-op changes neither. | Domain | Update/conflict; revision, rollback and no-op tests. |
| BR-007 | Only scheduled bounded cleanup deletes expired entries. | Application | Chunk deletion; age boundary/batch tests. |
| BR-008 | Bounded deterministic list and <=5000 export. | Application | Page/export or validation error; 5001/tie-break tests. |

## Edge Cases and Validation Matrix

| Category | Scenario / result | Owner and proof |
| --- | --- | --- |
| Input and range | Extra client field, invalid enum/GUID, bad UTC range, retention outside 1..3650: reject before enqueue/write. | Presentation/Application validation tests |
| Duplicate/normalization | Same actor/scope/event ID is one row; different actor/scope remains distinct. | Application dedup tests |
| Persisted uniqueness/race | One settings singleton; competing revision update yields one conflict. | Database/Infrastructure concurrency tests |
| Relationships/scope | Inactive company, revoked tenant/company access or company read of system row: deny/omit. | Application scope tests |
| Permission/actor | Eight permissions independent; system adds SuperAdmin role. | Controller/handler denial tests |
| Lifecycle | Record mutation/archive/restore forbidden; cleanup age boundary only. | Application tests |
| Retry/rollback | Audit failure rolls back settings; queue/write failure leaves original HTTP/job outcome. | Integration tests |
| Paging/date | Allowlisted bounded filters, UTC validation, deterministic order. | Query tests |
| Money/UOM | N/A: diagnostics have no financial quantities. | Plan scope |
| Bulk/import | N/A: import and user bulk mutation excluded; export capped. | Export test |
| Integration/operations | Job retries, queue full and sink outage counted safely. | Worker/job tests |
| Files/secrets | No file ingress/raw body; XLSX safe projection only. | Ingress/export tests |
| Compatibility | New Platform schema; no fabricated historical rows. | Migration/model tests |
| Cancellation/scale | Benign cancellation excluded; bounded channel, cleanup and indexed scope query. | Capture/cleanup tests |

## Impact Matrix

| Area | Decision and target | Evidence required |
| --- | --- | --- |
| Domain | Add immutable entry and singleton settings in Platform. | Domain tests |
| Application/CQRS | Add capture, read/export and settings messages/ports. | Handler tests |
| Infrastructure | Add EF migration/store, bounded channel, worker, job/cleanup. | Migration/integration tests |
| Presentation/Host | Add separate scoped routes, strict ingress and outer HTTP observation. | Contract/HTTP tests |
| Security | Add eight permissions and fresh scope/role checks. | Denial matrix |
| Web | Add typed service/hooks, viewers, settings and safe reporter. | Focused tests/type-check |
| Mobile | Add typed adapter/repository, viewers, settings and safe reporter. | Focused tests/type-check |
| Documentation | Update books, manifest, recipes and central notes. | Planning/documentation checks |

## Platform capability decisions

| Capability | Web | Mobile |
| --- | --- | --- |
| Viewer | Required Grid/Cards/Detail/Export | Required Table/Cards/Detail/Export |
| Company route | `/advanced-tools/error-logs` | `/advanced-tools/error-logs` |
| System route | `/super-admin/error-logs` | `/system-error-logs` |
| Independent settings route | `/super-admin/error-log-settings` | `/error-log-settings` |
| Import/report/chart/tree/realtime/alerts/record CRUD | Excluded | Excluded |
| Offline cache/outbox | Excluded; online authoritative | Excluded; online authoritative |
| Temporary settings draft | Required dirty protection | Required dirty protection |

The settings entry and route require `ErrorLogSettings:View` alone, even without `SystemErrorLogs:View`. Web uses shared `MyForm`, Zod resolver, shared fields and feedback; Mobile uses AppForm. Pair EN/AR strings and preserve RTL, keyboard/focus and accessible touch controls. No fabricated diagnostics mock data. Customer education is Required after Phase 06 Verified at `documentation/plans/business/platform-error-logs/education/error-logs.md`. Physical-device acceptance is `PROD-026`; best-effort capture availability is `RISK-010` and actual production configuration is `PROD-017`.

## Execution and verification

Phase 00 requires four initial applied books, a current-files-only manifest, recipe registration/generation, `./documentation/plans/Check-Planning.ps1` and `./documentation/system/Generate-Documentation.ps1 -Check`. Then API, Web, Mobile, integrated verification and education proceed in contract order. API requires focused/full tests and a live Platform migration. Classify feature failures, inherited repository failures, environment blockers and manual release checks separately.


