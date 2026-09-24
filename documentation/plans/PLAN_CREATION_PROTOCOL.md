# Plan Creation Protocol

This is the canonical protocol for turning an idea, business request, or major
rebuild into an implementation-ready ERP plan.

The protocol deliberately separates discovery, repository evidence, specification,
and planning. A plan must not be used to invent facts about the current system.

## Core sequence

```text
Request
-> Interview
-> Current-system evidence audit
-> Gap / assumption confirmation
-> Product + design + compliance applicability review
-> Spec summary
-> User approval to plan
-> Master plan
-> Adversarial review
-> G0-G4
-> Feature Decomposition Gate for the authorized slice
-> Implementation Ready
   OR explicit bounded Slice execution authorization under PLAN_QUALITY_GATE.md
```

## P0 — Classify the request

Before asking detailed questions, classify the work:

- new business capability;
- substantial rebuild of an existing capability;
- existing-feature change;
- corrective/maintenance change;
- research/decision only.

New capabilities and substantial rebuilds use the full protocol. Small corrective
changes may reuse an already-approved plan, but any new material risk, deferred
work, production gate, or open decision still receives a central note ID.

## P1 — Interview before solutioning

Use `BUSINESS_DISCOVERY_INTERVIEW.md`.

Interview rules are mandatory:

1. Ask in small batches of 3-6 related questions.
2. Ask the highest-cost ambiguity first.
3. After each batch, reflect the current understanding in 1-2 sentences.
4. When an answer is vague, offer 2-3 concrete choices, recommend a default, and
   explain the trade-off.
5. Flag contradictions with earlier decisions immediately.
6. When the requester does not know, record a clearly labelled `ASSUMPTION`, its
   owner, impact, and validation trigger; do not silently guess.
7. Preserve explicitly selected technologies and constraints.
8. When a framework/library/provider version affects the design, verify the exact
   version and current authoritative documentation before freezing the decision.

Do not write the implementation plan during the interview.

## P2 — Investigate the current system

Apply `EVIDENCE_AUDIT_STANDARD.md` before declaring what already exists.

The audit must distinguish:

- `VERIFIED CURRENT` — supported by repository/runtime/configuration evidence;
- `REQUESTED TARGET` — desired future behavior;
- `ASSUMPTION` — temporary decision because evidence/answer is unavailable;
- `UNKNOWN` — unresolved fact that still needs an owner/answer;
- `NOT APPLICABLE` — explicitly reasoned out.

This prevents a requested feature, old plan, stale documentation, or copied
reference from being described as current system behavior.

## P3 — Confirm gaps

After discovery and evidence collection, stop and reconcile the unknowns.

For every material gap choose exactly one outcome:

1. user/product decision;
2. verified repository/external evidence;
3. explicit assumption with validation trigger;
4. Deferred with owner/reopen trigger;
5. Excluded with reason.

Blocking gaps for a Required capability cannot survive into
`Implementation Ready`.

## P4 — Applicability reviews

Do not force every review onto every feature. Decide applicability explicitly.

### Product and design

Review:

- target persona and primary job-to-be-done;
- any prepared UI/design reference supplied through Google Docs, Figma, images,
  prototypes, screenshots, or another external source, and which parts are visual
  guidance versus approved product behavior;
- first-use/onboarding and returning-user journey;
- information hierarchy and primary/secondary actions;
- create/edit/view/list/filter parity for structured data;
- empty/loading/error/forbidden/read-only/offline states;
- responsive/mobile/RTL/accessibility requirements;
- shared design-system components before local UI;
- destructive actions, confirmations, unsaved changes, and recovery;
- whether the workflow requires table, cards, tree, calendar, timeline, report,
  dashboard, or another representation and why.

UI is downstream of business rules: design must make the frozen lifecycle and
permissions understandable; it must not invent them.

Prepared UI is an implementation/design input, not a source of business truth.
When translating an approved UI into Web/Mobile:

1. reuse the application's existing shared/reusable components first;
2. when an existing shared component is close, extend it with a generic,
   backward-compatible capability rather than creating a look-alike;
3. create a new shared/reusable component only when no existing component can
   satisfy the requirement cleanly;
4. keep feature-local components only for genuinely domain-specific composition;
5. do not copy external mockup structure blindly when it conflicts with the
   approved lifecycle, permissions, accessibility, RTL, responsive behavior, or
   canonical project design system.

### Privacy and data handling

When personal, employee, customer, authentication, device, telemetry, location,
file, or other sensitive data is involved, review:

- data collected and its business purpose;
- source and destination/storage owner;
- third parties/SDKs/processors receiving it;
- access control and sensitive logging/redaction;
- deletion/export/consent controls that actually exist versus requested controls;
- retention requirement or unresolved retention decision;
- target audience, jurisdiction, residency, and compliance unknowns.

Never claim a privacy control exists unless evidence proves it. Missing policy
inputs become `DEC-*` or `RISK-*` items rather than invented text.

### Commercial and terms impact

When the capability affects accounts, subscriptions, entitlements, billing,
third-party services, user-generated content, AI/automation, suspension,
termination, or service limits, review:

- who may use the service/capability;
- account responsibilities and authorization model;
- paid/free plan behavior and actual enforced limits;
- external provider terms that flow through;
- generated/user content ownership or licensing questions;
- automated/AI output limitations;
- suspension/termination/data-deletion mechanisms that actually exist;
- unresolved legal entity, governing law, age, pricing/refund, liability, dispute,
  and contact details when publication/legal copy is in scope.

Do not invent a fee, legal right, restriction, refund, deletion flow, or user
control merely because a generic Terms/Privacy template normally contains it.

## P5 — Produce the pre-plan specification

Before writing `PLAN.md`, complete `SPEC_SUMMARY.md` with:

1. product/business outcome;
2. users/personas and authority;
3. in-scope / Deferred / Excluded;
4. primary journeys;
5. domain/source-of-truth summary;
6. architecture/integration summary;
7. Web/Mobile decisions;
8. evidence-backed current-state summary;
9. all `ASSUMPTION`s;
10. all open risks/unknowns.

At this point the requester should be able to review the specification without
reading implementation phases.

## P6 — Approval to write the implementation plan

For interactive planning, explicitly ask whether the requester is ready for the
specification to be turned into an implementation plan.

For already-authorized repository work, a previously explicit instruction to
produce the plan counts as approval; do not ask the same question again.

Approval here authorizes plan drafting, not runtime implementation unless the
requester has separately authorized implementation.

## P7 — Draft the master plan

Use `BUSINESS_PLAN_TEMPLATE.md` and `BUSINESS_PLANNING_STANDARD.md`.

Every plan decision must be traceable to one of:

- verified evidence;
- explicit requester decision;
- labelled assumption;
- documented architectural policy;
- external authoritative requirement/source.

### P7A — Separate planning authorities before writing execution detail

Keep four planning levels separate so a roadmap cannot silently become a second
feature specification:

| Level | Canonical owner | It decides | It must not duplicate |
| --- | --- | --- | --- |
| Capability plan | `PLAN.md` | business outcome, scope, ownership, domain decisions, dependencies, and release boundaries | feature-by-feature screen/API execution detail |
| Slice roadmap | the slice execution document linked from `PLAN.md` | dependency order, one current status, entry/exit gates, and the next-step rule | business rules or platform implementation prose |
| Feature execution contract | one file under `decomposition/` from `FEATURE_DECOMPOSITION_TEMPLATE.md` | one feature's API → Web → Mobile → integrated verification → documentation/closure, including its UI Pattern Gate | sibling feature status or unrelated scope |
| Evidence ledger | canonical API/Web/Mobile/system profiles and tests | what actually passed and when | desired behavior that has no evidence |

Do not copy a screen contract into both `PLAN.md` and the slice roadmap. Link to
the feature contract instead. Historical package completion is evidence only when
the current contract, pattern mapping, tests, and live journey are revalidated.

### P7B — Mandatory UI Pattern Gate

Before a feature contract is authorized, inventory every Web and Mobile screen or
route and complete one row per platform using the **UI Pattern Gate** in
`FEATURE_DECOMPOSITION_TEMPLATE.md`. Each row must name the Screen ID, route,
user job, data/interaction shape, primary Pattern ID, form/sub-pattern decision,
exact reviewed source path, platform status, Required/Deferred/Excluded views,
states, offline policy, mock-data policy, permission/scope, responsive/RTL/
accessibility behavior, and any deviation.

The canonical catalog is `documentation/project/SCREEN_PATTERN_CATALOG.md`.
Selecting a `Candidate` pattern blocks runtime UI work until the pattern is
registered, reviewed, and assigned a stable `P-###` ID with evidence. “Shared
component reused” alone is never a pattern decision.

### P7C — One feature active at a time

The slice roadmap must contain one explicit `ACTIVE_FEATURE_STEP` marker. Exactly
one feature may be `Active`; all later features remain `Queued` or `Blocked` until
the current feature reaches `Verified` and its documentation/closure stage is
`Closed`. Execute the current contract in this fixed order:

`API → Web → Mobile → integrated live verification → documentation/closure`.

Do not start a later platform or feature because code exists in the repository.
Record evidence in the current contract and roadmap before moving the marker.

## P8 — Adversarial plan review

Review the completed plan as if another team will implement it without access to
the original conversation.

Challenge at least:

- duplicated ownership/source of truth;
- missing lifecycle transitions;
- unhandled rollback/reversal/cancellation;
- concurrent/repeated requests;
- cross-tenant/company leakage;
- offline/stale-client conflicts;
- migration/backfill risk;
- permissions that exist only in UI;
- missing production evidence;
- unsupported legal/privacy/product assertions;
- optional client capabilities left undecided;
- implementation phases that are horizontal layers instead of coherent business
  slices;
- a single implementation slice that bundles materially different domain workflows,
  screens, user journeys, or acceptance boundaries into one umbrella feature.

Findings are fixed in the plan or centralized as explicit notes before approval.

## P9 — Quality gates and handoff

Run `PLAN_QUALITY_GATE.md` and `Check-Planning.ps1`.

Only G0-G4 passing permits `Implementation Ready`.

A bounded dependency-ordered slice may nevertheless be execution-authorized before
overall G4 only when `PLAN_QUALITY_GATE.md`'s slice-authorization conditions are
met and all remaining G4 findings are explicitly release/hardening-only. This does
not change the overall plan status to `Implementation Ready`.

Before runtime implementation, complete the authorized slice's **Feature
Decomposition Gate** in `PLAN.md` and create a current version 2.0 feature
execution contract from `FEATURE_DECOMPOSITION_TEMPLATE.md`. This contract is
mandatory even when the slice is `Single feature` or is a revalidation of an
already implemented feature. New plans complete it before handoff to
`documentation/system/`. A pre-gate legacy plan may enter Phase 00 only to perform
this reconciliation; it remains blocked from runtime implementation until the gate
is complete. Every slice must state either:

- `Single feature` — one coherent domain/UI workflow can be implemented and accepted
  as one feature execution unit, with one version 2.0 contract; or
- `Decompose` — the slice contains materially different workflows and therefore has
  two or more child feature execution units, each with its own stable Feature ID,
  version 2.0 Screen/Workflow Contract created from
  `FEATURE_DECOMPOSITION_TEMPLATE.md`, scope boundary, dependencies, and acceptance
  outcome.

Do not use one generic screen/renderer, shared controller, or umbrella documentation
package as evidence that materially different workflows form one feature. Shared
technical infrastructure may be reused, but each decomposed child must still prove
its own workflow contract and reuse audit before runtime implementation.

The implementation team receives the approved specification, master plan,
decision/evidence trail, and linked central note IDs. Chat history is not an
implementation dependency.
