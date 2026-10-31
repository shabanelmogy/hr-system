# Angular shared collection foundation — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A3 — Shared collection foundation |
| Child Feature ID | angular-collection-foundation |
| Child feature name | Angular shared collection foundation |
| Owner | Platform Web shared UI; feature data remains with its owner |
| Depends on | angular-module-context-navigation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact bounded S1-A3 after frozen SHARED_COLLECTION_CONTRACT, current Phase00 books/manifest and285 recipe/planning pass; remaining G4 release-only |

## 1. Child boundary and outcome

Implement the frozen generic Table/Cards collection kit and development-only harness in SHARED_COLLECTION_CONTRACT.md. Preserve current shared toolbar/search/slots, single server sort, known/unknown paging/footer/record navigation, active/page-only selection, density/visibility, feedback and scoped stale-result mask. No Countries screen, business CRUD/query engine, new API/schema/grants or native UI. All advanced capabilities follow the explicit Required/Deferred/Excluded matrix.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.collections | Web | dev/collections excluded in production | Verify shared collection presentation | Generic controlled Table/Cards and technical fixtures | P-001 | C-02 Table/Cards; CRUD/forms Excluded | web-next/src/shared/components/data-grid/core/MyDataGrid.tsx | Implemented | Table/Cards Required; Chart/Report/Import/Export/Tree Excluded | Loading/empty/error/forbidden/stale/invalid, scoped selection/paging | No offline/persistent state | Neutral synthetic records only | Caller scope/permissions; no HTTP or business grants | EN/AR/modes/compact/wide, keyboard/focus/scroll | PrimeNG adapter; not a Countries/business acceptance claim |
| platform.foundation.collections | Mobile | No runtime route | Retain current native controls | No native change | N/A — no new UI | Existing shared native library retained | mobile-react/src/shared/components/data-table/AppDataTable.tsx | Excluded | New native views Excluded | Existing source retained | Existing policy retained | No new mocks | No permission/schema changes | Existing native behavior | Retained native collection source; no new native UI |

## 3. Closest existing reference

Current source/capability audit: [PrimeNG Table22.1.4 capability review](../PRIMENG_TABLE_CAPABILITY_REVIEW.md).
Includes Table versus PRO Roadmap, actual installed inputs/events, TreeTable/
DataView boundaries, CSV versus whole-server export, scoped state and exact
Countries server-criteria limits. Availability is not a runtime acceptance claim.

Review MyDataGrid and Countries actual controller/composition; do not import
React/MUI into Angular or copy feature fields into shared controls. Review any
matching Angular Shared feedback/toolbar/controls before creating parallels.

## 4. Reuse and composition contract

Shared first: MyDataGrid/CardList compose common toolbar/footer/feedback, typed templates and current controls. PrimeNG stays internal. Caller owns source/query/HTTP/grants; Shared has only ephemeral UI Signals. Exact options and combinations are frozen in SHARED_COLLECTION_CONTRACT.md; advanced opt-ins are FOLLOW-016.

## 5. Screen and workspace contract

Development-only dev/collections verifies the generic kit; production routes exclude it. No customer/business screen is created. Table and Cards share query/result/feedback/paging semantics; owner templates supply content. Frozen contract owns scope/count/navigation/selection and presentation requirements.

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
| 1 | API | Verified | S2-A6 Closed | Existing transport/criteria audit only; no API code | documentation/plans/business/web-angular-migration/decomposition/angular-collection-foundation.md |
| 2 | Web | Verified | Bounded source/contracts and Phase00 | Shared collection runtime only after explicit gate | Same contract |
| 3 | Mobile | Verified | Web verified | Existing native retained or reasoned N/A | Same contract |
| 4 | Integrated live verification | Verified | Prior stages verified | Technical fixture/source comparison passed; business/live host excluded | Same contract |
| 5 | Documentation and closure | Closed | Phase06 Verified | Canonical evidence and applicable education | Same contract |

Next-step rule: no sibling runtime until this child is Verified and its documentation/closure is Closed.

## 12. Verification contract

Frozen Phase00 source/reuse audit and285 recipe/planning pass precede runtime. Required unit/browser/reference checks are in SHARED_COLLECTION_CONTRACT.md; actual Phase06 Verified evidence is IMPLEMENTATION_REPORT.md with portable verification files. New canonical labels use normal catalog generation; hosted API catalog acceptance remains PROD-019.

## 13. Child exit gate

- [x] Current source/shared contract audit, decomposition and Phase00.
- [x] Exact bounded runtime authorization before code.
- [x] Phase06 Verified; technical education N/A; canonical285 recipe/planning closure checks passed.

This bounded feature is Verified/Closed; its technical review guide and portable evidence are registered. G0-G3 fixed for exact generic kit; remaining release G4 PROD-002/017/019/RISK-018. Overall plan remains Draft.
