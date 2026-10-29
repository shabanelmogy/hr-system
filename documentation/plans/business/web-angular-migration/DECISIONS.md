# Angular 22 and PrimeNG Web Migration — Decisions

| ID | Status / authority | Boundary | Verification |
| --- | --- | --- | --- |
| D01 | Requester selected | Angular 22 + PrimeNG, licensed stable compatible patches. | Target peer/entitlement check at foundation entry. |
| D02 | Requester confirmed | Separate Angular app; keep Next.js. | Independent builds/URLs; no removal milestone. |
| D03 | Requester confirmed | Functional parity before redesign/new business. | Feature acceptance matrix. |
| D04 | Requester confirmed | No customers yet. | Reconfirm before external release. |
| D05 | Proposed | web-angular folder; SPA/lazy routes. | Foundation/hosting review. |
| D06 | Requester approved 2026-10-28 | Local Angular Signals/computed for simple state; scoped NgRx SignalStore for complex feature workflows; no mandatory traditional NgRx Store. Keep similar features consistent and server-cache/scope policy explicit. | State-complexity decision in each feature contract; scope/cancellation/realtime tests. |
| D07 | Proposed | Typed Reactive Forms and generic shared error/focus/dirty behavior. | Zoneless edit/repeater/server-error tests. |
| D08 | Requester approved 2026-10-28; DEC-025 Closed | No BFF. Angular calls the existing .NET API directly; no new YARP/gateway/Redis/session-store requirement. Keep Next's existing handlers for Next only. | DEC-027 fixes the direct auth contract before implementation; no silent token-storage decision. |
| D09 | Open: DEC-026 | Resolve duplicate P-008 meaning; register Angular references. | Before affected UI contracts. |
| D10 | Open proof: RISK-017 | Select compatible licensed Angular adapters for each integration. | Specialist acceptance spikes. |
| D11 | Proposed | One feature active at a time after authorization. | Central execution contract and checks. |
| D12 | Requester confirmed | Strong modular organization and same shared-component-first policy. | ANGULAR_ARCHITECTURE; shared controls and enforceable anti-bypass checks before broad conversion. |
| D13 | Requester confirmed 2026-10-28 | Avoid unnecessary complexity; prefer existing framework/API capabilities, scoped reuse and minimal dependencies. | No speculative services, generic engines or empty abstraction layers; each addition needs a concrete consumer/requirement. |
| D14 | Requester approved 2026-10-28 | Include ERP reliability/productivity recommendations as Required applicable acceptance: typed contracts, shared lookups, keyboard/structured editing, safe writes, precision/time, lifecycle/audit, volume/diagnostics and recovery. | ERP_ACCEPTANCE ERP-01..ERP-12; source-backed gaps gate the affected owner; no blanket domain rewrite or new infrastructure. |
| D15 | Requester-approved assessment under D14; generator choice pending proof | Required representative OpenAPI client-generation proof, then one pinned generator if suitable or an explicit tested typed-service fallback. | S0 proof before broad transport rollout; FOLLOW-003 remains canonical for broader contract automation. |
| D16 | Requester approved 2026-10-28 after the Sigma source review | Adopt SIG-01..SIG-08 as Required applicable acceptance: lookup bootstrap/watch, navigation request lifetime, loading ownership, attachment lifecycle, draft/confirmation safety, list URL criteria, shared compatibility and scroll ownership. | SIGMA_ACCEPTANCE owns details and external source provenance; S1 harnesses and first real consumers prove behavior under Angular 22/Strict/Zoneless. No runtime authorization or gate closure. |
| D17 | Requester approved 2026-10-28 through the explicit browser-persistence choice | Preserve reload continuity with secure HttpOnly Cookies inside the existing Platform API; retain JSON/bearer routes for Next/Mobile. Persistent JS-readable token storage and memory-only re-login behavior are not the selected path. | BROWSER_AUTHENTICATION_CONTRACT defines the bounded target transport. DEC-027 remains Open for slice contract/proof; RISK-018 gates affected guarantees. No new BFF/server/identity system; runtime entry follows the exact slice gates. |

## D08 — BFF excluded by requester

The requester explicitly rejected BFF and asked to avoid complexity. Angular uses
the existing ERP API directly. The earlier independent .NET BFF recommendation is
superseded, not deferred. Existing Next behavior is retained. DEC-027 records the
remaining direct cookie/token/session binding, which requires review of actual
API capability before implementation and does not authorize an identity rewrite.

## D06 — Approved state-management policy

The requester explicitly approved the discussed policy on 2026-10-28. Simple
component state uses Angular Signals/computed. A simple shared state may use an
owner-scoped Angular service with private writable signals, public readonly
signals and explicit methods. Complex feature workflows use scoped NgRx
SignalStore to standardize state, derivations and orchestration. Similar
features use the same selected pattern; AI-generated code is held to that rule.

Traditional NgRx Store (actions/reducers/effects) is not a baseline dependency or
a universal global store. Introducing it requires a concrete workflow need,
architecture review and an explicit recorded decision. Root state remains small
and owner-defined. Cache, invalidation, cancellation, stale-response rejection,
scope isolation and no implicit write replay remain independent requirements.

Each feature contract records the chosen mechanism, its lifetime/owner, complexity
reason and verification. This approval settles D06 only; it does not approve the
whole Draft or authorize runtime implementation.

## D16 — Approved Sigma acceptance integration

The requester explicitly approved including all eight recommendations after the
source-only review of `F:/My Work/Sigma/SiGmaAngularFrontEnd`. Required behavior,
owners, exact acceptance and external references are in
[SIGMA_ACCEPTANCE](SIGMA_ACCEPTANCE.md); ROADMAP owns timing. These are acceptance
details for the existing migration, not a port of Sigma architecture or business.
ERP functional/security ownership, Angular 22, Strict/Zoneless, D06, shared tokens
and direct API/no-BFF remain authoritative. Sigma's source/test definitions do
not prove ERP runtime, and its package versions/constants/auth are not adopted.
This approval integrates the requirements into planning only; G0-G4, central
decisions and per-feature execution authorization remain unchanged.

## D17 — Approved secure API Cookies

The requester explicitly selected secure Cookies inside the current API after
reviewing the persistence alternatives. This resolves browser-persistence choice;
do not ask for it again. Angular remains a direct API client and keeps session
continuity after reload. The API owns HttpOnly credential issuance/deletion;
JavaScript receives sanitized session metadata and restricted selection challenges.

[BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md) records the
target routes, cookie/origin/antiforgery boundaries, existing bearer compatibility,
required session reconciliation and acceptance. Concrete mechanisms still need
Phase 00 and the exact execution contract; approval does not claim those mechanisms
exist or their tests pass. Subsequent R1/R2 real SQL/Chromium evidence closes
DEC-027 for the API binding; its current report owns that result. RISK-018 retains
provider/ancestry/actual-consumer boundaries. No additional persistence-preference
approval is needed.

## D18 — Preserve database-backed UI translation

The requester explicitly reaffirmed translation persistence while authorizing
continuation. [LOCALIZATION_PARITY](LOCALIZATION_PARITY.md) freezes the existing
company/system SQL ownership, keys/catalog fingerprint, runtime layers, revision/
conflict/reset, permission and audit behavior. Angular reuses these APIs and keys.
S1-A0 implements the technical runtime/service only; actual login/context/Settings
save and reload acceptance is Required under FOLLOW-012 at S2/S4.
