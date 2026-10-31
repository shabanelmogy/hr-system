# Shared date-only field preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A7 — Shared date-only field preparation |
| Child Feature ID | angular-date-field-foundation |
| Child feature name | Shared date-only field preparation |
| Owner | Platform Web Shared |
| Depends on | angular-unsaved-navigation-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded DATE_ONLY_FIELD_CONTRACT after325 recipe/planning Phase00 checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Prepare one generic Angular date-only input. Reconcile current date-only wire
semantics against ERP-07 and reviewed Next/native controls. No date/time scheduling,
timezone conversion engine, business CRUD or domain/schema change is authorized.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.date-preflight | Web | dev/dates target only | Verify date-only field | Shared input/calendar/form | P-001 | C-01 technical form | web-next/src/shared/components/forms/date-time/MyDateTimeField.tsx | Adapted | Technical field/form Required; business views Excluded | Empty/invalid/readonly/disabled/range/clear/reset | No store | No business mocks | No new actions | No current UI changes; future EN/AR/keyboard/RTL audit | No runtime acceptance from source review |
| platform.foundation.date-preflight | Mobile | No new route | Retain native input | Source review | N/A — no UI | Existing control retained | mobile-react/src/shared/components/controls/AppDateTimeField.tsx | Excluded | New UI Excluded | Existing behavior retained | Existing policy | No new mocks | No grants/schema changes | No current UI change | No native implementation claim |

## 3. Closest existing reference

Inspect Next MyDateTimeField and native AppDateTimeField as references, not packages
to port. Angular FormFieldControl/TextField/ReferenceField and FormContainer define
the reusable field/error/focus lifecycle. Inspect pinned PrimeNG package/docs.

## 4. Reuse and composition contract

Shared component owns CVA/visual/accessibility mechanics only; feature owners own
validators, API mapping and domain date rules. Reuse field chrome and shared form
registration. Do not copy a feature-local form/error shell or introduce NgRx.

## 5. Screen and workspace contract

No runtime screen during preparation. Freeze nullable date-only representation,
empty/invalid values, manual typing/calendar/clear, disabled/readonly, and min/max
responsibility before implementation. Decide display localization separately from
wire format. Timestamp and financial/business date authority are separate scope.

## 6. Typed transport and server criteria

Read existing date-only API DTOs/converters and ERP-07. No HTTP/API/schema change.
Preserve calendar day across timezone/DST; do not infer timestamp behavior from
date-only strings. Exact Permission Action Matrix N/A technical preparation.

## 7. Create, edit, view, and lifecycle contract

No business journeys implemented. Future shared contract must cover writeValue,
reset, clear, touched/dirty, server errors, focus and semantic draft revisions;
register only actual future runtime evidence after Phase00 authorization.

## 8. UX states, permissions, offline, and mock data

Required/Deferred/Excluded decisions for the future input remain to be frozen.
No persistence/offline queue/business mock generator or authority duplication.

## 9. Concurrency, transactions, and consistency

No mutations or database transactions. Reconcile invalid manual text, form reset,
external value updates and pending/readonly transitions with shared field rules.

## 10. i18n, RTL, accessibility, and responsive behavior

Audit SQL-backed captions, existing calendar locale resources and five palettes.
Freeze EN/AR keyboard, compact/wide, focus/error links and timezone edge coverage.
No catalog change now. Five-point domain UI/migration audit N/A preparation only.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A6 Closed | Read-only date wire/source audit and exact no-new-API boundary | This contract |
| 2 | Web | Verified | API/source audit | Reuse audit, frozen input contract, Phase00 and exact bounded entry | This contract |
| 3 | Mobile | Verified | Web evidence | Retained-source classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Exact unit/browser/semantic proof after runtime authorization | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical books/report/manifest/recipes and handoff | This contract |

Next-step rule: this feature is Closed; S1-A8 angular-numeric-field-foundation preparation is the sole Active feature.

## 12. Verification contract

Graphify/source audit, exact smallest frozen contract, four applied books/current-
only manifest and Phase00 checks precede runtime. Then prove date-only roundtrip
under timezone edges, shared form validation, keyboard/RTL/clear/reset and current
regressions. Source evidence alone cannot mark an Angular input Verified.

## 13. Child exit gate

- [x] S1-A6 Phase06 Verified/Closed with portable evidence.
- [x] Sole preparation owner registered with actual source paths.
- [x] Full source/semantic/reuse audit and frozen DATE_ONLY_FIELD_CONTRACT.
- [x] Four applied books/current-only manifest/recipes registered; current325 entry checks follow.
- [x] Exact bounded runtime/Phase06 Verified:173 unit/date40+final8/timezone10/API43/catalog7 and regressions. 325-recipe/planning canonical closure passed.

Customer Education N/A technical preparation; technical handoff after Verified.
Overall plan remains Draft; PROD-002/017/019/RISK-018 keep their release gates.

Bounded entry2026-10-29:325 recipe/planning checks pass; exact date-only shared field/catalog/dev proof authorized. Overall plan Draft; no API business/schema/native/UTC scheduling.

Phase06 Verified2026-10-29: portable report and verified consumer handoff registered. Source refinements enforce earlier-year manual input, synchronous calendar binding and lazy root load. No new domain/schema/UTC/native runtime.

Canonical closure2026-10-29:325 recipe/planning checks passed after Phase06; report/portable proof/technical education registered. Historical preparation wording records entry constraints; current books/report own verified runtime.
