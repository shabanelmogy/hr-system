# Ledger Setup Exchange Rates — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-exchange-rates` |
| Child feature name | Exchange Rate Types and Exchange Rates |
| Owner | Accounting |
| Depends on | `ledger-setup-currency` |
| Execution status | `1F` queued after `1E` |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own Accounting `ExchangeRateType` and historical/versioned `ExchangeRate` setup.
Independent acceptance proves that finance can maintain effective rate series without
restoring the former HR `ExchangeRateToDefault` authority or treating one mutable
rate as financial truth.

Explicitly outside this child: transaction-applied-rate snapshots, reporting-currency
translation and journal posting.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Accounting Fiscal Years list/form architecture | `web-next/src/modules/accounting/fiscal-years/` | server-owned list state, forms and concurrency | effective/versioned FX rules |
| Current Ledger Setup FX evidence | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | existing Types/Rates interaction evidence | typed child screen replaces generic resource renderer |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web collections | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`, `web-next/src/shared/components/forms/layouts/FormTabs.tsx`, `web-next/src/shared/components/forms/dialog/MyForm.tsx` | reuse | separate Rate Types and Rates views |
| Web inputs | `web-next/src/shared/components/forms/selects/MySelect.tsx` plus existing shared date/number form controls and `web-next/src/shared/components/feedback/` | reuse | typed currency/type/effective/rate controls |
| Mobile | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/controls/AppDateTimeField.tsx`, `mobile-react/src/shared/components/controls/AppSelectField.tsx`, `mobile-react/src/shared/components/feedback/AppStateView.tsx` | reuse | native Types/Rates workflow |
| Currency selectors | `ledger-setup-currency` active lookup | reuse | From/To Currency selectors |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required | Rate Types + historical Rates views | criteria/page/open/create/edit |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Detail/View | Required | typed detail/form | inspect pair/type/effective/version/rate |
| Create/Edit | Required | shared forms | manage type; add/update permitted historical rate data |
| Type lifecycle | Required | confirmation | archive/restore when rate-history dependency permits |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create/Edit Rate Type | Manage | code + bilingual names | create/update type | list/lookup refresh |
| Archive/restore Rate Type | valid dependency state | confirm | lifecycle with RowVersion | history dependency conflict is explicit |
| Create Rate | active type/currencies | select type/pair/effective range/version/rate | create historical rate | series refreshes without replacing history |
| Edit permitted rate metadata | current record/version | edit API-authorized fields | update historical record | stale mutation reloads record |
| View history | View | filter by type/pair/date/status | read collection | no mutation in read-only mode |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | separate ExchangeRateType and ExchangeRate detail/page/mutation/runtime schemas |
| Server search/filter/sort | type, currency pair, effective dates/status and approved sort allow-lists are server-owned |
| Paging/limits | historical rate list returns real total metadata |
| Domain errors | nonpositive rate, same/invalid pair, inactive dependency, duplicate/effective-version conflict, concurrency |
| Cross-module contract | N/A — Currency/FX are Accounting-owned |

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | separate Types/Rates loading, empty/no-results, refresh and retry states |
| Permission / forbidden | read `AccountingSetup:View`; mutate `AccountingSetup:Manage` |
| Read-only / archived / locked | read-only preserves history; archived Rate Types remain discoverable by server criteria |
| Unsaved changes / destructive confirmation | shared dirty protection; Rate Type lifecycle confirmation |
| Offline/stale behavior when applicable | mutations are online-authoritative; uncertain writes are refetched |

## 8. Concurrency and consistency

Protected mutations send RowVersion where the API requires it. Currency or Rate Type
changes invalidate selectors and relevant rate series. Effective/version uniqueness
and overlap races remain database/server authority.

## 9. i18n, RTL, accessibility, and responsive behavior

Accounting EN/AR owns labels and enum/status text. Shared logical layout handles RTL;
date/number controls remain keyboard/screen-reader accessible. Historical-rate tables
scroll inside their container on compact Web; Mobile uses touch-safe list/form layouts.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | pair/rate/effective/version/dependency tests | duplicate effective version and invalid pair |
| API/transport | typed criteria/page/mutation tests | server total + exact date/pair serialization |
| Web | focused Types/Rates screen tests | historical list remains authoritative |
| Mobile | runtime schema/query/form tests | create/view historical rates |
| E2E/manual | API-backed FX setup | filter historical pair, conflict/error, EN/AR responsive |

## 11. Child exit gate

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished sibling features are complete.
