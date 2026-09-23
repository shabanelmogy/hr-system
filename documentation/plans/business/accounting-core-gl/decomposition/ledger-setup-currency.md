# Ledger Setup Currency — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-currency` |
| Child feature name | Ledger Setup Currency |
| Owner | Accounting |
| Depends on | existing Accounting module foundation |
| Execution status | `1A` — Phase 07 Closed 2026-09-22 |
| Contract status | `Closed — reviewed 2026-09-22` |
| Verification decision | `Verified` — Currency-owned gates passed; sibling/global and release-only findings classified in the review artifact |

## 1. Child boundary and outcome

Own the Accounting company Currency master, its active lookup/catalog contract and
the Web/Mobile management workflow. Independent acceptance proves one writable
Accounting owner, complete lifecycle and authoritative consumer lookup. Functional
Currency selection, FX history and HR business-record ownership are outside this child.

Existing umbrella/API/Web/Mobile implementation is review evidence only until this
child package reconciles it against this contract; prior runtime does not bypass the
child exit gate.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Fiscal Years client architecture | `web-next/src/modules/accounting/fiscal-years/` and `mobile-react/src/modules/accounting/fiscal-years/` | Accounting route/service/query/form discipline | Currency fields/lifecycle/catalog semantics |
| Existing Currency evidence | `web-next/src/modules/accounting/currencies/` and `mobile-react/src/modules/accounting/currencies/` | current route/list/form evidence | child completion requires typed server-list truth and Screen Contract evidence |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`, `web-next/src/shared/hooks/useServerListState.ts` | reuse | one authoritative paged list with search/status/sort |
| Web form | `web-next/src/shared/components/forms/dialog/MyForm.tsx`, `web-next/src/shared/components/forms/text-fields/MyTextField.tsx`, `web-next/src/shared/components/dialogs/confirmation/ConfirmationDialog.tsx` | reuse | create/view/edit/archive/restore |
| Mobile list/form | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/feedback/AppStateView.tsx` | reuse | native table/card/form states without local financial writes |
| Consumer lookup | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Contracts/CurrencyCatalogContracts.cs` | feature-specific composition | HR selectors consume active CurrencyCode lookup only |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required | server-managed currency collection | search/filter/sort/page, open record |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Detail/View | Required | read-only shared form/detail | inspect identity/status |
| Create/Edit | Required | shared form | create/update ISO code, bilingual names, symbol |
| Lifecycle | Required | confirmation flow | archive/restore |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create | Manage permission | enter valid ISO identity/metadata | create Currency | success refreshes list/lookups |
| Edit | active + current RowVersion | edit allowed metadata | update Currency | conflict reloads authoritative detail |
| View | View permission | open row | read only | no mutation controls in read-only mode |
| Archive/restore | Manage permission | confirm lifecycle action | archive/restore with RowVersion | status refresh; dependent-use conflict shown |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | explicit Currency detail/page/lookup/mutation DTOs with opaque RowVersion |
| Server search/filter/sort | ISO code/name/status and approved sort allow-list are server-owned |
| Paging/limits | page response includes real total metadata; client never invents total rows |
| Domain errors | invalid ISO, duplicate company code, dependency conflict, concurrency conflict |
| Cross-module contract | `IAccountingCurrencyCatalog` validates active codes for HR/future consumers |

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | distinct initial loading, background refresh, empty/no-results and retry states |
| Permission / forbidden | `AccountingSetup:View`; writes require `AccountingSetup:Manage` |
| Read-only / archived / locked | app read-only suppresses writes; archived rows remain discoverable |
| Unsaved changes / destructive confirmation | shared dirty protection and archive/restore confirmation |
| Offline/stale behavior when applicable | online-authoritative mutations; no local success synthesis |

## 8. Concurrency and consistency

Update/archive/restore send current RowVersion. A 409 invalidates/refetches detail and
list before another write. Currency lookup invalidates after committed lifecycle changes.

## 9. i18n, RTL, accessibility, and responsive behavior

Accounting EN/AR catalogs own visible strings. Shared logical layout provides RTL.
Web keyboard/focus and Mobile touch/screen-reader behavior come from shared controls;
compact views avoid page-level horizontal overflow.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | normalization/uniqueness/lifecycle/catalog tests | duplicate ISO and in-use archive |
| API/transport | exact page/lookup/mutation serialization | RowVersion + real totals |
| Web | list/form/permission/component tests | create/edit/archive/restore and conflict |
| Mobile | runtime schema/query/screen tests | active lookup + lifecycle |
| E2E/manual | API-backed EN/AR responsive journey | one owner and HR selector integration |

## 11. Child exit gate

- [x] Its boundary is implemented without absorbing sibling workflows.
- [x] Screen/workspace behavior matches this contract and the approved plan.
- [x] Reused components and any generic extensions match the reuse audit.
- [x] Typed transport and server criteria are implemented and verified.
- [x] Permissions/read-only states and concurrency behavior are verified.
- [x] i18n/RTL/accessibility/responsive requirements are verified for source and development runtime; physical release evidence remains centrally owned by `PROD-010`/`PROD-014`.
- [x] Required child-owned automated and API-backed manual evidence above is green.
- [x] The master slice records this child as complete without implying unfinished sibling features are complete.

Phase 06 recorded `Verified` and Phase 07 published
`documentation/plans/business/accounting-core-gl/education/ledger-setup-currency.md`.
Package `1A` is closed; Slice 1 remains open through packages `1B`–`1V`.
