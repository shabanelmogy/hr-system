# Shared numeric field preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A8 — Shared numeric field preparation |
| Child Feature ID | angular-numeric-field-foundation |
| Child feature name | Shared numeric field preparation |
| Owner | Platform Web Shared |
| Depends on | angular-date-field-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded NUMERIC_FIELD_CONTRACT after333 recipe/planning Phase00 checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Prepare one generic numeric-input foundation under existing migration. Audit actual
integer/decimal owner wire contracts and shared controls before choosing a value
representation. No amount calculation, rounding, currency policy, financial
posting, API/schema/business/native rewrite authorized by this preparation.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.numeric-preflight | Web | dev/numbers target | Verify numeric field | Shared numeric/form harness | P-001 | C-01 technical form | web-next/src/shared/components/forms/text-fields/MyTextField.tsx | Adapted | Technical input/form Required; business UI Excluded | Empty/invalid/limits/readonly/disabled/reset/error | No store | No business mocks | No grants/actions | No current UI change | No runtime acceptance from source |
| platform.foundation.numeric-preflight | Mobile | No new route | Retain native numeric input | Source review | N/A — no UI | Existing control retained | mobile-react/src/shared/components/controls/AppTextField.tsx | Excluded | New UI Excluded | Existing behavior retained | Existing policy | No new mocks | No grants/schema | No current UI change | No native implementation claim |

## 3. Closest existing reference

Next MyTextField/internals and native AppTextField numeric behavior are source
references, not financial truth. Angular TextField/DateField/FormFieldControl and
FormContainer own reusable error/focus/CVA lifecycle. Inspect actual pinned vendor.

## 4. Reuse and composition contract

Reuse Shared first. Extend TextField generically if sufficient, otherwise justify
missing shared numeric control. Owner owns domain precision/range/API mapping;
Shared owns presentation/edit state only. No feature-local form/error shell.

## 5. Screen and workspace contract

No runtime UI in preparation. Freeze value/nullability, partial input, sign, decimal
separator/grouping, Arabic digits, min/max/scale/step and no-loss formatting per
actual consumer contracts. Do not infer one rounding or two-decimal currency rule.

## 6. Typed transport and server criteria

Audit ERP-07 and actual integer/decimal DTOs. No API/schema change authorized. Binary
JavaScript Number must not silently become authoritative for exact financial values.
Server remains business calculation authority; Permission Action Matrix N/A here.

## 7. Create, edit, view, and lifecycle contract

No business journeys implemented. Future CVA must keep invalid/partial data visible,
support silent writes/reset/clear/touched and shared first-error behavior. Exact
current-only Phase00 manifest before runtime; no future nonexistent paths.

## 8. UX states, permissions, offline, and mock data

Future numeric capabilities independently Required/Deferred/Excluded before coding.
No new HTTP/permission/offline queue/persistence or business mocks in preparation.

## 9. Concurrency, transactions, and consistency

No database transaction/mutation. Audit lock/stale callbacks, external value updates,
local draft revision and parser/display equivalence before implementation decisions.

## 10. i18n, RTL, accessibility, and responsive behavior

Use SQL-backed core text, EN/AR digits/separators, five palettes, compact/wide and
keyboard/error/focus. No current catalog change. Five-point domain UI/EF audit N/A.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A7 Closed | Read-only actual numeric wire/precision audit | This contract |
| 2 | Web | Verified | API/source audit | Shared reuse/frozen contract/Phase00 before bounded runtime | This contract |
| 3 | Mobile | Verified | Web evidence | Retained-source classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Exact runtime unit/browser/precision proof after authorization | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical books/report/manifest/recipes/handoff | This contract |

Next-step rule: this feature is Closed; S1-A9 boolean preparation is the sole Active feature.

## 12. Verification contract

Graphify/source/representation audit and four applied books/current-only manifest/
recipes/Phase00 before runtime. Later prove no-loss edit/reset, invalid and precision
edges, actual vendor/keyboard/RTL/shared validation and retained regressions. No
green technical control can stand in for real financial/domain acceptance.

## 13. Child exit gate

- [x] S1-A7 Phase06 Verified/Closed with portable evidence.
- [x] Sole preparation owner registered with actual source paths.
- [x] Full source/wire/precision/reuse audit and frozen NUMERIC_FIELD_CONTRACT.
- [x] Four applied books/current manifest/333 recipes registered; entry checks follow.
- [x] Phase06 Verified:188unit/numeric40+8/forms40/retained regressions/API43/catalog7; 333-recipe/planning canonical closure passed.

Customer Education N/A technical preparation; handoff after Verified.
Overall plan remains Draft; PROD-002/017/019/RISK-018 retain release gates.

Bounded entry2026-10-30:333 recipe/planning Phase00 pass; exact string numeric shared input/validation/current catalog/dev proof authorized. No domain/API protocol/schema/native/financial calculations.

Phase06 Verified2026-10-30: actual exact numeric runtime and portable proof registered; no Number-based financial transport or business/domain/schema/native claim.

Canonical closure2026-10-30:333 recipe/planning checks passed after Phase06. Portable proof and technical consumer education registered. Historical preparation constraints retained as entry record; current books/report own verified behavior.
