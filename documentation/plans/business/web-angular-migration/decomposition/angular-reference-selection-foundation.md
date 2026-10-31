# Angular shared reference selection — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A4 — Shared reference selection preparation |
| Child Feature ID | angular-reference-selection-foundation |
| Child feature name | Angular shared reference selection preparation |
| Owner | Platform Web Shared; actual lookup/data/grants remain owning feature |
| Depends on | angular-collection-foundation Verified/Closed; angular-form-foundation |
| Execution status | Closed |
| Runtime authorization | Authorized bounded S1-A4 frozen SHARED_REFERENCE_CONTRACT after293 recipe/planning Phase00 checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Prepare ERP-02/FOLLOW-014 shared reference-selection contract before business
editors: inspect current MySelect, native AppSelectField and Angular OptionSelect,
text/form/error/collection contracts. Freeze finite options, controlled identity,
selected display, disabled/read-only/required/clear and async loading/search/paging,
stale-scope masking, CVA integration and keyboard/error/focus behavior. Determine
the smallest coherent generic adapter rather than a universal lookup/CRUD engine.

The frozen bounded runtime is now verified: shared single field, common form lifecycle and dev-only harness; IMPLEMENTATION_REPORT owns actual evidence. Business Countries/States lookups, generator adoption,
new API endpoints/schema/grants, date/repeater/dirty editors and native rebuild
are excluded from this preparation. Actual consumer acceptance remains its pilot.

## 2. UI Pattern Gate (mandatory before implementation)

Frozen runtime target is SHARED_REFERENCE_CONTRACT: dev-only shared form/field harness, P-001 C-01 form subcomposition; actual FormContainer/TextField references. No new business route or CRUD. Phase00 passed before runtime; Phase06 and closure checks passed with293 recipes and planning.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.reference-preflight | Web | dev/references only; production Excluded | Verify generic field in shared form | Single scalar reference/CVA | P-001 | C-01 embedded form; CRUD Excluded | web-angular/src/app/shared/ui/forms/form-container.ts | Adapted | Field/form harness Required; collection/tree/report/import/export/chart Excluded | Frozen loading/empty/error/forbidden/stale/readonly/validation | No store | Neutral technical fixtures only | Caller grants/scope; no HTTP | EN/AR/modes/390/1440, keyboard/focus/IME | New shared reference adapter; no actual States acceptance |
| platform.foundation.reference-preflight | Mobile | No runtime route | Retain source | Read-only source audit | N/A — no new UI | Existing control retained | mobile-react/src/shared/components/controls/AppSelectField.tsx | Excluded | All new views Excluded | Existing behavior retained | Existing policy | No new mocks | No grant/schema change | Retain existing behavior | No new native acceptance claim |

## 3. Closest existing reference

Initial inspected reference surfaces: web-next/src/shared/components/forms/selects/MySelect.tsx
(typed options and RHF controlled/form variants); mobile-react/src/shared/components/controls/AppSelectField.tsx
(controlled identity, search/load-more/finite feedback and form field integration);
web-angular/src/app/shared/ui/controls/option-select.ts (actual PrimeNG preference/context
selection, not a business CVA); web-angular/src/app/shared/ui/forms/public-api.ts;
web-angular/src/app/shared/ui/public-api.ts. Source review must trace full behavior
and actual current owner APIs before freezing the adapter; file existence is not proof.

## 4. Reuse and composition contract

Shared first. Prefer extending the current generic control only when its contract
fits business form semantics without breaking header/context behavior. Reuse field
messages, FormContainer focus/error summary, PopoverPanel/feedback and public UI;
do not build a feature-local selector or store business validation inside Shared.
State mechanism remains component-scoped Signals/CVA with caller-owned transport.

## 5. Screen and workspace contract

Single feature: one generic reference-selection preparation. Remote API adapters
and domain-specific selection rules are consumer owned. Split independent editor,
lookup-data or persistence journeys rather than absorbing them into this contract.

## 6. Typed transport and server criteria

API stage is read-only discovery of existing list/lookup shapes, ID/nullability,
selected-item resolution, scope/filter/paging and runtime validation. No new DTO,
endpoint or security guarantee is authorized. ERP-01 generator/provenance decision
must be reconciled before any actual typed owner adapter, without speculative code.
Permission Action Matrix: N/A for this no-action preparation; each future consumer
must supply exact Resource:Action and scope before its UI/API requests are added.

## 7. Create, edit, view, and lifecycle contract

N/A — no entity or business mutation. Required/clear/read-only/disabled selection,
selected-label editing/reload and form focus behavior are target contracts to
freeze; no current journey acceptance is asserted. Dirty/structured workflows
remain FOLLOW-014 under their exact later contracts.

## 8. UX states, permissions, offline, and mock data

Inspect loading/empty/error/retry, value/options mismatch, selected-value preservation,
read-only versus disabled, required clear, long labels, parent/scope changes and
request replacement. No native browser validation/dialog, offline cache or fake
authoritative option. Technical fixtures only after separate bounded runtime entry.

## 9. Concurrency, transactions, and consistency

No write transaction/migration here. Freeze caller cancellation/generation and
selected-item identity so late lookup responses cannot cross company/parent scope.
No vendor/browser persistence or global NgRx store. Existing backend concurrency
or business rules are not invented by the generic control.

## 10. i18n, RTL, accessibility, and responsive behavior

Retain canonical EN/AR/SQL catalog ownership, label/help/error association, keyboard
selection/clear/close, first invalid focus, compact/wide overlays and token themes.
Actual CVA/IME/touch/error integration requires later measured runtime verification.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A3 Verified/Closed | Source/API/ownership audit and frozen exact scope; no API implementation | This contract |
| 2 | Web | Verified | API audit Verified + Phase00 | Exact generic control runtime authorization and actual tests | This contract |
| 3 | Mobile | Verified | Web verified | Reasoned retained-source classification or exact authorized change | This contract |
| 4 | Integrated live verification | Verified | Prior stages verified | Technical fixture or actual consumer evidence per frozen scope | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical books/manifest/recipes and applicable handoff | This contract |

Next-step rule: no sibling runtime while this feature is Active. Nothing in this
preparation bypasses the Phase00 entry gate or closes Countries/API acceptance.

## 12. Verification contract

First run the scoped graphify/source review, freeze behavior and independent
Required/Deferred/Excluded choices, four applied books and existing-only manifest,
then regenerate/check documentation and planning. Phase06 Verified evidence now exists in IMPLEMENTATION_REPORT and verification/. Future exact tests must cover value/CVA/errors/async-scope/keyboard
and reference parity; no empty verification test suite is scaffolded now.

## 13. Child exit gate

- [x] Prior S1-A3 Verified/Closed with canonical proof.
- [x] Single preparation owner registered before any runtime.
- [x] Full source/API/reuse audit and exact selection contract.
- [x] Phase00 four books/manifest/recipes and current gates.
- [x] Bounded runtime authorization and Phase06 Verified; canonical closure checks passed.

Overall plan stays Draft; remaining G4 gates and FOLLOW-012/014/015/016 remain owned.

Bounded execution amendment2026-10-29: generic reference-field runtime and dev-only form harness authorized after Phase00. No business lookup adapter/API/schema/grant/native UI. Remaining G4 cannot change the frozen contract; overall plan remains Draft.
