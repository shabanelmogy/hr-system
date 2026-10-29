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
- Applicable SIG-01..SIG-08 from SIGMA_ACCEPTANCE; foundation versus real-consumer
  proof, external reference baseline and adaptation decisions. Reinspect current
  source; Sigma versions/auth/endpoints/constants are not the target contract.
- Approved state mechanism/lifetime (D06), shared tokens (section 7 architecture),
  direct API auth binding if affected, and specialist adapter/version where relevant.
- Allowed scope/owning paths, actual dependencies and objective exit evidence.

For the first authentication slice, use AUTHENTICATION_PREFLIGHT, DEC-027 and
RISK-018 as mandatory inputs. D17 secure API Cookies are requester-approved;
BROWSER_AUTHENTICATION_CONTRACT owns the target transport. Do not ask again for
the persistence choice or treat the selected binding as already implemented.
Reconcile actual refresh/source contracts and prove cookie/CSRF/
origin changes plus retained-client compatibility before auth acceptance.

Current handoff: R1 session repair and R2 direct browser Cookie routes have actual
SQL/Chromium and retained-client evidence in the feature's
verification/BROWSER_IMPLEMENTATION_REPORT.md. Consume those verified API contracts;
do not repeat the persistence decision or describe the API transport as absent.
Next work is the bounded Angular foundation followed by login/shell UI, preserving
the current design/shared-first policy. Deployment/provider gates remain central.

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
Cover applicable SIG IDs explicitly, including actual Strict/Zoneless notifications,
navigation/loading races, criteria semantics and browser compatibility/scroll
evidence. First attachment/structured consumers cannot defer their lifecycle or
draft acceptance solely because a later roadmap stage also mentions that area.

Report changed behavior and source paths, actual commands/results, known gaps,
feature regressions versus inherited failures/environment blockers, and remaining
manual/release checks by central ID. Update owning canonical profiles/manifests
and regenerate through the system. Only existing paths enter evidence manifests.
Phase 06 must be Verified before Phase 07 education/closure; do not activate the
next feature until the current contract closes.
