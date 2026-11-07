# System Audit Trail — authorized execution request

Implement D42/S4-A3 under documentation/plans/business/web-angular-migration/decomposition/angular-system-audit-workspace.md; existing-feature client parity, no new business scope. No repeated product approval is needed for resolved current-source contracts. Phase00 generation/check/planning must pass before Angular runtime.

## Approved decisions

Global read-only role+grant viewer. Grid and field-change detail Required; every optional Cards/Chart/Tree/report/import/export/write/mock surface Excluded by source. Existing native retained/new native Excluded. No API/schema/dependency rewrite. See the complete version2 contract for fields/filter/cursor/error/locale/accessibility and acceptance.

## Existing-System Relationship Review

Platform audit read aggregates each module through IAuditTrailSource; reuse the canonical controller/query handlers and BuildingBlocks read abstraction. Current Next list/detail and native audit remain canonical consumers. Angular is an additional client, never a second audit writer. Exact current source is registered in required-files.json; shared Grid/RecordSummary/fields/dialogs cover presentation.

## Business Rules Matrix

| Rule | Primary owner | Outcome | Required test |
| --- | --- | --- | --- |
| Global read authority | Controller role and SystemAuditTrail:View |401/403; no unauthorized data|Guard/state browser matrix|
| Page/order/criteria | Existing query handler/validator |50cursor rows, opaque cursor, server order|Service/page-chain tests|
| Local calendar range | Client criteria conversion/server validation |UTC bounds or no request|DST/date tests|
| Detail identity | Service/parser and owner state |Fresh module+ID entry or bounded error|Mismatch/cancellation test|
| No writes | Actual read-only source workflow |No business mutation|Browser request assertion|

## Edge Cases & Validation Matrix

| Category | Scenario | Expected behavior | Stable outcome | Enforcement layer | Required test |
| --- | --- | --- | --- | --- | --- |
| Input shape / null / format / range | Malformed item/ID/date/action/page/filters/detail | Reject bad payload or invalid criteria; no coercion | Client bounded invalid-response/400; no GET for invalid dates | Parser/service/state | Malformed DTO and native date tests |
| Duplicate input / normalization | Trim search; duplicate composite keys; repeated module/entity filters | Preserve case; reject duplicate identities; deduplicate choices | Bounded invalid response | Parser/criteria | Composite/module-choice tests |
| Duplicate persisted data / uniqueness race | N/A: read-only, no uniqueness write | Retain module-local IDs as composite identity | N/A | Existing server | Same ID different module test |
| Relationship existence / active or archived state | Selected module changes entity options; missing detail | Reset entity; NotFound details cannot reuse prior record | 404 | Server detail/client state | Dependent filter/not-found test |
| Tenant / company / branch / site / warehouse scope | Global system history; actor replaced while loading | Server-derived scope; mask/cancel old data | 401/403 | Existing execution context and client scope | Actor cancellation/stale test |
| Permission / entitlement / actor state | super_admin lacks exact grant; normal user has grant | Deny unless role AND SystemAuditTrail:View; no HTTP | 403/redirect | Controller/guard/state | Role-and-grant matrix |
| Lifecycle / invalid, repeated, or out-of-order transition | N/A: viewer has no record state transition | No mutations | N/A | Existing audit writer unchanged | No write fixture assertion |
| Concurrency / stale revision / competing writes | New audit records while paging or refreshing | Cursor order API-owned; never reuse cursor after criteria/actor invalidation | Snapshot semantics | Existing source/client page chain | Refresh/criteria isolation tests |
| Idempotency / retry / double-submit | Repeated next/retry/detail while pending | One read per pending identity; retry read only | GET only | State | Pending/dedup/retry tests |
| Transaction rollback / commit failure | N/A: no commands or transaction in viewer | No write behavior | N/A | Existing writers unchanged | No business write assertion |
| Post-commit side-effect failure | N/A: no post-commit behavior | No event/job/session effect | N/A | Existing writer owns effects | Source review |
| Archive / restore / delete / dependency behavior | Deleted/Restored history action labels | Display only; no mutation action controls | N/A | Presentation/known enum | All action labels tests |
| Paging / filtering / sorting / deterministic ordering / query shape | Opaque cursor with fixed50unknown total; back/next/filter/reset | Server ordering; exact cached previous/exact next, no offset/jump/sort | 200/AuditTrail.InvalidCursor400 | Query handler/client page-chain state | Cursor/unknown-total/browser paging |
| Money / quantity / UOM / rounding / currency | N/A: history values are textual snapshots | Render old/new as text; no calculations | N/A | Presentation | Escaped snapshot rendering test |
| Dates / timezone / effective dates / closed periods | Local day boundaries including DST; invalid/inverted range | Correct UTC endpoints; no invalid GET | 400/native range feedback | Criteria helper/server validator | Local-day/DST/range tests |
| Bulk / import / partial-versus-atomic behavior | N/A: no import or bulk action in source | No placeholder | N/A | Contract | Source/no-control assertions |
| Integration duplicate / out-of-order / timeout / retry exhaustion / reconciliation | Late old response after actor/filter/page replacement | Ignore/cancel obsolete reads; finite timeout and explicit retry | Bounded error | Service/scoped state | Race/timeout/retry tests |
| File / security-sensitive input / ownership / unsafe paths or secrets | Module path/long snapshot strings/internal diagnostics | Encode module; text rendering; safe feedback | Bounded error, no raw detail | Service/presentation | Encoded path/redaction tests |
| Compatibility / versioning / existing-data migration | Existing v1nullable text and unknown label names | Preserve nullable text and humanize labels; no schema migration | 200 | Typed boundary | Valid payload/fallback tests |
| Cancellation / timeout / unexpected failure | Route destroy/detail close/network timeout | Abort owned read; no stale data or endless spinner | Bounded translated error | State/service | Destroy/close/timeout tests |
| Scale / N+1 / hot-path index / operability / replay-recovery | 50row cursor requests; detail returned array | No all-pages fetch or per-row detail; virtual data panel | Existing server keyset read | Server/source unchanged; client service | Request count/browser and source review |

## Impact Matrix

| Area | Decision | Existing owner / artifact | Required change | Evidence / required test |
| --- | --- | --- | --- | --- |
| Domain | Reuse | Existing module audit sources | No change | Contract and appropriate focused/full verification |
| Application / CQRS | Reuse | AuditTrailQueries handlers/validators | No change | Contract and appropriate focused/full verification |
| Infrastructure / persistence | Reuse | BuildingBlocks AuditTrailSource | No schema/index change | Contract and appropriate focused/full verification |
| Presentation / API contract | Reuse | SystemAuditTrailController v1 | No endpoint change | Contract and appropriate focused/full verification |
| Permissions / security | Reuse | SystemAuditTrail:View plus super_admin | Add exact Angular guard/nav/state checks | Contract and appropriate focused/full verification |
| Tenant / company / business scope | Reuse | AuditTrailReadScope | No client tenant bypass | Contract and appropriate focused/full verification |
| Migration / data compatibility | N/A | No domain/schema change | No migration | Contract and appropriate focused/full verification |
| Integration contracts / events / projections | Reuse | IAuditTrailSource and existing DTOs | Typed Angular parsing only | Contract and appropriate focused/full verification |
| Jobs / realtime / cache | N/A | No source viewer realtime/jobs | Only actor/filter-local page chain | Contract and appropriate focused/full verification |
| Module tests | Add | Angular owning feature tests | DTO/service/criteria/state/detail tests | Contract and appropriate focused/full verification |
| Architecture / integration tests | Reuse | Angular ownership/strict checks and browser harness | Full gate plus current owner regressions | Contract and appropriate focused/full verification |
| Web consumer | Add | Angular Platform system audit owner | Exact Grid/filter/detail plus guarded route/nav | Contract and appropriate focused/full verification |
| Mobile consumer | N/A | Existing native audit retained | New native conversion Excluded | Contract and appropriate focused/full verification |
| Documentation / runbook | Add | Canonical feature books/manifest/recipes | Generation/check/planning and education after Verified | Contract and appropriate focused/full verification |

## Explicit exclusions and verification

Import/report/export/mutations/files/realtime/mock generator Excluded on Angular because current source has none. Existing native unchanged; no native-device acceptance. Customer Education Required only after Phase06 Verified. Run full Angular gates,8rendered-client/reference cases plus meaningful negatives and hosted GET-only evidence. Existing PROD-019/028/025/RISK-020 keep exact external scope. No commit/push/deployment.
