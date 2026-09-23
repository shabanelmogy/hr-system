# Ledger Setup Books & Journal Definitions — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-books-journals` |
| Child feature name | Books and Journal Definitions |
| Owner | Accounting |
| Depends on | existing Accounting module foundation |
| Execution status | `1D` queued after `1C` |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own `Book` and Slice 1 `Journal` definition/category/numbering configuration.
Independent acceptance proves the setup masters, lookups and lifecycle needed by
later posting work without introducing `JournalEntry`, approval or posting runtime.

Explicitly outside this child: company primary-book selection, journal-entry
Draft/Submit/Approve/Post lifecycle, posting receipts and GL effects.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Fiscal Years Web architecture | `web-next/src/modules/accounting/fiscal-years/` | Accounting service/query/form/permission/concurrency pattern | Book/Journal setup fields and lifecycle |
| Fiscal Years Mobile architecture | `mobile-react/src/modules/accounting/fiscal-years/` | layered remote/repository/use-case/query/presentation pattern | Book/Journal setup semantics |
| Current Ledger Setup evidence | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | existing route/workflow evidence | generic resource renderer is replaced by typed child composition |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`, `web-next/src/shared/hooks/useServerListState.ts` | reuse | separate Book and Journal collections |
| Web form/lifecycle | `web-next/src/shared/components/forms/dialog/MyForm.tsx`, `web-next/src/shared/components/forms/selects/MySelect.tsx`, `web-next/src/shared/components/dialogs/confirmation/ConfirmationDialog.tsx` | reuse | typed Book and Journal forms + archive/restore |
| Mobile | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/feedback/AppStateView.tsx`, `mobile-react/src/shared/components/dialogs/confirmation/ConfirmationDialog.tsx` | reuse | native Book/Journal collection and form journeys |
| Book selection | child-owned active Book lookup | feature-specific composition | Journal form references only active same-company Books |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required | focused Books and Journals routes | server criteria, page, open record |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Detail/View | Required | typed read-only form/detail | inspect status and numbering configuration |
| Create/Edit | Required | shared form per aggregate | create/update Book or Journal definition |
| JournalEntry workflow | Excluded in Slice 1 | no runtime controls | no submit/approve/post actions |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create Book | Manage permission | code + bilingual names | create Book | refresh Book list/lookup |
| Edit Book | active + current RowVersion | edit allowed metadata | update Book | stale write reloads authoritative state |
| Archive/restore Book | valid dependency state | confirm | lifecycle with RowVersion | dependent-use conflicts displayed |
| Create/Edit Journal definition | active Book available | select Book; edit code/names/category/numbering/reset fields | create/update definition | no JournalEntry state is created |
| Archive/restore Journal definition | valid state | confirm | lifecycle with RowVersion | historical identity preserved |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | distinct Book detail/page/lookup and Journal detail/page/mutation contracts with RowVersion |
| Server search/filter/sort | approved code/name/status/book criteria and sort allow-lists are server-owned |
| Paging/limits | growing Journal collection returns real total metadata; clients never synthesize totals |
| Domain errors | duplicate code, inactive Book, numbering/reset validation, dependency and concurrency conflicts |
| Cross-module contract | N/A — both aggregates are Accounting-owned |

Journal numbering fields include category, number prefix, padding, reset policy and
next-number configuration exactly as authorized by the API; the client does not
invent sequence behavior.

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | distinct initial/background/empty/no-results/error/retry states per collection |
| Permission / forbidden | reads `AccountingSetup:View`; writes `AccountingSetup:Manage` |
| Read-only / archived / locked | read-only preserves view; archived records discoverable under server status criteria |
| Unsaved changes / destructive confirmation | shared dirty protection + lifecycle confirmation |
| Offline/stale behavior when applicable | mutations require server confirmation; no queued financial setup writes |

## 8. Concurrency and consistency

Protected edits and lifecycle actions use RowVersion. Book changes invalidate Book
lookup and dependent Journal queries. A stale mutation reloads the affected detail
before retry; uniqueness and numbering races remain server-authoritative.

## 9. i18n, RTL, accessibility, and responsive behavior

Accounting EN/AR catalogs own all labels and enum text. Shared forms/grids provide
RTL, keyboard/focus and screen-reader behavior. Compact Web and phone Mobile stack
forms without page-level horizontal overflow; table overflow stays inside its
approved container.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | Book/Journal validation and dependency lifecycle tests | archive referenced Book; numbering validation |
| API/transport | exact list/detail/lookup/mutation serialization | real totals, RowVersion, active Book selector |
| Web | focused Book and Journal screen/form tests | no JournalEntry actions exposed |
| Mobile | runtime schema/query/screen tests | create/edit/view/archive/restore |
| E2E/manual | API-backed setup journey | Book → Journal definition in EN/AR/read-only |

## 11. Child exit gate

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished sibling features are complete.
