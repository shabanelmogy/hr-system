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
→ implementation phases
→ quality gates
→ approved implementation request
→ implementation + verification
→ customer education / video pack per completed customer-visible phase
→ phase closure
```

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

1. API work follows `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`.
2. Cross-platform feature work follows `documentation/system/README.md` and the closest reviewed reference.
3. Reusable frontend rules belong in the Web architecture/reference guides.
4. Module-specific rules belong in the owning `documentation/modules/<module>/` package.
5. Generated documentation is regenerated; it is never edited manually.
6. After each customer-visible implementation phase is verified, create/update its
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
├── education/
│   └── <phase-or-slice-id>.md
└── diagrams/
```

Then register the plan in `PLAN_REGISTRY.md`.

The authoritative creation sequence is `PLAN_CREATION_PROTOCOL.md`. Do not jump
straight from an idea to `PLAN.md` for a new capability or substantial rebuild.

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
