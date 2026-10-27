# Platform user grants and company localization — Master plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | platform-user-permissions-and-company-localization |
| Owning module | Platform |
| Status | Closed |
| Primary owner | Product owner + Platform |
| Last reviewed | 2026-10-17 |

User approval: 2026-10-17, “تمام طبق التعديل ده مع تعديل اللغات”.
This authorizes the agreed company grant scope, plan drafting and implementation.
The [specification](SPEC_SUMMARY.md) and decisions own intent; source/tests own evidence.

## Outcome, ownership and scope

Extend existing Platform authorization and localization; no new module or template product.
Required: additive company user business grants; inherited/direct/effective view; English/
Arabic company UI text overrides and default. DEF-025 owns extra languages.
Excluded: direct deny, role-scope redesign, arbitrary translation keys, reports/import/export,
AI translation, offline administration and workspace generation.

## Business rules and exceptions

| Rule | Enforcement | Failure / acceptance |
| --- | --- | --- |
| Trusted current Tenant/company only | actor + scoped persistence | Reject foreign/missing scope; target must be active and accessible. |
| Effective = eligible roles union current-company direct business grants | token/live/catalog/audiences | Removal preserves roles; other company never inherits direct grant. |
| Direct grants use installed tenant-entitled business permissions only | catalog + delegation check | Unknown, duplicate, global/administrative or actor-unowned new grants rejected. |
| Existing direct grants remain visible if a module is unavailable | read model + mutation diff | Removal remains possible; entitlement still blocks use. |
| Replace whole direct selection with version | serialized transaction + expected revision | Stale edits return conflict; no silent overwrite. |
| Company text overrides shipped registered keys | scoped store | No filesystem write for company customization. |
| en/ar only; placeholders preserved | resource metadata + validator | Invalid culture/key/variables fail with field errors. |
| Explicit user language then company default then English | client runtime | Company default does not overwrite preference. |
| Missing company override uses shipped target then baseline | resolver | Reset deletes override, never shipped key. |

## Existing-system relationship and impact

Extend Platform token snapshot, live entitlement source, catalog, audience readers and
auth users UI. Reuse role mutation transaction/audit/session effects; never mutate roles
to store direct exceptions. Extend current localization tools and both client resource
runtimes. Platform owns new persistence/migrations; no foreign module tables or EF types.
Company grant changes revoke affected sessions after atomic stamp/refresh updates.

## Architecture and delivery design

Platform Domain owns a grant-set aggregate and entries; Infrastructure owns SQL storage.
One set per Tenant/company/user, unique entry per permission, integer revision concurrency.
Read includes inheritance source labels. Current actor sets scope; clients submit user,
selection and expected revision only. Target membership/company-access validated.
Transaction-owned lock prevents first-write races. Audit + grants + stamp/revocation commit
atomically; notification/session effects are post-commit.

Localization uses durable company settings and key overrides, registered client resource
catalogs, bounded search/paging, culture mapping and scoped cache identities. Runtime bundle
read requires a valid company session, while management uses separate exact actions.
Baseline bundles remain safe offline; company caches must not cross scope.

### Feature Decomposition Gate

| Slice | Decision | Feature ID | Screen/Workflow Contract | Boundary |
| --- | --- | --- | --- | --- |
| S1 Company user permission grants | Single feature | user-company-permissions | documentation/plans/business/platform-user-permissions-and-company-localization/decomposition/user-company-permissions.md | One grant assignment workflow and all effective-permission consumers. |
| S2 Company UI localization | Single feature | company-ui-localization | documentation/plans/business/platform-user-permissions-and-company-localization/decomposition/company-ui-localization.md | Company language/default/text management and both runtime consumers. |

Each slice is one coherent feature; the two different workflows remain independently
testable and execute in dependency order. The [roadmap](EXECUTION.md) is status authority.

## Verification, migration and rollout

Verify domain grants, handler validation/delegation, stale/no-op/rollback behavior,
company/tenant token and live/cached/catalog/audience isolation; API controller contracts;
Web/Mobile selection/source/dirty/error/read-only journeys; runtime localization fallback,
reset and scope switches. Use registered module migration script, inspect SQL operations
and apply against development DB before persistence completion. No production deployment
authorized. Additive schema starts empty; roles/resources retain existing behavior until
a company opts in. Rollback disables new UI/endpoints before reverting empty/new tables;
do not destructively downgrade populated production overrides without export/forward fix.

## Gates and review

| Gate | Design status | Evidence |
| --- | --- | --- |
| G0 Scope/owner | Pass | Requester decisions; Platform existing-system review. |
| G1 Business | Pass for S1/S2 | Explicit rules, exact actions and lifecycle in S1 contract. |
| G2 Architecture | Pass for S1/S2 | Scoped aggregate, serialized transaction, revision, session and audience contract. |
| G3 Clients | Pass for S1/S2 | P-006 both clients, shared form/list primitives and existing role references. |
| G4 Delivery | Pass for the requester-authorized automatic scope | Applied development migrations; full API, live HTTP/SQL, Web build/browser and Mobile automated/export evidence. Native acceptance remains PROD-026; full repository exceptions FOLLOW-006/FOLLOW-007 remain open. |
| S2 | Closed for authorized automatic scope | Dedicated v2 contract, applied books, actual-file manifest, Phase 06 Verified and Phase 07 education; see company-ui-localization-evidence.md. |

Adversarial review: addressed UI-only grants, company spoofing, absent target access,
unknown/global claims, privilege escalation, stale replacement and inherited-grant removal.
No external providers, finance/stock calculation, billing, public legal promises or money
migration are introduced. Resource scale is installed permission catalog size; cap submitted
selection at 2000, search/filter in the editor and bound localization rows separately.
Requester delivery amendment 2026-10-17: implement and automatically verify both slices; physical mobile acceptance will be performed later by the requester. PROD-026 owns that release check. Native verification is not claimed; remaining device evidence does not block authorized S2 implementation.

Closure 2026-10-17: S1 and S2 completed for this exact authorized automatic scope. Customer education is under education/. This status does not close PROD-026, FOLLOW-006 or FOLLOW-007, authorize a production migration/deployment, or assert a complete repository-wide gate pass.
