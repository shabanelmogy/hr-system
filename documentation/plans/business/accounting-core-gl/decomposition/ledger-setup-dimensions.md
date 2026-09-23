# Ledger Setup Dimensions — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-dimensions` |
| Child feature name | Dimensions and Account Dimension Policies |
| Owner | Accounting |
| Depends on | `ledger-setup-coa-hierarchy` |
| Execution status | `1C` queued after `1B` |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own DimensionDefinition, DimensionValue, typed value-source capability and
AccountDimensionPolicy. Independent acceptance proves definitions/values and an
account-scoped Required/Optional/Forbidden relationship workflow. Journal-line
assignments and posting validation belong to later slices.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Existing Ledger Setup dimensions evidence | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | current tabs/scope workflow evidence | replace generic record/renderer with typed child boundaries |
| Mobile setup composition | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | segmented resource/scope interaction evidence | typed domain/runtime schemas and dedicated child orchestration |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web collections | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`, `web-next/src/shared/components/forms/dialog/MyForm.tsx`, `web-next/src/shared/components/forms/selects/MySelect.tsx` | reuse | definition/value lists and forms |
| Web child navigation | `web-next/src/shared/components/forms/layouts/FormTabs.tsx` where form-tab semantics fit; otherwise the established Accounting route/tab composition | reuse/compose | Definitions / Values / Account Constraints without a new generic navigator |
| Mobile | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/controls/AppSelectField.tsx` | reuse | typed native views and scoped selection |
| Account constraint composition | Account lookup/detail seam from `ledger-setup-coa-hierarchy` | feature-specific composition | show/edit policy without generic EAV mutation |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required | Definitions and Values collections | search/page/view/create/edit/lifecycle |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Detail/View | Required | typed definition/value/policy detail | inspect source/status/policy |
| Create/Edit | Required | definition/value forms + policy relationship editor | manage code/name/source/value/policy |
| Account Constraints | Required | account-scoped relationship view | choose Required/Optional/Forbidden by definition |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Definition create/edit | Manage permission | code/names/value source | create/update definition | source capabilities are server-authoritative |
| Value create/edit | active definition scope | code/names or typed external reference | create/update value | invalid source/reference rejected |
| Archive/restore | valid dependency state | confirm | definition/value lifecycle | dependent-policy conflicts visible |
| Account policy | account selected | set requirement per definition | upsert AccountDimensionPolicy | relationship stays visible in Account detail |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | separate definition, value, capability and account-policy DTO/runtime schemas |
| Server search/filter/sort | definition/value criteria are server-owned; account policy lookup is account-scoped |
| Paging/limits | growing definition/value lists return real totals; selector traversal cannot silently truncate |
| Domain errors | unsupported source, duplicate code, inactive definition/reference, dependency/concurrency |
| Cross-module contract | external value source appears only when its owner Contract/adapter exists |

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | scope lookup and collection loading/errors are independently visible |
| Permission / forbidden | reads `Dimensions:View`; writes `Dimensions:Manage` |
| Read-only / archived / locked | read-only keeps definitions/values/policies inspectable; mutations hidden/blocked |
| Unsaved changes / destructive confirmation | shared dirty protection; lifecycle confirmation |
| Offline/stale behavior when applicable | online-authoritative; retry/refetch scoped data |

## 8. Concurrency and consistency

Definition/value protected updates use RowVersion. Policy upsert follows its typed
relationship contract. Mutations invalidate dimensions and the affected Account
constraint composition so Account detail cannot show stale rules.

## 9. i18n, RTL, accessibility, and responsive behavior

Accounting EN/AR owns all labels/source names/requirements. Shared logical layout,
field focus/error behavior, accessible tabs/segmented controls and compact stacking
are Required on Web and Mobile.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | source/policy/lifecycle tests | unsupported typed source rejected |
| API/transport | exact scoped query/upsert/runtime schema tests | value pagination + policy account scope |
| Web | typed tabs/list/form/policy tests | Account constraints compose with COA detail |
| Mobile | typed scope/list/form tests | searchable scope and read-only policy view |
| E2E/manual | API-backed definition→value→account-policy journey | EN/AR RTL + permission subsets |

## 11. Child exit gate

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished sibling features are complete.
