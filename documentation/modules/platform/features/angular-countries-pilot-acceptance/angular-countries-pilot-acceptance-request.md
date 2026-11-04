# S3-A8 implementation request

Existing-feature migration acceptance. Plan web-angular-migration; exact Single feature S3-A8, Platform evidence/ReferenceData business owner. Canonical decomposition and PILOT_CONTRACT.md own frozen intent. Implement current realtime increment, then verify remaining full pilot before business-route enablement. No Next work under D35.

## Approved product decisions and Existing-System Relationship Review

Extend existing Angular Countries consumer; retain API owner, global schema, permissions and five current views. Reuse AuthSession, BrowserAuthService, createScopedRead and shared UI public APIs. New generic Platform realtime data capability supplies validated hints; no domain types in Shared. API contracts remain canonical and no new endpoint/table/provider is created. Source paths appear in required-files.json.

## Business Rules Matrix

| ID | Rule | Primary owner | Outcome | Required test |
| --- | --- | --- | --- | --- |
| BR-001 | Exact actor countryReadAllowed and server permission remain authoritative | CountryReadState/API | No forbidden requests | Permission/actor lifetime tests |
| BR-002 | Events only invalidate finite reads | CountryReadState | Authoritative fresh snapshot, drafts preserved | Remote/reconnect/detail/draft browser tests |
| BR-003 | No stale async effects or persisted token | Platform realtime | Dispose/mask old lease | Token/import/start/disposal tests |
| BR-004 | Never replay mutations; bounded burst dedup/retry | Platform and Countries read state | Read-only reconciliation | Burst/pending/failure tests |

## Edge Cases & Validation Matrix

| Category | Scenario / enforcement / outcome | Verification |
| --- | --- | --- |
| Input shape / null / format / range | Validate event GUID/date/resource/action/entityId; invalid ignored | Envelope cases |
| Duplicate input / normalization | Bounded512 event IDs per lease; no domain normalization from events | Duplicate/eviction cases |
| Persisted uniqueness race | N/A new rules: retain server mutation constraints | Existing S3-A3/A7 evidence |
| Relationship existence / active or archived | Remote archive affects authoritative next read; existing details404 | Detail refresh case |
| Tenant/company/branch/site scope | Immutable session lifetime; server hub groups | Replacement/cancellation case |
| Permission / entitlement / actor | No connection without Countries view;401/403 stop, revocation resync | Direct callback/denial cases |
| Lifecycle/out-of-order | Hints not patches; all countries actions trigger refresh | Unknown action/order cases |
| Concurrency/stale revision | No revision API invented; preserve editor values | Dirty editor browser case |
| Idempotency/retry/double-submit | Reads only, one retry timer, no command retries | Retry/cancellation case |
| Transaction rollback/commit failure | N/A API persistence unchanged | Current owner evidence |
| Post-commit side-effect failure | Existing jobs own delivery; reconnect refetch reconciles missed hints | Reconnect case |
| Archive/restore/dependency | Retain S3-A4; reconcile list/detail on hint | Countries refresh case |
| Paging/filter/sort/order/query | Retain criteria and server paging/clamp | Criteria refresh case |
| Money/quantity/UOM/rounding | N/A global Country read hints contain no quantities | Source contract |
| Dates/timezone/effective/closed periods | Event time validation only, no timestamp ordering assumption | Out-of-order case |
| Bulk/import/atomicity | Retain S3-A7; do not touch parser/drafts/commands | Dirty import existing evidence + lifetime tests |
| Integration duplicate/order/timeout/exhaustion | One timer capped30s only while current; successful start reconciles | Connection tests |
| File/security/unsafe paths/secrets | Exact configured HTTPS origin; tokens never persisted/logged | Origin/token tests |
| Compatibility/version/migration | Existing envelope; unknown actions invalidate; no DB change | Unknown action case |
| Cancellation/timeout/unexpected | Dispose old connection; token10s; late effects suppressed | Lifetime tests |
| Scale/N+1/operability/recovery | Lazy client; burst250ms; one trailing read; bounded dedup | Burst/pending/full build |

## Impact Matrix

| Area | Decision | Evidence/change | Check |
| --- | --- | --- | --- |
| Domain | Reuse | Countries unchanged | Source audit |
| Application/CQRS | Reuse | Existing event source | Source audit |
| Infrastructure/persistence | Reuse | Existing hub/jobs | Source audit |
| Presentation/API | Reuse | Existing token and hub | Transport tests |
| Permissions/security | Extend consumer | Existing immutable actor and permissions | Denial/disposal tests |
| Tenant/company/scope | Reuse | AuthSession identity | Lifetime tests |
| Migration/data compatibility | N/A | No schema/persisted meaning change | No EF migration |
| Integration/events | Add consumer | Platform public hint stream | Envelope tests |
| Jobs/realtime/cache | Extend | Countries invalidation/reconcile | Pending/burst tests |
| Module tests | Add | Meaningful service/read-state tests | Focused tests |
| Architecture/integration | Reuse/extend evidence | Public API + browser fixture | Angular full check |
| Web | Extend | Current development Countries | Browser journeys |
| Mobile | Excluded new implementation | Current native retained | Source boundary |
| Documentation/runbook | Extend | Four books/manifest/recipes | Generation/planning |

## Import/report/offline decisions

Web Import Required as implemented S3-A7: local XLSX,first worksheet5MiB/100rows,six ordered headers,no formulas; typed {countries} one atomic POST201count,super_admin+View/Create,writable; no replay. Required managed Crystal report retains S3-A6 catalog/ACL/PDF contract. All five views Required for full pilot. New native implementation Excluded; existing native ownership retained. Angular offline reads/writes/outbox/persisted draft Excluded; operations require live authorization. No change to API/source contracts.

## Verification and handoff

Phase00 generation/check/planning before code. Full Angular checks and actual browser realtime/dirty/authority journeys after implementation. Full S3-A8 Phase06 remains Not Verified until every Required pilot exit, host and size gate has evidence; no education before Verified. Existing central notes own release-only issues, and current incomplete work remains Active.

## Current acceptance — 2026-11-01

Non-report required pilot exits are Verified; see verification/FINAL_ACCEPTANCE.md.
Fresh253fixture browser/7actual hosted cases and full Angular checks pass. Actual
catalog503 remains PROD-028; no complete Phase06/Phase07/route enablement claim.
