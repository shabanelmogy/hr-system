# Shared boolean field preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A9 — Shared boolean field preparation |
| Child Feature ID | angular-boolean-field-foundation |
| Child feature name | Shared boolean field preparation |
| Owner | Platform Web Shared |
| Depends on | angular-numeric-field-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded BOOLEAN_FIELD_CONTRACT after341 recipe/planning Phase00 checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Prepare a generic strict boolean field with checkbox/switch presentation. Reuse
actual Shared form lifecycle; no business flag semantics, domain/API/schema/native
change or tri-state/permission editor authorized by preparation.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.boolean-preflight | Web | dev/booleans target | Verify boolean field | Shared field/form | P-001 | C-01 technical form | web-angular/src/app/shared/ui/forms/form-field-control.ts | Adapted | Technical form/field Required; business views Excluded | False/true/invalid/locks/reset/error | No store | No business mocks | No grants/actions | No current UI change | No runtime acceptance from source |
| platform.foundation.boolean-preflight | Mobile | No route | Retain native switch | Source review | N/A — no UI | Existing native control retained | mobile-react/src/shared/components/controls/AppSwitchField.tsx | Excluded | All new UI Excluded | Retained behavior | Existing policy | No mocks | No grants/schema | No UI change | No native implementation claim |

## 3. Closest existing reference

Angular FormFieldControl/FormContainer and existing collection Checkbox; Next
UsersDataGrid inline Checkbox is source evidence, not reusable form ownership.
Native AppSwitchField retained. Check actual shared library before adding a field.

## 4. Reuse and composition contract

Existing form token/errors/summary/focus/PrimeNG/theme first; generic shared input
only if absent. Feature owns flag meaning, save/context/permissions and validators.

## 5. Screen and workspace contract

No runtime UI now. Freeze true/false/null/wrong-type behavior, checkbox vs switch,
label/help/errors/requiredTrue and focus/keyboard before implementation.

## 6. Typed transport and server criteria

Existing bool API sources read-only. No truthy string coercion; false is data.
No new API/domain/permission. Exact Permission Action Matrix N/A technical kit.

## 7. Create, edit, view, and lifecycle contract

No business journeys. Future field silent write/reset/real user dirty/touched,
clear server errors, readonly/disabled/stale callback and requiredTrue owner rules.

## 8. UX states, permissions, offline, and mock data

Future capabilities independently Required/Deferred/Excluded before coding. No
HTTP/offline store/mock business generator in preparation.

## 9. Concurrency, transactions, and consistency

No writes/transactions. Audit vendor model update ordering and locked callbacks;
never infer true from strings or let false become missing default.

## 10. i18n, RTL, accessibility, and responsive behavior

SQL-backed core labels/help, EN/AR, five palettes,390/1440 and keyboard/summary focus.
No current resource change. Domain five-point audit/EF N/A technical preparation.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A8 Closed | Read-only strict bool source audit | This contract |
| 2 | Web | Verified | API/source audit | Shared reuse/frozen UI/Phase00 before runtime | This contract |
| 3 | Mobile | Verified | Web evidence | Retained-source classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Exact unit/browser/keyboard/lock proof | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical report/books/manifest/recipes/handoff | This contract |

Next-step rule: this feature is Closed; S1-A10 multiline preparation follows.

## 12. Verification contract

Graphify/source/reuse audit; four books/current-only manifest/recipes and Phase00
before runtime. Then actual vendor true/false/write/reset/locks/requiredTrue/focus
and current regressions. Technical proof does not complete a business settings UI.

## 13. Child exit gate

- [x] S1-A8 Phase06 Verified/Closed.
- [x] Sole preparation owner/current references registered.
- [x] Source/reuse/strict boolean audit and frozen BOOLEAN_FIELD_CONTRACT.
- [x] Four books/current-only manifest/341recipes registered; entry checks follow.
- [x] Phase06 Verified:198unit/boolean40+8/fresh regressions/API43/catalog7; 341 recipe/planning canonical closure passed.

Customer Education N/A technical preparation; handoff after Verified.
Overall migration Draft; PROD-002/017/019/RISK-018 retain release gates.

Bounded entry2026-10-30:341 recipes/planning pass; exact strict boolean shared checkbox/switch/catalog/dev proof authorized. No business flag policy/API/schema/native/tri-state.

Phase06 Verified2026-10-30: exact strict boolean field accepted, including native readonly activation repair; portable proof/technical handoff registered.

Canonical closure2026-10-30:341 recipes/planning pass. Phase06 Verified and technical education registered. No live database or production acceptance implied.
