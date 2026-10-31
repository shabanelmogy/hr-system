# Shared collection criteria URL preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A11 — Shared collection criteria URL preparation |
| Child Feature ID | angular-collection-criteria-foundation |
| Child feature name | Shared collection criteria URL preparation |
| Owner | Platform Web Shared |
| Depends on | angular-multiline-field-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded COLLECTION_CRITERIA_CONTRACT after357 Phase00 recipe/planning checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Complete SIG-06 foundation within existing Shared collections responsibility.
Typed allowlisted bounded non-sensitive applied criteria, Router/history semantics;
no business list/API wire/domain/schema/native feature or new state engine.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.criteria-preflight | Web | dev/criteria target | Verify applied criteria/URL | Existing Shared collection composition | P-001 | C-01 neutral list/child return | web-angular/src/app/dev/collection-preview.ts | Adapted | Grid/Cards/neutral detail Required; business CRUD/other views Excluded | Draft/applied/loading/error/empty/forbidden | No store | Neutral fixtures only later | No grants/scope from URL | No UI change | No runtime acceptance from source |
| platform.foundation.criteria-preflight | Mobile | No route | Retain native list/navigation | Source review | N/A — no UI | Native unchanged | mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx | Excluded | New UI Excluded | Retained behavior | Existing policy | No business mocks | No grants/schema | No UI change | No native rewrite |

## 3. Closest existing reference

Angular collection.types/CollectionPreview, scoped-read and Router; Next Countries
controller/services/current criteria ownership. Source audit before choosing codec.

## 4. Reuse and composition contract

Reuse MyDataGrid/CardList/search/filter/toolbar/paging/feedback; no parallel grid
shell or local visual controls. Extend generic collection contract only as needed.

## 5. Screen and workspace contract

Freeze smallest schema/serializer/router bridge and neutral list/editor-return
harness. Draft inputs distinct from committed criteria used by requests/export.

## 6. Typed transport and server criteria

Owner allowlist/type/operator/bounds/privacy policy. Preserve false/0/null/clear.
No API Filters[grid] format or domain DTO; pure adapter remains owner responsibility.

## 7. Create, edit, view, and lifecycle contract

Deep link/refresh/Back/Forward/editor-return; current Router URL authoritative.
No duplicate query/navigation loop; canceled/failed navigation cannot commit state.

## 8. UX states, permissions, offline, and mock data

No business views yet. Scope/permission always current context, never URL authority.
No sensitive criteria in generic default URL, no offline or business mock generator.

## 9. Concurrency, transactions, and consistency

Audit stale route transitions, rapid applies, draft cancellation and scope isolation.
No SQL/network writes/transactions. Page resets on applied filter/size/sort changes.

## 10. i18n, RTL, accessibility, and responsive behavior

Use existing SQL-backed core captions and Shared widgets. EN/AR/five palettes/
modes/390-1440, keyboard and reachable search/filter/paging. No native rewrite.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A10 Closed | Retained source/criteria ownership audit | This contract |
| 2 | Web | Verified | API/source audit | Reuse/frozen contract/Phase00 before runtime | This contract |
| 3 | Mobile | Verified | Web evidence | Retained-source classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Codec/Router/history/browser/regression proof | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Books/report/manifest/recipes/handoff | This contract |

Next-step rule: this feature Closed; S1-A12 scoped read lifecycle preparation follows.

## 12. Verification contract

Source/reuse/freeze/current-only books/manifests/recipes/Phase00 first. Round-trip
false/zero/null/clear, malformed/oversized/unapproved URLs, no-op/size-only/page
reset, current context, Back/Forward/deep link/refresh/editor-return/query counts.
Full Angular check and affected browser regressions; no live API/SQL proof implied.

## 13. Child exit gate

- [x] S1-A10 Phase06 Verified/Closed; sole next preparation registered.
- [x] Current-source/reuse/schema/history audit and frozen COLLECTION_CRITERIA_CONTRACT.
- [x] Four current books/manifests/357recipes registered; Phase00 checks follow.
- [x] Phase06 Verified252unit/criteria40+8/fresh regressions; technical guide registered, 357 recipe/planning closure passed.

Overall migration Draft; SIG-06 actual S3 pilot/export acceptance still Required.
PROD-002/017/019/RISK-018 retained; domain EF/five-point UI audit N/A technical kit.

Phase06 Verified2026-10-30: bounded optional SIG-06 criteria/URL kit accepted; actual S3/export/privacy approvals remain Required.

Canonical closure2026-10-30:357recipe/planning/diff pass after252unit/criteria40+8/current regressions and final shared toolbar spacing/curated captures.
