# Platform Browser Authentication — Phase 00 Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | platform-browser-authentication |
| Operating mode | Existing Platform session correctness increment; later browser binding separately gated |
| Plan ID | web-angular-migration |
| Authorized slice / phase | S0-AUTH-R2 — Browser transport / API implementation and verification; R1 Verified |
| Canonical plan | documentation/plans/business/web-angular-migration/PLAN.md |
| Screen/Workflow Contract | documentation/plans/business/web-angular-migration/decomposition/platform-browser-authentication.md |
| Owning module / package | Platform / documentation/modules/platform |
| Manifest | documentation/modules/platform/features/platform-browser-authentication/required-files.json |
| Runtime authorization | R2 browser transport authorized under BROWSER_RUNTIME_READINESS; no new client UI/schema |
| Applied reference | Existing Platform owner, not an unrelated feature's business scope |

## Execution request

Complete Phase 00 current evidence, four applied profiles, matrices, manifest,
feature recipes and readiness findings. D17 Cookies/no-BFF are approved; do not
re-decide them. BROWSER_AUTHENTICATION_CONTRACT in the canonical plan owns target
routes and cookie/CSRF behavior. The requester subsequently authorized the proposed
session repair. SESSION_RUNTIME_READINESS.md freezes this runtime increment's gates,
rules, tests and rollback. No schema change or browser Cookie endpoint is included
in this increment. The evidence artifact owns current findings and test results.

## Existing-System Relationship Review

Primary relationship: reuse/extend existing Platform. Platform owns identity,
sessions, JWT, persistence and tenant/company access. Presentation sends ISender
messages to current Application handlers and Infrastructure adapters. New browser
transport must not duplicate identity business rules. Current JSON/bearer routes
and Next/native behavior are retained. RISK-018 records actual source drift.
Current source is distinct from requested Cookies/antiforgery behavior.

### Ownership, contracts, and reuse inventory

| Item | Current owner | Disposition |
| --- | --- | --- |
| Refresh/session rows | PlatformDbContext and PlatformIdentityAuthenticationAdapters | Extend only for required RISK-018 reconciliation |
| Commands/session DTOs | Platform Application Authentication/Orchestration | Reuse; sanitize browser response in its adapter |
| JWT/live eligibility | PlatformIdentityServiceCollectionExtensions; SessionValidationService | Reuse; no bearer-to-cookie downgrade |
| Errors | AuthenticationResultExtensions | Reuse stable ProblemDetails |
| Cookie/CSRF primitives | ASP.NET Core antiforgery/ChunkingCookieManager | Assess module-local integration; no extra service |
| Visual shells | Existing Next/native shared forms | Reuse unchanged; new visual views Excluded |
| Cross-module events | None needed | N/A — no foreign business ownership/new durable effect |

## Approved product decisions translated for execution

| Concern | Contract |
| --- | --- |
| Ownership/scope | Existing Platform live user/session/tenant/company authority |
| Fields | Existing auth request records; sanitized SessionContext; no browser access/refresh JSON |
| Permissions/read-only | Existing auth/challenge/access checks; no new permission grant |
| Lifecycle | Login/selection/session/refresh/switch/logout; races require actual persistence proof |
| Web/Mobile visual views | Grid/Table/Cards/Tree/Detail/Chart/Report/Import/Export Excluded independently on both |
| Verification | Browser HTTP and retained Next/native auth regression Required |
| Realtime | Existing limited token/scope reused; no new topic |
| Offline | Online authoritative; current native lease unchanged; no new token web storage |
| Education | N/A — technical unit has no new user screen; actual S2 journey owns education |

### Business Rules Matrix

| ID | Rule | Primary owner/enforcement | Outcome | Required test |
| --- | --- | --- | --- | --- |
| BR-01 | Only eligible account/tenant/company gets a session | Platform Application + identity/access adapters | Existing auth errors / verified scope | Actual adapter scope denial |
| BR-02 | Selection challenge short-lived and one-use | Selection Application + database consume | Invalid/expired challenge denied | Parallel/repeated selection |
| BR-03 | Session credentials stay HttpOnly | Browser Presentation/transport | Sanitized context, no secret JSON | Cookie/leak assertions |
| BR-04 | Cookie mutations need antiforgery/origin | Platform/Host security boundary | 400/403 before command effects | Negative HTTP/browser cases |
| BR-05 | Explicit bearer cannot downgrade to cookie | Platform authentication policy | Invalid/ambiguous identity denied | Header/cookie isolation |
| BR-06 | Refresh session/lifetime/grace policy enforced atomically | Platform policy + database adapter | Canonical conflict/rejection, RISK-018 reconciled | SQL rotation/race |
| BR-07 | Switch affects only owned replaced session | Platform access/session adapter | Verified target; other sessions retained | Multi-session switch |
| BR-08 | Cleanup distinct from confirmed revoke | Session adapter + browser transport | Idempotent result or explicit outage | Refresh/logout/lost response |
| BR-09 | Temporary outage cannot erase newer context | Client session owner + API errors | Unavailable distinct from expiry | Client generation tests |
| BR-10 | No money/approval/entity historical correction added | N/A — auth transport | Existing business domain unchanged | Scoped diff |

### Edge Cases & Validation Matrix

| Category | Scenario / expected result | Enforcement | Required verification |
| --- | --- | --- | --- |
| Input shape/null/format/range | Invalid credentials/company/pair rejected; nullable DTO not a waiver | Validators/Application | Empty/boundary input |
| Duplicate input/normalization | Existing username/email normalization; no account creation | Identity adapter | Identifier cases |
| Persisted uniqueness race | No new natural-key entity; refresh writes still serialized | Database/adapter | SQL competing rotation |
| Relationship existence/active/archived | Revoked tenant/company/user membership fails closed | Session/access owner | Live scope denial |
| Tenant/company/branch/site/warehouse | Trusted tenant/company; other contexts N/A for issuance | Context/session owner | Wrong scope |
| Permission/entitlement/actor | Auth not permission; locked/disabled account denied | Platform policy | Denial |
| Lifecycle/repeated/out-of-order | One-use selection, expired/reused refresh, idempotent logout | Application/adapter | Transition tests |
| Concurrency/stale/competing writes | Parallel refresh/switch/logout and lost responses | Database/client | Actual race proof |
| Idempotency/retry/double-submit | One owned attempt; no blind material-write replay | Client/Application | Conflict/timeout recovery |
| Transaction rollback/commit failure | No partial revocation without valid atomic outcome | Persistence | Failed-update rollback |
| Post-commit side effects | Existing best-effort limits under RISK-005 retained | Existing Platform owner | No false durability claim |
| Archive/restore/delete/dependencies | No entity CRUD; disabled/deleted eligibility enforced | Session owner | Disabled account |
| Paging/filter/sort/query/order | N/A — no entity list; authorized bounded options only | Selection owner | Option scope |
| Money/quantity/UOM/rounding/currency | N/A — no monetary or quantity rule | Business owners unchanged | Scope audit |
| Dates/timezone/periods | UTC expiry; Cookie retention separate from JWT validity | TimeProvider/token owner | Expiry boundary |
| Bulk/import/partial vs atomic | N/A bulk/import; Cookie pair still coherent | Transport | Partial Cookie |
| Integration duplicate/order/timeout/exhaustion | Late context/outage/reconnect; no replay | Client/transport | Recovery cases |
| Files/security-sensitive input/paths/secrets | Bounded headers, origin allowlist, redacted logs; no files | Transport/Host | CSRF/leak/overflow |
| Compatibility/version/migration | Existing bearer wire retained; no planned schema change | Platform/all clients | Next/native/schema diff |
| Cancellation/unexpected failure | Uncertain outcome not called rollback; cleanup distinct | Application/client | Lost response |
| Scale/N+1/index/operability/recovery | Measure maximum claims/header and actual session SQL; inspect existing indexes | API/Security | Size/serialization gate report |

### Impact Matrix

| Area | Decision | Existing owner / required change |
| --- | --- | --- |
| Domain | Reuse | PlatformRefreshToken/session policy; no new aggregate |
| Application/CQRS | Reuse | Existing auth commands and SessionContext query |
| Infrastructure/persistence | Change | RISK-018 actual refresh/logout correctness; prove serialization first |
| Presentation/API | Add | Target browser endpoint/DTO/Cookie adapter, not implemented |
| Permissions/security | Extend | Cookie auth/CSRF/origin boundary; no new claim |
| Tenant/company/business scope | Reuse | Current live eligibility |
| Migration/data | N/A | No model change planned; reconsider if actual implementation changes it |
| Integration contracts/events/projections | Reuse | Existing Platform contracts; no new event/projection |
| Jobs/realtime/cache | Reuse | Current limited realtime token/cleanup; no new cache |
| Module tests | Extend | Real adapter/controller/session/CSRF tests required |
| Architecture/integration tests | Extend | Auth policy/host/browser isolation required |
| Web | Extend | Future HTTP harness; current Next UI unchanged |
| Mobile | Reuse | Native bearer regression; no cookie feature |
| Documentation/runbook | Add | Applied profiles/manifest/recipes/readiness report |

## Verification and handoff

Check planning/tooling regressions, final manifest paths and recipes/diff/links.
Actual implementation requires owning API gates, SQL/browser lifecycle/CSRF/races
and retained-client regression. Earlier 31 Platform + 50 Web passes are baseline
only. Phase 06 is not Verified; Phase 07 not started. DEC-027/RISK-018 own remaining
non-release findings. The subsequent three feasibility probes passed; existing
migrations were applied only to an isolated disposable SQL test database and it
was removed. No new model/migration or application configuration changed. See
[preflight proof report](verification/PREFLIGHT_PROOF_REPORT.md) for bounds and
the distinction between proven primitives and pending actual adapter acceptance.
