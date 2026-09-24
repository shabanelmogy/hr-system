# Ledger Setup COA & Hierarchy — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-coa-hierarchy` |
| Child feature name | Chart of Accounts and Hierarchy Levels |
| Owner | Accounting |
| Depends on | `ledger-setup-currency` |
| Execution status | `1B` — API Phase 01 + Web Phase 02 + Mobile Phase 03 implemented; Phase 06 pending |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own AccountHierarchyLevel and Account setup: company hierarchy, server-proposed
editable account code, posting/manual-posting/currency policies, tree/detail and
archive/restore. Independent acceptance proves the account hierarchy without
claiming Dimensions, JournalEntry posting or final cross-package verification.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Shared tree primitive | `web-next/src/shared/components/tree-view/SplitTreeView.tsx` | tree/search/selection/detail-panel composition | Accounting owns fields/rules and server authority |
| Cost Center master/detail | `web-next/src/modules/hr/basic-data/organizational-structure/management/components/tree-view/CostCenterTreeDiagram.tsx` | controlled selection, `renderDetailPanel`, `renderEmptyDetailPanel`, add-child/edit affordances, bounded detail pane | no HR fields/permissions/move rules/domain code copied |
| Mobile hierarchy | `mobile-react/src/shared/components/tree-view/AppHierarchicalTree.tsx` | touch-friendly hierarchy/search/actions | mobile account detail/form is Accounting-specific |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web workspace | `web-next/src/shared/components/tree-view/SplitTreeView.tsx` and its `HierarchicalTreeList` composition | reuse | master tree + selected-account detail pane |
| Web detail/form | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/forms/dialog/MyForm.tsx`, shared form/feedback exports | feature-specific composition | account policy fields + detail fetch |
| Hierarchy-level list | `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx` + `web-next/src/shared/components/forms/dialog/MyForm.tsx` | reuse | focused `/hierarchy-levels` screen |
| Mobile hierarchy/form | `mobile-react/src/shared/components/tree-view/AppHierarchicalTree.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/feedback/AppStateView.tsx` | reuse | tree then explicit view/create/edit journey |

The generic `LedgerSetupRecord`/resource renderer is not an approved reuse target.

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required for Hierarchy Levels | focused server list | create/view/edit/archive/restore levels |
| Tree/Hierarchy | Required for Accounts | Web split master/detail; Mobile hierarchical tree | search/select/expand, add child, open detail |
| Detail/View | Required | selected account details from full detail endpoint | inspect policies/status/parent/level |
| Create/Edit | Required | account form with contextual parent | proposed code, names, posting/manual/currency policy |
| Mock draft action | Required | shared `MyForm` / `AppForm` action on writable Account and Hierarchy Level forms | Account keeps the server-proposed code, uses a loaded active hierarchy level, keeps only a valid contextual non-posting parent, and selects a real currency lookup only; Hierarchy Level chooses the next positive number unused by active **or archived** loaded levels and bilingual sample names |
| Drag/reparent | Excluded until explicit API contract | no inferred DnD | parent changes use approved account mutation only |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Add root/child | Manage permission | choose parent/level; accept/edit proposed code | create Account | tree/detail refresh |
| Edit | selected active account + full detail | update permitted fields | update with RowVersion | conflict reloads selected detail |
| View | selected node | inspect full detail | GET detail | no mutations in read-only mode |
| Archive/restore | valid lifecycle | confirm | archive/restore | history preserved; dependency errors shown |
| Manage level | Accounts:Manage | edit level order/name/CanPost | level mutation | account dependency rules remain server-owned |

Account create/edit/detail exposes parent, configured level, server-proposed editable
code, bilingual names, AllowPosting, ManualPostingPolicy, CurrencyPolicy and
conditional SpecificCurrencyId. Package `ledger-setup-dimensions` composes account
dimension constraints before umbrella verification.

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | distinct tree node, account detail, hierarchy-level, lookup and mutation DTOs |
| Server search/filter/sort | Account search/list criteria and hierarchy-level allow-lists are explicit; tree follows parent IDs |
| Paging/limits | any paged fallback returns real totals; tree endpoint returns complete permitted hierarchy |
| Domain errors | duplicate/proposed-code conflict, invalid parent/level, posting-with-children, dependency, concurrency |
| Cross-module contract | Currency lookup from Accounting Currency child; no cross-module EF access |

Server-proposed code is an explicit query/endpoint result. Per D-024, the baseline
proposal is a company-wide, non-hierarchical `ACC-####` convenience value using the
next reserved numeric suffix across active and archived accounts. The proposal is
not a reservation: the client must not synthesize it, the user may edit it, hierarchy
never derives from it, and a concurrent duplicate is resolved by the database unique
constraint followed by refetching a fresh proposal.

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | tree loading, empty-company overview, selected-detail loading/error and retry are distinct |
| Permission / forbidden | reads `Accounts:View`; writes `Accounts:Manage` |
| Read-only / archived / locked | read-only keeps tree/detail; archived identity remains viewable according to server contract |
| Unsaved changes / destructive confirmation | shared dirty guard; archive/restore confirmation |
| Offline/stale behavior when applicable | online mutations; refetch selected detail before protected write |

## 8. Concurrency and consistency

Tree nodes are lightweight and do not authorize writes. Selecting/opening an account
fetches current typed detail/RowVersion before edit or lifecycle actions. A stale
write reloads account detail and tree. Parent/level/account resources invalidate as a
coherent key family after committed changes.

## 9. i18n, RTL, accessibility, and responsive behavior

All names/actions/help text are Accounting EN/AR. Web tree/detail uses logical
spacing, keyboard-accessible tree/actions and bounded internal scrolling. Compact Web
stacks detail safely. Mobile uses touch targets/screen-reader labels and does not
force the desktop split-pane model on narrow phones.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | hierarchy/posting/code/lifecycle tests | posting account cannot gain child |
| API/transport | typed tree/detail/proposed-code/mutation tests | detail RowVersion + code race |
| Web | SplitTreeView composition + account form tests | Cost Center interaction reuse without HR domain coupling |
| Mobile | AppHierarchicalTree/form tests + mock-draft utility tests | add child, view/edit, read-only, valid local Account/Hierarchy Level drafts |
| Mock data | pure utility tests on both platforms | no code synthesis, no fabricated lookup/identity/concurrency/scope values, next unused level number |
| E2E/manual | API-backed tree/detail journey | proposed code, archive/restore, EN/AR RTL, compact/phone/tablet |

## 11. Child exit gate

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished sibling features are complete.
