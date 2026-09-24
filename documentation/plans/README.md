# ERP Plans — Central Planning Reference

Canonical project path: `documentation/plans/`.

This folder is the single entry point for planning new ERP business capabilities before implementation starts. It does not replace the canonical API, Web, Mobile, module, or generated feature documentation. It decides **what should be built and why**, then hands the approved plan to those implementation workflows.

## Purpose

Use this system for any business area: Accounting, HR, CRM, Inventory, POS, Reference Data, Reporting, Platform, or a future module.

The goal is not to write the longest plan. The goal is to reach an implementation-ready plan with explicit ownership, business rules, edge cases, contracts, UX, security, data, integrations, tests, rollout, and evidence.

## Canonical files

| File | Responsibility |
| --- | --- |
| `PLAN_CREATION_PROTOCOL.md` | End-to-end method from interview through evidence, spec, plan, review, and handoff. |
| `PLANNING_METHOD_PROVENANCE.md` | Records which external prompt/method ideas were adopted, adapted, rejected, or remain pending review. |
| `BUSINESS_PLANNING_STANDARD.md` | Mandatory workflow and decision order for every business plan. |
| `BUSINESS_DISCOVERY_INTERVIEW.md` | Discovery question framework used before G0 can close. |
| `EVIDENCE_AUDIT_STANDARD.md` | Evidence-first audit that separates current behavior, target intent, assumptions, and unknowns. |
| `EVIDENCE_TEMPLATE.md` | Evidence ledger template for a plan. |
| `SPEC_SUMMARY_TEMPLATE.md` | Pre-plan specification produced before implementation phases are written. |
| `BUSINESS_PLAN_TEMPLATE.md` | Copyable master template for a new business capability. |
| `FEATURE_DECOMPOSITION_TEMPLATE.md` | Mandatory child Screen/Workflow Contract template when an authorized slice is decomposed into materially different feature workflows. |
| `CUSTOMER_EDUCATION_TEMPLATE.md` | Post-implementation customer guide + training/demo + video-script template used to close customer-visible phases. |
| `PLAN_QUALITY_GATE.md` | Gates that decide whether a plan is ready to implement. |
| `PLAN_REGISTRY.md` | Index of active, approved, deferred, and closed plans. |
| `New-BusinessPlan.ps1` | Scaffolds a new business plan from the master template. |
| `Check-Planning.ps1` | Validates the planning structure, business-plan folders, and canonical note IDs. |

## One planning flow

```text
Business request
→ small-batch discovery interview
→ repository/current-system evidence audit
→ gap + assumption confirmation
→ product/design/privacy/commercial applicability review
→ pre-plan specification
→ approval to plan
→ scope and outcome
→ bounded-context ownership
→ existing-system relationship review
→ domain model and lifecycle
→ business rules and edge cases
→ tenant/company/RBAC/security
→ data and migration design
→ API/CQRS/contracts/events
→ Web and Mobile journeys
→ integrations/reporting/import/export
→ performance/observability/reliability
→ test matrix
→ rollout and migration
→ risks / Required-Deferred-Excluded decisions
→ capability plan (`PLAN.md`)
→ one canonical slice roadmap (order/status)
→ one feature execution contract at a time
→ UI Pattern Gate for every Web/Mobile screen
→ implementation phases
→ quality gates
→ Feature Decomposition Gate per authorized slice
→ approved implementation request
→ implementation + verification
→ customer education / video pack per completed customer-visible phase
→ phase closure
```

The authorities are deliberately separate. `PLAN.md` records capability scope,
ownership, and business decisions. A slice execution document records dependency
order and the single `ACTIVE_FEATURE_STEP`. A feature contract records one
feature's API → Web → Mobile → integrated live verification → documentation/
closure. API/Web/Mobile/system profiles and tests are the evidence ledger. Link
between these documents; do not copy their screen/API detail into multiple places.

Only one feature may be `Active`. Every later feature is `Queued` or `Blocked`
until the active feature is `Verified` and its documentation/closure stage is
`Closed`.

## Plan status vocabulary

Use exactly these states:

| Status | Meaning |
| --- | --- |
| `Draft` | Problem and scope are still being discovered. |
| `Business Ready` | Ownership, lifecycle, rules, edge cases, and outcomes are frozen. |
| `Architecture Ready` | Data, contracts, integrations, security, and cross-module impact are frozen. |
| `Implementation Ready` | The overall capability has passed G0–G4 for its implementation/release scope. |
| `In Progress` | Runtime implementation has started. |
| `Verified` | Required automated/manual evidence is green. |
| `Closed` | Implementation, technical documentation reconciliation, and required customer education/video documentation are complete. |
| `Deferred` | Intentionally postponed with owner and reopening trigger. |
| `Cancelled` | Explicitly abandoned with reason; no runtime placeholder remains. |

Do not use `almost ready`, `mostly complete`, or vague equivalents.

For large dependency-ordered capabilities, a plan may separately state
`Slice N execution-ready — later slices/release remain gated` under the
slice-authorization rules in `PLAN_QUALITY_GATE.md`. That is not a replacement for
the overall `Implementation Ready` status.

## Required / Deferred / Excluded

Every optional capability must be classified explicitly per platform and release:

- `Required`: must exist in the current delivery and pass its gates.
- `Deferred`: accepted requirement scheduled later, with reason, owner, and trigger.
- `Excluded`: deliberately outside the contract, with a business/domain reason.

Silence is not a decision.

## Relationship to existing documentation

After a plan reaches `Implementation Ready`, or after a bounded slice receives
explicit execution authorization under `PLAN_QUALITY_GATE.md`:

1. Complete the Feature Decomposition Gate for the exact authorized slice. A slice
   with materially different domain/UI workflows must be split into coherent feature
   execution units before an implementation scaffold is created; a coherent slice
   records `Single feature` explicitly.
2. API work follows `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`.
3. Cross-platform feature work follows `documentation/system/README.md` and the closest reviewed reference.
4. Reusable frontend rules belong in the Web architecture/reference guides.
5. Module-specific rules belong in the owning `documentation/modules/<module>/` package.
6. Generated documentation is regenerated; it is never edited manually.
7. After each customer-visible implementation phase is verified, create/update its
   Customer Education Pack from `CUSTOMER_EDUCATION_TEMPLATE.md` before marking
   that phase `Closed`.

The execution system formalizes this as Phase 06 Verification & Acceptance followed
by Phase 07 Customer Education & Closure. Phase 07 cannot start until Phase 06
records `Verified`.

The planning folder owns intent and approved decisions. Runtime source and canonical applied profiles remain the evidence for what is actually implemented.

## Creating a new plan

Create a folder under `documentation/plans/business/<plan-id>/` and start from `BUSINESS_PLAN_TEMPLATE.md`.

Recommended shape:

```text
documentation/plans/business/<plan-id>/
├── DISCOVERY.md
├── EVIDENCE.md
├── SPEC_SUMMARY.md
├── PLAN.md
├── DECISIONS.md
├── RESEARCH.md
├── decomposition/
│   └── <feature-id>.md
├── education/
│   └── <phase-or-slice-id>.md
└── diagrams/
```

Then register the plan in `PLAN_REGISTRY.md`.

The authoritative creation sequence is `PLAN_CREATION_PROTOCOL.md`. Do not jump
straight from an idea to `PLAN.md` for a new capability or substantial rebuild.
Every executable feature step, including a `Single feature` slice and a legacy
feature revalidation, gets one current version 2.0 contract from
`FEATURE_DECOMPOSITION_TEMPLATE.md`. A `Decompose` slice creates one such contract
per child feature; it does not use one umbrella contract for materially different
workflows.

Before any runtime scaffold, create exactly one feature contract for the current
step. Complete its UI Pattern Gate with one row per Web and Mobile screen. Every
row must name an active catalog Pattern ID (or stop as `Candidate`), exact source
reference, platform R/D/E capabilities, states, offline/mock policy, scope, and
responsive/accessibility behavior. A shared-component list alone does not pass.

External prompts are inputs to this method, not parallel authorities. Their
adoption status is tracked in `PLANNING_METHOD_PROVENANCE.md`.

Before handoff run:

```powershell
./documentation/plans/Check-Planning.ps1
```

## Non-negotiable rule

Do not start business implementation while a gate required by the exact authorized
scope is red. A slice may start before overall G4 only through the explicit
slice-authorization rule in `PLAN_QUALITY_GATE.md`; production/release-only G4
findings remain blocking for release. When new evidence invalidates an approved
assumption, reopen the affected gate, update the plan, and only then continue.

## Central production/deferred notes

Important non-implemented findings are centralized under `notes/`.

- `notes/PRODUCTION_NOTES.md`
- `notes/DEFERRED_ITEMS.md`
- `notes/KNOWN_RISKS.md`
- `notes/FOLLOW_UPS.md`
- `notes/DECISION_BACKLOG.md`

Any plan or guide may link to these registries, but should not create a second
competing list for the same item. Keep one canonical note ID and link to it.

When a note is resolved, update its status and closure evidence instead of deleting
its history.
