# Angular shared collection foundation — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A3 — Shared collection foundation |
| Child Feature ID | angular-collection-foundation |
| Child feature name | Angular shared collection foundation preflight |
| Owner | Platform Web shared UI; feature data remains with its owner |
| Depends on | angular-module-context-navigation Verified/Closed |
| Execution status | Active |
| Runtime authorization | Blocked preflight-only until shared collection contracts, reviewed references and Phase00 checks pass |

## 1. Child boundary and outcome

Evidence preparation for shared Angular collection controls required before the
Countries pilot. Inspect existing MyDataGrid public contract, toolbar/search,
filters, server criteria, paging/footer/record navigation, Cards and feedback.
Freeze the smallest coherent shared-control runtime slice separately after this
preflight. No business screen, universal CRUD/query engine or API work starts here.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.collections.preflight | Web | No runtime route | Prepare shared control evidence | Technical source/contract audit | N/A — technical preflight without UI | N/A until runtime contract frozen | web-next/src/shared/components/data-grid/core/MyDataGrid.tsx | Excluded | All runtime views Excluded during preflight | Evidence gaps recorded before coding | No offline runtime | No runtime mocks yet | No new actor/grant; future data stays owner-scoped | Contract must freeze keyboard/RTL/scroll before UI entry | A reviewed source path is navigation, not proof of an Angular implementation |
| platform.foundation.collections.preflight | Mobile | No runtime route | Retain current native controls | No native change | N/A — no new UI | Existing shared native library retained | mobile-react/src/platform/modules/presentation/screens/ModuleLauncherScreen.tsx | Excluded | New native views Excluded | Existing source retained | Existing policy retained | No new mocks | No permission/schema changes | Existing native behavior | Reference is retained navigation evidence only, not a collection pattern |

## 3. Closest existing reference

Current source/capability audit: [PrimeNG Table22.1.4 capability review](../PRIMENG_TABLE_CAPABILITY_REVIEW.md).
Includes Table versus PRO Roadmap, actual installed inputs/events, TreeTable/
DataView boundaries, CSV versus whole-server export, scoped state and exact
Countries server-criteria limits. Availability is not a runtime acceptance claim.

Review MyDataGrid and Countries actual controller/composition; do not import
React/MUI into Angular or copy feature fields into shared controls. Review any
matching Angular Shared feedback/toolbar/controls before creating parallels.

## 4. Reuse and composition contract

Shared first; PrimeNG internal adapter, owner services/state external. No raw
PrimeNG table bypass. Scope here is evidence only; exact runtime options and
widget decomposition are not approved by this preparation contract.

## 5. Screen and workspace contract

No customer/runtime screen is created in preflight. Future collection harness
and P-001/C-rules require a reviewed contract before source implementation.

## 6. Typed transport and server criteria

Inspect existing criteria/paging/sort/selection/export semantics. No API client,
DTO, new endpoint or server-side collection guarantee is invented.

### Permission Action Matrix

No runtime action in this technical audit. Subsequent consumers supply their exact
Resource:Action/scope matrix; shared controls cannot authorize data themselves.

## 7. Create, edit, view, and lifecycle contract

No entities or stateful business write. Shared data entry and dirty workflow
remain under existing form contracts/FOLLOW-014, not this preflight.

## 8. UX states, permissions, offline, and mock data

Freeze loading/empty/error/forbidden/filter/paging/selection contracts in Phase00.
Do not ship placeholder screens, business mock generators or offline stores.

## 9. Concurrency, transactions, and consistency

Inspect scope cancellation and server criteria ownership. No transaction/migration
or speculative caching framework. Any material unresolved finding uses central notes.

## 10. i18n, RTL, accessibility, and responsive behavior

Review reusable core labels/tokens and actual source keyboard, layout/scroll,
column/paging controls and record navigation before selecting runtime adapters.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Active | S2-A6 Closed | Existing transport/criteria audit only; no API code | documentation/plans/business/web-angular-migration/decomposition/angular-collection-foundation.md |
| 2 | Web | Queued | Bounded source/contracts and Phase00 | Shared collection runtime only after explicit gate | Same contract |
| 3 | Mobile | Queued | Web verified | Existing native retained or reasoned N/A | Same contract |
| 4 | Integrated live verification | Queued | Prior stages verified | Actual consumer proof at its contract | Same contract |
| 5 | Documentation and closure | Queued | Phase06 Verified | Canonical evidence and applicable education | Same contract |

Next-step rule: no sibling runtime until this child is Verified and its documentation/closure is Closed.

## 12. Verification contract

Preflight only. Source references and exact options must be inspected and
registered; no implementation/build/browser or Phase06 success claimed here.

## 13. Child exit gate

- [ ] Current source/shared contract audit, decomposition and Phase00.
- [ ] Bounded runtime authorization before code.
- [ ] Future verification/education follows its accepted runtime scope.

This is the sole next preparation owner, not an additional runtime feature.
