# Plan Quality Gate

Passing is based on explicit decisions and evidence, not document length.

## Preflight — Plan creation readiness

G0 must not be evaluated until all applicable items below are true:

- [ ] Discovery was run in small, high-leverage batches rather than one giant questionnaire.
- [ ] `EVIDENCE.md` separates VERIFIED CURRENT, REQUESTED TARGET, ASSUMPTION, UNKNOWN, and reasoned N/A findings.
- [ ] Material current-system claims have repository/runtime/config/test evidence.
- [ ] Version-sensitive technical decisions use the exact installed/target version and current authoritative docs.
- [ ] `SPEC_SUMMARY.md` summarizes product, users, scope, journeys, data/ownership, architecture, and integrations.
- [ ] Every assumption is explicitly labelled with impact and validation trigger.
- [ ] Open risks/unknowns have an owner and resolution/reopen trigger.
- [ ] Product/design applicability was reviewed.
- [ ] Privacy/data-handling applicability was reviewed when personal/sensitive data is involved.
- [ ] Commercial/terms applicability was reviewed when accounts, plans, billing, UGC, AI, third parties, suspension, termination, or service limits are involved.
- [ ] Current capabilities were not inferred from a historical plan, generic template, or desired target.
- [ ] Interactive planning received approval to convert the spec into an implementation plan, or prior explicit authorization already covers plan drafting.

Failure => remain `Draft`; do not create implementation phases to hide unresolved discovery.

## G0 — Scope and ownership

- [ ] Material discovery questions/evidence are captured in `DISCOVERY.md`.
- [ ] Current system behavior and requested target behavior are distinguishable without interpretation.
- [ ] One clear business problem and outcome.
- [ ] Required / Deferred / Excluded scope is explicit.
- [ ] Exactly one bounded-context owner.
- [ ] Existing-system relationship review complete.
- [ ] Every important fact has one source of truth.
- [ ] Tenant/company/global scope explicit.

Failure => `Draft`.

## G1 — Business readiness

- [ ] Domain concepts and relationships defined.
- [ ] Lifecycle/state transitions explicit.
- [ ] Invariants independent from UI/API.
- [ ] Rules matrix covers every Required action.
- [ ] Edge-case matrix fully decided or reasoned N/A.
- [ ] Permissions/actors defined.
- [ ] Audit/history requirements defined.
- [ ] No blocking business question.

Passing => `Business Ready`.

## G2 — Architecture readiness

- [ ] Persistence ownership/constraints/indexes/filters/migrations defined.
- [ ] Transaction/concurrency behavior defined.
- [ ] CQRS/API/error contracts explicit.
- [ ] Cross-module communication uses Contracts/messaging.
- [ ] External integrations define timeout/retry/idempotency/failure.
- [ ] Security/sensitive-data rules explicit.
- [ ] Scale expectations documented.
- [ ] Observability/recovery planned.

Passing => `Architecture Ready`.

## G3 — Product/client readiness

- [ ] Web Required/Deferred/Excluded decisions complete.
- [ ] Mobile Required/Deferred/Excluded decisions complete.
- [ ] Create/Edit/View/List/Filter cover all structured data.
- [ ] Shared UI/design-system reuse identified.
- [ ] Any prepared external UI/reference is classified as design input versus
      approved behavior and does not override business lifecycle/permissions.
- [ ] Approved UI is mapped to existing reusable/shared components first; generic
      extension is preferred over duplication, and any new shared component has a
      justified reusable scope.
- [ ] Primary journeys and information hierarchy reflect the frozen business lifecycle/permissions rather than inventing them.
- [ ] Loading/empty/error/unsaved/accessibility/RTL planned.
- [ ] Offline/mobile conflict behavior decided where applicable.
- [ ] Import/export/report/files/realtime/notifications decided.
- [ ] Clients do not invent missing server business semantics.

## G4 — Delivery readiness

- [ ] Verification matrix maps critical rules/journeys to evidence.
- [ ] Phases are dependency ordered with entry/exit gates.
- [ ] Migration/backfill/seed/repair strategy executable.
- [ ] Deployment ordering and production smoke defined.
- [ ] Rollback or forward-fix defined.
- [ ] Risks have mitigation/owner/trigger.
- [ ] Deferred work has owner/reopen trigger.
- [ ] Applicable privacy/commercial/legal unknowns are resolved, assumed explicitly, or centralized as blocking/non-blocking decisions.
- [ ] No plan claim promises a fee, right, restriction, deletion/export control, retention rule, service limit, or third-party behavior that is unsupported by evidence or an explicit target decision.
- [ ] No blocking Required-capability question remains.

Passing G0–G4 => `Implementation Ready`.

### Slice execution authorization before full G4

A dependency-ordered plan may explicitly authorize one bounded implementation
slice before the **overall plan** reaches `Implementation Ready`, but only when all
of the following are true:

- G0, G1, G2, and G3 pass for that exact slice.
- The plan names the exact slice, its deliverables, entry/exit gate, and exclusions.
- Every unresolved G4 item is explicitly a production/release/hardening concern and
  cannot change the slice's frozen business meaning, ownership, persistence
  semantics, security model, or Required client contract.
- The plan states that the slice is execution-ready while later slices/release
  remain gated.
- Phase 00 Implementation Preflight rechecks current runtime for drift before coding.

This does **not** make the overall plan `Implementation Ready`. G4 still must pass
before the full capability/release receives that status. If an open G4 item could
change the implementation contract of the proposed slice, the slice is not
authorized.

## Phase closure gate — Customer education

This is a **post-implementation** gate. It does not block `Implementation Ready`;
it blocks marking a completed customer-visible phase/slice `Closed`.

- [ ] Phase 06 Verification & Acceptance explicitly records `Verified` before
      customer documentation is started/finalized.
- [ ] Customer Education Pack is classified `Required` or `N/A — reason`.
- [ ] Every customer-visible phase has a `Required` education document.
- [ ] The document describes actual released behavior, not planned/Deferred behavior.
- [ ] Customer value, prerequisites, roles/permissions, and primary journeys are clear.
- [ ] Step-by-step workflow matches the implemented Web/Mobile experience where applicable.
- [ ] Important business rules are explained in customer language.
- [ ] Realistic examples/demo data are included or explicitly marked not applicable.
- [ ] Common errors, blocked actions, and recovery guidance are covered.
- [ ] FAQ and terminology are suitable for support/training use.
- [ ] A video outline/storyboard identifies recording order, screens/actions, narration points, and expected result.
- [ ] Internal implementation details are excluded unless required to explain supported administrator behavior.
- [ ] Screenshots/recording checklist contains no secrets, real customer data, tokens, or unsafe test credentials.

Passing this gate is required before a customer-visible phase moves from `Verified`
to `Closed`.

## Final reviewer questions

All should be `yes`:
1. Can another team build this without inventing business rules?
2. Can API/Web/Mobile identify exact contracts independently?
3. Can QA derive tests directly from the plan?
4. Can operations understand rollout/failure/recovery?
5. Can an architect identify every cross-module dependency/source of truth?
6. Can product identify what is intentionally not built now?
7. Are scale assumptions visible?
8. Are retry/repeat/concurrent outcomes defined?
9. Is external dependency failure behavior defined?
10. Does every new state have a user journey or explicit exclusion?
11. Does every completed customer-visible phase have accurate customer education/video material derived from verified runtime behavior?

Any `no` is a planning finding, not an implementation TODO.
