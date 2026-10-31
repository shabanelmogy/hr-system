# Angular 22 and PrimeNG Web Migration — Discovery

Date: 2026-10-28. Classification: substantial Web rebuild; planning only.

## Request and authorization

The requester explicitly asked for a conversion plan based on Next.js. This is
plan-drafting approval under P6, not runtime implementation authorization.

| Topic | Requester answer | Consequence |
| --- | --- | --- |
| Production | ERP under development, no customers. | No customer traffic migration is assumed. |
| Coexistence | Keep Next.js and build another Angular project. | Independent app; no deletion or mandatory retirement of Next. |
| Scope | Functional parity first; redesign/new capabilities later. | Source-verified journeys remain the acceptance baseline. |
| Stack | Angular 22 + PrimeNG; PrimeUI developer license reported. | Verify exact stable patches, peer dependencies and version entitlement. |
| Motivation | Another Angular/.NET project; reduce context switching for a large ERP. | Preserve ownership and establish reusable Angular references. |
| State management | Requester approved policy on 2026-10-28: Signals for simple state, SignalStore for complex features; no traditional NgRx mandate. | D06 accepted; consistent feature patterns, small shared context and explicit independent cache/scope contracts. |
| Organization/shared components | Requester explicitly requires best organization and the same shared-component policy. | Mandatory owner boundaries, generic reuse-first UI and automated bypass checks; see ANGULAR_ARCHITECTURE. |
| BFF and complexity | Requester explicitly rejected BFF and requested simplicity on 2026-10-28. | Direct Angular-to-API architecture; no speculative gateway/session infrastructure; DEC-025 closed. |
| ERP reliability/productivity | Requester asked to include the proposed ERP recommendations and make a comprehensive plan on 2026-10-28. | D14/D15 and ERP_ACCEPTANCE establish testable requirements, owners and timing without additional services or unrestricted scope. |
| Sigma reference review | Requester approved including all eight reviewed recommendations on 2026-10-28. | D16 / SIGMA_ACCEPTANCE add Required applicable behavioral details, source-only external provenance and foundation/first-consumer gates; no runtime authorization. |
| Browser persistence | Requester selected secure Cookies inside the existing API on 2026-10-28. | D17 approved: preserve reload continuity; API owns HttpOnly credentials; direct API/no-BFF and retained Next/native bearer contracts stay. Exact slice/preflight and live proof remain required. |

## Discovery dimensions

| Dimension | Resolution / remaining boundary |
| --- | --- |
| Outcome | Separate Angular client reaches verified functional parity. |
| Current process | Inventory source/routes/applied books; do not equate route presence with completeness. |
| Actors | Preserve SuperAdmin, tenant admin and company-user authority; exact actions per feature. |
| Ownership | Existing modules own business truth; Platform owns session/access orchestration. |
| Lifecycle | Existing domain transitions remain server-owned. |
| Rules/exceptions | Preserve errors, read-only rules, concurrency and uncertain mutations. |
| Money/stock/people | No new business rules or accounting recalculation is authorized. |
| Access | Preserve global/tenant/company boundaries and module entitlements. |
| Data | Same API/data; UI caches and sessions need isolation. No business backfill implied. |
| Clients/design | Angular parity Required; Next retained; Expo conversion Excluded. |
| Integrations | Reports/designer, files, realtime, OAuth, calendar, telemetry and Hangfire require proof. |
| Operations | Separate production-build/browser baseline, environments and release decision. |
| Privacy/commercial | Preserve redaction and data scope; verify specialist library adapters/licenses. |
| Acceptance | Fixtures plus real .NET test environment; feature-by-feature acceptance. |

## Proposals and assumptions

Proposed folder `web-angular/`, SPA with lazy routes, typed Reactive Forms,
and Angular-compatible runtime translations. These are
architecture recommendations, not requester-approved implementation decisions.
State-management selection is separately approved in D06 and ANGULAR_ARCHITECTURE
section 6; approval does not extend to all other proposals.

- DEC-025 closed: requester selected direct API without BFF. DEC-027: actual direct authentication and origin/credential binding; blocks auth readiness at G2.
- DEC-026: ambiguous P-008 identifier; blocks affected pattern binding.
- A1: no API business change is needed for parity; validate per feature.
- A2: preserve public paths on the Angular origin; validate deep links.
- A3: PrimeNG visual adaptation is permitted with recorded interaction parity.
- Deadline/team capacity/environment details were not supplied; no fixed schedule is promised.

Discovery batch completed with requester answers. Remaining technical decisions
are explicit gates; they are not silently treated as approved.

## Requester scope correction —2026-10-30 DEC-028

ActiveReports viewer/designer/SDK and associated authoring/licensing work are
Excluded from Angular migration by explicit requester instruction. References to
existing Next/native/API implementations are source evidence only and do not
reinstate that target. Current Angular reporting uses managed Crystal/PDF. Other
reporting manager, permissions, binary transport and PDF lifecycle requirements
remain governed by their owning contracts. No ActiveReports runtime placeholder.
