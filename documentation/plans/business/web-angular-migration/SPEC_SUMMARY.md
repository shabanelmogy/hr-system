# Angular 22 and PrimeNG Web Migration — Specification

Status: Draft. Reviewed 2026-10-28. Drafting authorized; implementation not authorized.

## Outcome and scope

Build a separate Angular 22 + PrimeNG client beside Next.js, with verified
functional parity against the existing ERP API. The requester confirmed no customers.

Required: source inventory; shared UI/forms/grid; direct API authentication and context isolation;
module/permission navigation; all current classified feature views/integrations;
EN/AR/RTL and company text overrides; tests, CI, deployment and central evidence.
The requester explicitly requires strong organization and the same shared-component
policy. ANGULAR_ARCHITECTURE defines ownership, shared contracts and enforcement.

Requester-approved D14 adds Required applicable ERP controls, specified in
[ERP_ACCEPTANCE](ERP_ACCEPTANCE.md): reference selectors, keyboard/structured
entry, concurrency/duplicate/uncertain-write safety, atomicity, amounts/dates,
lifecycle/audit, typed API contracts, realistic scale and recoverable release.
OpenAPI generation assessment is Required; adopting a particular generator depends
on compatibility proof. Reuse existing domain behavior; any newly discovered
business/schema/API gap requires its own authorized owner slice.

Requester-approved D16 adds [SIGMA_ACCEPTANCE](SIGMA_ACCEPTANCE.md) SIG-01..SIG-08:
finite lookup bootstrap/watch, navigation request lifetimes, loading ownership,
attachment lifecycle, isolated drafts/confirmation races, round-trippable list
criteria, shared library compatibility and scroll ownership. ROADMAP assigns S1
foundation gates plus actual first-consumer proof; Angular 22/Strict/Zoneless and
ERP API/security remain authoritative over the external source examples.

Excluded: Next deletion/retirement, native Expo conversion, redesign, future-only
business capabilities, new domain schemas/rules and publishing during planning.

## Journeys

1. Sign in -> trusted tenant/company context -> authorized module.
2. Server list -> search/filter/sort/page -> detail/create/edit -> lifecycle/bulk -> refresh.
3. Dirty edit -> context switch -> cancel/discard -> isolate old scope.
4. Import/report/designer/file/realtime -> enforce limits, permission and recovery.
5. Deep link/refresh -> correct route, locale and access result.

## Proposed architecture

`web-angular/`: routes -> owner feature -> controller/SignalStore -> typed service
-> HttpClient -> existing ERP API. The requester rejected BFF and requested
simplicity; DEC-025 is closed. No additional gateway/YARP/Redis/session store is
assumed. DEC-027 fixes the actual direct cookie/token contract before auth work.

Small root context/preferences state; feature state remains scoped. Query cache,
invalidation, realtime, cancellation and context reset need an explicit contract.
Requester-approved D06: Signals/computed for simple state; owner-scoped Signals
services for simple sharing; SignalStore for complex workflows; consistent
mechanisms for similar features; no mandatory traditional NgRx Store.
Typed Reactive Forms proposed; Signals must not become a second form source of truth.

## Platform and commercial boundaries

Angular parity Required; Next retained/regression-protected; native Mobile
conversion Excluded. API/session changes require API/Mobile regression checks.
Verify PrimeUI version entitlement and specialist vendor Angular adapters.
Business data and authorization stay server-owned; no UI-driven backfill.

## Evidence and readiness

See [EVIDENCE](EVIDENCE.md) and [DISCOVERY](DISCOVERY.md). DEC-027, DEC-026 and
RISK-017 remain explicit blockers at their affected gates. No delivery deadline
is inferred from AI-assisted development. The requested plan is a reviewable Draft.

S0 auth source audit is complete in
[AUTHENTICATION_PREFLIGHT](AUTHENTICATION_PREFLIGHT.md). D17 requester-approved
API HttpOnly browser cookies preserve persistent sessions; the target is defined in
[BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md), not existing
runtime. DEC-027 binding proof and RISK-018 actual auth
contract reconciliation remain gates. No Angular runtime was created by the audit.

Subsequent R1/R2 state: session correctness and direct browser Cookie transport are
implemented with real SQL/Chromium focused acceptance. Current final gate and
limitations are in the owning Platform feature's verification/BROWSER_IMPLEMENTATION_REPORT.md.
Angular foundation/UI remains next; production/provider acceptance is separate.

- [x] Scope, coexistence and drafting authority captured.
- [x] Current source separated from proposals and unknowns.
- [x] No-BFF/direct-API direction explicitly selected by requester.
- [ ] Direct authentication/origin/credential binding and integration spikes verified.
- [ ] Per-feature permission/UI contracts and G0–G4 complete.
