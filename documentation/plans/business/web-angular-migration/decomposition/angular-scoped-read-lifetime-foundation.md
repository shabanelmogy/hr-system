# Shared scoped read lifecycle preparation — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A12 — Shared scoped read lifecycle preparation |
| Child Feature ID | angular-scoped-read-lifetime-foundation |
| Child feature name | Shared scoped read lifecycle preparation |
| Owner | Platform Web Shared |
| Depends on | angular-collection-criteria-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded SCOPED_READ_CONTRACT after365 Phase00 recipe/planning checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Verify/extend existing createScopedRead only where SIG-01/02/03 evidence requires.
Finite snapshot, separately owned live hint, route/session/authorization lifetime
and loading/error/retry ownership. No new global query/cache engine or business API.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.read-preflight | Web | dev/reads target | Verify snapshot/lifetime | Existing scoped read/source | P-001 | C-01 neutral read/away proof | web-angular/src/app/shared/data/scoped-read.ts | Adapted | Technical snapshot/away Required; business views Excluded | Loading/ready/error/forbidden/empty/factory-failure | No store | Neutral fixtures only later | Current owner authority | No UI change | No runtime acceptance from source |
| platform.foundation.read-preflight | Mobile | No route | Retain query ownership | Source review | N/A — no UI | Native unchanged | mobile-react/src/modules/reference-data/geography/countries/presentation/queries/use-countries.ts | Excluded | New UI Excluded | Retained behavior | Existing policy | No business mocks | No grants/schema | No UI change | No native rewrite |

## 3. Closest existing reference

createScopedRead and its three current tests; ModuleCatalogState/DashboardState/
FiscalContextState/AuthSession readIdentity and service/transport owners. Next/native
read/query ownership retained; no replacement query framework or copied API format.

## 4. Reuse and composition contract

Existing helper/read states/public API first; Shared FeedbackState/actions/surfaces
for proof. Scope/auth/API schema/timeout and business watch remain explicit owners.

## 5. Screen and workspace contract

No runtime yet. Freeze finite snapshot/error/cancel/refresh/watch separation and
small neutral proof only after current-source review. No business settings editor.

## 6. Typed transport and server criteria

Typed immutable identity/allowed predicate; service validates API data and owns
transport/timeouts. No API contract/schema/permission or domain watcher changes.

## 7. Create, edit, view, and lifecycle contract

Read only technical kit: silent stale masking/cancellation on identity/session/
route destruction, ready/error/forbidden/loading, retry and refresh coalescing.

## 8. UX states, permissions, offline, and mock data

Ownership of loading/error/retry must remain explicit. No network/offline store/
business mocks or grants from technical routes. Actual consumer checks remain S3.

## 9. Concurrency, transactions, and consistency

Audit response ordering, null identity/permission loss/destroy/rapid change,
synchronous load failure, empty snapshot and live hint during load. No mutations.

## 10. i18n, RTL, accessibility, and responsive behavior

Reuse SQL-backed captions, FeedbackState/actions/SurfaceCard; EN/AR/five palettes/
modes/390-1440/focus/retry. No native UI rewrite or global loading indicator.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A11 Closed | Retained service/transport/authority audit | This contract |
| 2 | Web | Verified | API/source audit | Existing helper/reuse/frozen contract/Phase00 | This contract |
| 3 | Mobile | Verified | Web evidence | Retained native classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Actual source/teardown/lifetime/browser/regression proof | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Books/report/manifest/recipes/handoff | This contract |

Next-step rule: this feature Closed; S1-A13 read-only foundation exit assessment follows.

## 12. Verification contract

Graphify/source/reuse/freeze/current-only books/manifests/recipes/Phase00 first.
Current helper and actual owner tests, finite/empty/sync-error/403/retry/cancel/
destroy/null/rapid identity and separate watch proof. Full Angular check/current
owner/browser regressions; actual live business SignalR/API watch not inferred.

## 13. Child exit gate

- [x] S1-A11 Phase06 Verified/Closed and single next preparation registered.
- [x] Source/owner/reuse audit and frozen SCOPED_READ_CONTRACT.
- [x] Four current books/manifest/365recipes registered; entry checks follow.
- [x] Phase06 Verified264unit/read40+8/current owner regressions; technical guide registered, 365recipe/planning closure passed.

Overall migration Draft; PROD-002/017/019/RISK-018 release gates retained.
Domain EF/five-point UI audit N/A technical helper; no live business parity claim.

Phase06 Verified2026-10-30: bounded existing read lifecycle kit accepted. FOLLOW-017 actual business consumer/watch remains Required.

Canonical closure2026-10-30:365recipe/planning/diff pass after264unit/read40+8/current owner regressions and curated capture review.
