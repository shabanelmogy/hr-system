# Bounded Implementation Brief — Reusable Handoff

This is a handoff template, not an authorized active feature. Use it only after
the exact slice gates and its version 2.0 contract permit execution. The roadmap
remains the single status/order authority.

## Inputs required before a coding task

- Plan ID and exact authorized slice; child Feature ID and contract path.
- Source baseline: commit and relevant working-tree changes, route/feature inventory rows.
- Current API/controllers/CQRS/types and the feature's owning required-files manifest.
- Exact screen Pattern, permission/action/scope matrix and existing shared references.
- Required views and applicable ERP-01..ERP-12 criteria; reasoned N/A entries.
- Approved state mechanism/lifetime (D06), shared tokens (section 7 architecture),
  direct API auth binding if affected, and specialist adapter/version where relevant.
- Allowed scope/owning paths, actual dependencies and objective exit evidence.

## Task instruction

Implement only the named feature contract. Inspect current source before adapting
it; use the owning API/Web/Mobile books as evidence. Preserve exact business
semantics and Required views. Reuse shared Angular components, extend generic
behavior before adding a local equivalent, and keep domain rules in their owner.

Angular calls the current .NET API directly. Do not introduce a BFF/gateway,
mandatory global NgRx Store, new server/cache service or speculative generic engine.
Use local Signals for simple state and scoped SignalStore for complex workflows;
apply the same mechanism to equivalent feature shapes. Consume @app/tokens via
the reviewed PrimeNG adapter; do not fork colors or hand-edit generated clients.

When current behavior conflicts with the contract, record the evidence and reopen
the affected gate. Do not guess missing money/lifecycle/permission semantics or
change schema as a frontend shortcut. Preserve unrelated working-tree edits.

## Verification and handoff

Execute the contract's narrow behavior tests and required application gates. Use
fixture and real API evidence for the scenarios they actually prove. Generated
types and mocked component tests do not establish persisted concurrency, audit,
atomicity or hosted behavior. Cover applicable ERP acceptance IDs explicitly.

Report changed behavior and source paths, actual commands/results, known gaps,
feature regressions versus inherited failures/environment blockers, and remaining
manual/release checks by central ID. Update owning canonical profiles/manifests
and regenerate through the system. Only existing paths enter evidence manifests.
Phase 06 must be Verified before Phase 07 education/closure; do not activate the
next feature until the current contract closes.
