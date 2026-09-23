# Ledger Setup Link Accounts — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-link-accounts` |
| Child feature name | Link Accounts |
| Owner | Accounting |
| Depends on | `ledger-setup-books-journals`, `ledger-setup-coa-hierarchy` |
| Execution status | `1G` queued after `1F` |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own the simple Link Accounts UX over direct, typed, effective `AccountMapping`
records. Independent acceptance proves that a company-purpose default and every
actually available typed source can map deterministically to an eligible Account.

Explicitly outside this child: conditional Posting Profile rules, fake source
masters, source-owned business workflows and posting execution.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Current account-determination evidence | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | existing mapping route/form evidence | dedicated typed Link Accounts composition replaces generic fields |
| Shared setup list/form systems | `web-next/src/shared/components/data-grid/` and shared form components | server list + accessible form behavior | capability-driven source selectors |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list/form | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`, `web-next/src/shared/components/forms/dialog/MyForm.tsx`, `web-next/src/shared/components/forms/selects/MySelect.tsx`, `web-next/src/shared/components/feedback/` | reuse | typed direct-mapping collection and editor |
| Mobile list/form | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/controls/AppSelectField.tsx`, `mobile-react/src/shared/components/feedback/AppStateView.tsx` | reuse | native mapping workflow |
| Account/Book selectors | lookups from `ledger-setup-coa-hierarchy` and `ledger-setup-books-journals` | reuse | only active eligible same-company choices |
| Source capabilities | Accounting typed capability catalog | feature-specific composition | render source type/reference only when owner Contract exists |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required | Link Accounts child view under account determination | criteria/page/open/create/edit |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Detail/View | Required | mapping detail | inspect purpose/context/account/effective dates |
| Create/Edit | Required | capability-driven form | choose Book/purpose/source/reference/Account/effective range |
| Unsupported source UI | Excluded | no disabled/dead placeholders | unavailable source types are absent |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create company-purpose mapping | Manage | Book + purpose + Account + effective range | create AccountMapping | mapping appears in authoritative list |
| Create source-specific mapping | capability available | choose supported source + validated reference | create typed mapping | unavailable source cannot be selected |
| Edit/version effective mapping | current record | edit API-authorized effective mapping fields | update/version mapping | history/effective semantics retained |
| View | View permission | inspect mapping | read only | no mutation controls in read-only mode |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | AccountMapping detail/page/mutation + source-capability/reference contracts |
| Server search/filter/sort | Book, purpose, source type/reference, Account, effective/status criteria and allow-list |
| Paging/limits | mapping collection returns real total metadata |
| Domain errors | unsupported source, invalid reference, inactive Account/Book, overlap/ambiguity, concurrency |
| Cross-module contract | source-specific type appears only when the owning module exposes a stable validating Contract/projection |

Company-purpose default is always available. BankAccount, PaymentMethod,
Cashbox/Safe, ContactGroup and PartyRole are never synthesized merely to populate UI.

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | collection and capability/reference lookup states are independently visible |
| Permission / forbidden | read `AccountingSetup:View`; mutate `AccountingSetup:Manage` |
| Read-only / archived / locked | read-only preserves mappings; effective history follows server contract |
| Unsaved changes / destructive confirmation | shared dirty protection; any destructive/effective replacement action uses explicit confirmation |
| Offline/stale behavior when applicable | online-authoritative; capability/reference failure blocks save rather than guessing |

## 8. Concurrency and consistency

Protected updates use the current concurrency token when defined by the route.
Account/Book/source-capability changes invalidate mapping selectors. Effective-range
and competing-winner races are resolved by the server and refetched after conflicts.

## 9. i18n, RTL, accessibility, and responsive behavior

Purpose/source labels and all visible text are Accounting EN/AR. Dynamic selectors
have accessible labels/loading/error states; RTL uses shared logical layout. Compact
layouts stack context fields without hiding effective-date or account information.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | mapping/effective/capability tests | company default resolves; unsupported source rejected |
| API/transport | typed capability/reference/page/mutation tests | no fake source option and real totals |
| Web | mapping list/form tests | capability-driven field visibility |
| Mobile | runtime schema/query/form tests | lookup error blocks save |
| E2E/manual | API-backed mapping journey | default mapping + one real typed source when available |

## 11. Child exit gate

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished sibling features are complete.
