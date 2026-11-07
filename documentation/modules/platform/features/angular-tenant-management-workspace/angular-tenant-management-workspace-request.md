# Super Admin Tenant Management — implementation request

## Request metadata and existing-system relationship

Plan web-angular-migration / S4-A1 — Super Admin Tenant Management parity.
Authority D42, actual Next source and exact version2 contract in decomposition/
angular-tenant-management-workspace.md. This is a new Angular client for an existing
Platform tenancy aggregate, not a new business workflow or permission model.
Existing API/Next/native/schema remain canonical; no changes to those runtimes.

## Approved execution decisions

P-001 Grid/Cards plus embedded P-003 five-tab create/edit. Role-only super_admin
matches controller; do not invent Tenants:* grants. Exact fields/nullable/date/
entitlement/rowVersion conventions and excluded API lifecycle are frozen in the
contract. Native conversion and new mock generator Excluded. Dashboard links only
activate with real route. Existing shared controls/native Signal Forms Option B.

## Business Rules Matrix

| ID | Rule | Primary owner | Stable result | Required verification |
| --- | --- | --- | --- | --- |
| TM-01 | Existing super_admin role; read-only bars writes | API authorization/UI recheck |401/403/readonly | denied route/action and actor replacement |
| TM-02 | Identifier/name and bounded optional contact/notes; valid status | Existing tenancy adapter | Tenant.InvalidRequest/InvalidSubscriptionStatus | native beneath-field validation, exact payload |
| TM-03 | Positive Int32 capacities, maxAdmins<=maxUsers and not below usage | Existing adapter/policy | Tenant.InvalidRequest/SeatLimitBelowUsage |0/overflow/relation/usage tests |
| TM-04 | Identifier uniqueness | Existing persistence | Tenant.DuplicateIdentifier | exact identifier mapping, no secret diagnostic |
| TM-05 | Fresh rowVersion; conflict does not overwrite draft | Existing optimistic concurrency | Tenant.ConcurrencyTokenRequired/ConcurrencyConflict | retained draft and explicit reload, no retry |
| TM-06 | Valid catalog-bound module/submodule hierarchy | ModuleCatalogPolicy/transaction | Tenant.InvalidEntitlement | defaults/null/empty, toggles, unknown codes and atomic payload |
| TM-07 | Source UI start/end required, real date/end>=start | Client; API authoritative nullable boundary | field validation | date-only roundtrip, exact UTC start/end, no rollover |
| TM-08 | No dispatched command replay; preserve actor/dirty/pending lifetime | Shared transport/owner state | not-sent/rejected/uncertain | double submit/actor cancel/uncertainty lock |

## Edge Cases & Validation Matrix

| Category | Decision | Enforcement | Required evidence |
| --- | --- | --- | --- |
| Malformed/missing | strict DTO/IDs/metadata/query bounds and empty input | service/native form | transport/validation tests |
| Duplicate | identifier scoped to existing server rule | server; mapped field |409exact code and explicit field precedence |
| Relationships | entitlement catalog independent from accessible modules | catalog service/selection/server | no fallback, stale/unknown/empty/forbidden cases |
| Lifecycle | archived edit rejected; archive/restore/purge UI Excluded by source | existing API; UI guard | archived response and precise feedback |
| Permissions | role-only current API and read-only | auth/guard/state | no invented grants, direct denied handlers |
| Concurrency | real rowVersion, explicit refresh | service/state |409retains draft, no silent retry |
| Network | timeout and uncertain dispatched outcome | transport/state | actor cancel and replay barrier |
| Draft/tabs | preserve hidden data; switch first invalid tab then focus | native form/shared container/tabs | browser all5tabs, dirty close, keyboard/errors |
| Dates/numbers | real date-only, exact UTC mapping, positive Int32 bounds | pure helpers/native schema | boundary/ordering/overflow/seat usage tests |
| Batch/files/import/report | Excluded; current Next Tenant screen has none | no placeholder | source parity review |
| Offline | online authoritative, no queued writes/storage | owner architecture | source check |
| Side effects | existing transaction/default company/audit/optional notification | server only | no duplicated client side effect or actual hosted writes |
| I18n/a11y/responsive | EN/AR390/1440, shared focus and contained scroll | shared controls | browser matrix |

## Impact Matrix

| Area | Decision |
| --- | --- |
| API/domain/schema/migration | N/A: consume retained tenancy endpoints and aggregate |
| Angular ownership | Extend Platform tenants with focused management types/service/states/components/page |
| Module catalog | Extend narrowly for tenant-entitlements; preserve accessible catalog ownership |
| Shared | Reuse controls/tabs/form/grid/dialog; extend only evidenced generic focus gap after MCP |
| Next/native | Retain source; new native UI Excluded |
| Navigation/dashboard | Real guarded Tenant route/sidebar/dashboard entry; summary remains owned read |
| Localization | Existing core/platform-tenants; canonical generation for actual gaps only |
| Tests/docs | Full Angular gates, actual browser journeys, bounded host reads, canonical evidence/education |

## Execution readiness and sequence

G0 actor/source/scope, G1 P-001/P-003 journey, G2 exact retained API/shared/ownership
and G3 concrete checks/no schema redesign are resolved in the contract. Remaining
G4 is external PROD-019/028/025/RISK-020. Phase00 generated/check/planning must pass
before runtime. Implement typed transport/helpers/tests, scoped read/lookup/editor,
five-tab shared composition and actual route, then full verification and canonical
Phase06; customer education only after Verified. No automatic commit/push/merge.
