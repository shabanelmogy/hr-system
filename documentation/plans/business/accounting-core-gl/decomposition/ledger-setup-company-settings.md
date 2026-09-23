# Ledger Setup Company Settings — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-company-settings` |
| Child feature name | Accounting Company Settings |
| Owner | Accounting |
| Depends on | `ledger-setup-currency`, `ledger-setup-books-journals` |
| Execution status | `1E` queued after `1D` |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own the one-row-per-company `AccountingCompanySettings` workflow that selects
`FunctionalCurrencyId` and `PrimaryBookId` with RowVersion. Independent acceptance
proves explicit company financial policy configuration without deriving either
selection from Currency metadata, Book identity, HR data or UI state.

Explicitly outside this child: Currency and Book master lifecycle, additional
adjustment books, reporting-currency policy and posting runtime.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Accounting Fiscal Years forms | `web-next/src/modules/accounting/fiscal-years/` | Accounting form/query/concurrency discipline | singleton two-reference policy instead of collection lifecycle |
| Current settings evidence | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | current route and save evidence | dedicated typed singleton editor replaces generic collection assumptions |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web editor | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/forms/dialog/MyForm.tsx`, `web-next/src/shared/components/forms/selects/MySelect.tsx`, `web-next/src/shared/components/feedback/` | reuse | one singleton editor, no grid shell |
| Mobile editor | `mobile-react/src/shared/components/layout/AppPageHeader.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/controls/AppSelectField.tsx`, `mobile-react/src/shared/components/feedback/AppStateView.tsx` | reuse | full-screen/native singleton editor |
| Currency lookup | `ledger-setup-currency` active lookup | reuse | Functional Currency selector |
| Book lookup | `ledger-setup-books-journals` active Book lookup | reuse | Primary Book selector |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Excluded | singleton is not a fake collection | N/A |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Detail/View | Required | settings summary/form | inspect configured policy |
| Create/Edit | Required as singleton save/update | two authoritative selectors | configure/update functional currency + primary book |
| Archive/restore | Excluded | singleton identity has no delete lifecycle | N/A |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| First configuration | unconfigured company + Manage | select active Currency and Book | singleton PUT/save | persisted settings become authoritative |
| View | configured + View | inspect selections | GET singleton | read-only mode has no save action |
| Update | configured + Manage + RowVersion | change eligible selector | update singleton | 409 reloads current settings |
| Unconfigured read | no row exists | open route | typed not-configured response/state | editable empty form for Manage; informative empty state for View |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | singleton GET/PUT DTO with FunctionalCurrencyId, PrimaryBookId and opaque RowVersion |
| Server search/filter/sort | N/A — singleton; dependency lookups own their criteria |
| Paging/limits | N/A — singleton |
| Domain errors | missing/inactive/foreign Currency or Book, singleton uniqueness and concurrency conflict |
| Cross-module contract | N/A — dependencies are Accounting-owned child contracts |

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | initial loading, unconfigured, load error/retry and saving states are distinct |
| Permission / forbidden | read `AccountingSetup:View`; save `AccountingSetup:Manage` |
| Read-only / archived / locked | global read-only shows current policy and blocks save; archived dependencies are not selectable |
| Unsaved changes / destructive confirmation | shared dirty-navigation protection; no destructive lifecycle |
| Offline/stale behavior when applicable | online-authoritative save; no cached write success |

## 8. Concurrency and consistency

Every update sends current RowVersion. Conflict reloads singleton plus dependency
lookups. Currency/Book lifecycle changes invalidate the settings dependencies so the
form cannot silently retain newly ineligible choices.

## 9. i18n, RTL, accessibility, and responsive behavior

Accounting EN/AR owns labels/help/error text. Shared select/form behavior covers RTL,
keyboard/focus/screen-reader semantics. The two-field policy editor remains readable
on compact Web and phone layouts and may use wider inline composition on desktop/tablet.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | singleton/reference/concurrency tests | inactive Currency/Book and duplicate singleton |
| API/transport | exact GET/PUT/unconfigured contract | RowVersion round trip |
| Web | singleton editor tests | first config, update, read-only, conflict |
| Mobile | runtime schema/form/query tests | first config + retry/error state |
| E2E/manual | API-backed company setup | Currency + Book selected then reload persisted values |

## 11. Child exit gate

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished sibling features are complete.
