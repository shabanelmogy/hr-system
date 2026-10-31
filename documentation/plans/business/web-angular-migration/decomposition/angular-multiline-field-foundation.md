# Shared multiline text preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A10 — Shared multiline text preparation |
| Child Feature ID | angular-multiline-field-foundation |
| Child feature name | Shared multiline text preparation |
| Owner | Platform Web Shared |
| Depends on | angular-boolean-field-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded MULTILINE_FIELD_CONTRACT after349 recipe/planning Phase00 checks; G0-G3 fixed; remaining G4 release only |

## 1. Child boundary and outcome

Extend existing TextField with multiline text entry after a frozen bounded contract.
No parallel textarea field, rich text, domain/API/schema/native rewrite.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.multiline-preflight | Web | dev/multiline target | Verify multiline text entry | Existing shared form | P-001 | C-01 technical form | web-angular/src/app/shared/ui/forms/fields/text-field.ts | Adapted | Technical form Required; business views Excluded | Newlines/IME/reset/errors/locks | No store | No business mocks | No grants | No UI change | No runtime acceptance from source |
| platform.foundation.multiline-preflight | Mobile | No route | Retain native multiline | Source review | N/A — no UI | Existing AppTextField retained | mobile-react/src/shared/components/controls/AppTextField.tsx | Excluded | New UI Excluded | Existing behavior | Existing policy | No mocks | No grants/schema | No UI change | No native implementation claim |

## 3. Closest existing reference

Angular TextField and its exact template shared by NumericField. Next MyTextField
multiline/rows and native AppTextField source provide retained reference behavior.

## 4. Reuse and composition contract

Extend current shared TextField, FormFieldControl/FormContainer/summary/chrome;
actual PrimeNG Textarea enhancement and current token adapter, no duplicate shell.

## 5. Screen and workspace contract

No runtime yet. Freeze newline/IME/rows/resize/plain-text/counter/locks/swap and
numeric/email/password boundaries before authorizing a neutral technical preview.

## 6. Typed transport and server criteria

Existing string owner only; no trim/newline transformation, API or storage change.
Owner validators and server authority retained; no actions/permission matrix.

## 7. Create, edit, view, and lifecycle contract

Technical field only; preserve silent writes/reset, dirty/touched, server errors,
clear and summary focus. Enter inserts a newline; explicit Save remains enabled.

## 8. UX states, permissions, offline, and mock data

Future technical view frozen independently. No business CRUD/Grid/Cards/report/
import/export/file/offline store/native rewrite or domain mock generator.

## 9. Concurrency, transactions, and consistency

No writes/transactions. Shared input/textarea switch preserves owner value and
validators; no business auto-save or numeric multiline conversion.

## 10. i18n, RTL, accessibility, and responsive behavior

Existing SQL-backed captions first; EN/AR, five palettes/light-dark/390-1440,
label/help/error/counter ARIA, keyboard/summary focus and bounded resizing.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A9 Closed | Read-only string/source ownership audit | This contract |
| 2 | Web | Verified | API/source audit | Reuse/frozen contract/Phase00 before runtime | This contract |
| 3 | Mobile | Verified | Web evidence | Retained native classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Exact unit/browser/IME/lock proof | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical report/books/manifests/recipes/handoff | This contract |

Next-step rule: this feature Closed; S1-A11 collection criteria preparation follows.

## 12. Verification contract

Graphify/source/reuse/freeze and current-only books/manifests/Phase00 first. Then
actual PrimeNG textarea, shared input/numeric/date/form/login regressions and
full Angular check; catalog/API tests only if resource changes. No live SQL claim.

## 13. Child exit gate

- [x] S1-A9 Phase06 Verified/Closed and single next preparation registered.
- [x] Source/reuse/frozen MULTILINE_FIELD_CONTRACT.
- [x] Four books/current-only manifest/349recipes registered; entry checks follow.
- [x] Phase06 Verified206unit/multiline40+8/fresh regressions; technical guide registered, 349 recipe/planning closure passed.

Overall migration Draft. PROD-002/017/019/RISK-018 retain release gates; broader
real consumers remain FOLLOW-014. Business EF/five-point parity N/A technical kit.

Phase06 Verified2026-10-30: existing TextField multiline accepted; portable proof/education registered.

Canonical closure2026-10-30:349 recipe/planning checks passed after final padding repair/full206unit/browser40+8; technical guide registered.
