# Ledger Setup Currency — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-currency` |
| Child feature name | Ledger Setup Currency |
| Owner | Accounting |
| Depends on | existing Accounting module foundation |
| Execution status | `Queued` — historical package `1A` is closed; current v2 revalidation follows Fiscal Years closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; historical Phase 06/07 evidence remains in the Currency review and education artifact |

## 1. Child boundary and outcome

This child owns the company Currency master, its active lookup/catalog contract,
and the Web/Mobile management journey. Independent acceptance proves one writable
Accounting owner, complete lifecycle, server-managed list truth, bilingual stored
names, and an authoritative consumer lookup. Functional Currency selection, FX
history, and HR business-record ownership are outside this child.

The existing closed package is historical evidence, not authority to skip the v2
UI gate or the current ordered live revalidation.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-currency-management | Web | `/finance/ledger-setup/currencies` | Manage company currencies and lifecycle | server-managed collection plus shared form | P-001 | Grid with `MyForm` detail/create/edit | `web-next/src/modules/accounting/currencies/pages/CurrenciesPage.tsx` | Implemented | Grid Required; Detail Required; Table Excluded; Cards Deferred; Tree Report Import Export Chart Excluded | initial/background loading, empty/no-results, error/retry, forbidden, dirty form, lifecycle/concurrency conflict | online authoritative | local valid draft only; no identity, scope, or RowVersion fabrication | `AccountingSetup:View/Manage`; current company | bounded grid scroll, compact dialog, RTL, keyboard focus and error links | Cards remain Deferred until a concrete Accounting workflow reopens them |
| ledger-setup-currency-management | Mobile | `/finance/ledger-setup/currencies` | Manage company currencies and lifecycle | server-managed native collection plus form | P-001 | Table/Cards through `AppListScreen`; full-screen `AppForm` | `mobile-react/src/modules/accounting/currencies/presentation/screens/CurrenciesScreen.tsx` | Implemented | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | initial/background loading, empty/no-results, error/retry, forbidden, dirty form, lifecycle/concurrency conflict | online authoritative; no queued financial writes | local valid draft only; no identity, scope, or RowVersion fabrication | `AccountingSetup:View/Manage`; current company | phone/tablet layouts, RTL, touch targets, screen-reader labels and validation focus | Native cards adapt the same server page |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-001 Countries | `web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx` and `mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx` | server list, shared states, forms, permissions and lifecycle composition | Currency does not inherit Geographic Chart/Report/Import contracts |
| Current Currency implementation | `web-next/src/modules/accounting/currencies/` and `mobile-react/src/modules/accounting/currencies/` | typed Currency ownership and evidence | current v2 revalidation must record live evidence in roadmap order |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list/form | `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`, `web-next/src/shared/hooks/useServerListState.ts`, `web-next/src/shared/components/forms/dialog/MyForm.tsx` | reuse | authoritative paged list and typed form/lifecycle dialogs |
| Mobile list/form | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx` | reuse | native Table/Cards and typed full-screen form |
| Consumer lookup | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Contracts/CurrencyCatalogContracts.cs` | feature-owned public contract | consumers validate active CurrencyCode without owning Currency writes |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Grid/Table/Cards | Web Grid Required; Mobile Table/Cards Required | server-managed collection | search, filter, sort, page, open |
| Detail/Create/Edit | Required | shared form with `NameAr` and `NameEn` as separately labelled required fields | view, create, edit both stored names |
| Archive/restore | Required | shared confirmation | lifecycle with RowVersion |
| Tree/Report/Import/Export/Chart | Excluded | not part of the Currency child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | Currency detail/page/lookup/create/update/lifecycle contracts include distinct `NameAr`, `NameEn`, ISO code and opaque RowVersion |
| Canonical routes | Accounting Currency API routes and `/finance/ledger-setup/currencies` on both clients |
| Server search/filter/sort | ISO code, Arabic name, English name, record status and approved sort allow-list |
| Paging/limits | authoritative total metadata; lookup traversal cannot silently truncate |
| Domain errors / ProblemDetails | missing bilingual name, invalid ISO, duplicate company code, dependency, permission and concurrency conflict |
| Permission and tenant/company scope | server-enforced current company; View for reads and Manage for writes |
| Cross-module contract | `IAccountingCurrencyCatalog` and Accounting active lookup |
| Persistence/schema/migration | Accounting Currency mapping/migration is the sole writable owner |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create | Manage | enter ISO identity, `NameAr`, `NameEn` and symbol | create Currency | refresh list and lookup; both names render by locale with explicit fallback policy |
| Edit | current detail/RowVersion | edit both stored names and allowed metadata | update Currency | conflict reloads authoritative detail without losing the other language silently |
| View | View or read-only | open record | GET detail | both Arabic and English names remain inspectable; mutation controls absent |
| Archive/restore | Manage and valid dependency state | confirm | lifecycle mutation with RowVersion | status refresh; dependency conflict explicit |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | initial/background loading, empty/no-results, persistent error and retry are distinct |
| Permission / forbidden / read-only | View reads; Manage writes; global read-only preserves inspection and removes writes |
| Archived / locked | archived records remain discoverable under server criteria |
| Unsaved changes / destructive confirmation | shared dirty protection plus archive/restore confirmation |
| Offline / stale / conflict | online-authoritative mutations; uncertain writes refetch; 409 reloads detail/list |
| Mock data | local draft supplies valid Arabic and English names only; never submit or fabricate identity, scope, RowVersion, lookup, or success |

## 9. Concurrency, transactions, and consistency

Update/archive/restore send current RowVersion. Committed lifecycle changes
invalidate page, detail, and lookup keys. A 409 refetches authoritative state
before another write; database uniqueness remains the final race authority.

## 10. i18n, RTL, accessibility, and responsive behavior

UI labels/messages live in Accounting EN/AR catalogs, while `NameAr` and `NameEn`
are separate persisted business values. Forms label and validate both; lists,
cards and details use current-locale display with a documented fallback and never
overwrite one language from the other. Shared layout provides RTL, error links and
first-invalid focus. Web bounds grid scrolling; Mobile uses phone/tablet-safe views.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Currency boundary approved | typed owner, bilingual fields, catalog, migration, permissions and tests | `documentation/project/LEDGER_SETUP_CURRENCY_FEATURE_FULL_REVIEW.md` |
| 2 | Web | Verified | API Verified | bilingual typed list/form/lifecycle and tests | `documentation/web-next/features/ledger-setup-currency-frontend-reference.md` |
| 3 | Mobile | Verified | Web Verified | runtime schemas, bilingual native journey and tests | `documentation/mobile-react/ledger-setup-currency-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | Fiscal Years closure and prior stages Verified | agent sends detailed authenticated API/Web/actual-Mobile v2 scenario; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | current integrated verification Verified and explicit user acceptance recorded | reconcile historical Phase 07 material and close roadmap row | `documentation/plans/business/accounting-core-gl/education/ledger-setup-currency.md` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact data, Web and actual-device steps, EN/AR and
RTL/LTR checks, expected outcomes, negative/read-only/conflict cases, cleanup and
evidence. The feature remains Active until the user explicitly accepts the result.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed`, with explicit user acceptance recorded. Historical closure does not bypass
current ordered revalidation.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | normalization, bilingual requiredness, uniqueness, lifecycle, catalog | duplicate ISO and missing one language | historical evidence verified; current live revalidation queued |
| API/transport | exact bilingual page/lookup/mutation serialization | `NameAr`/`NameEn`, RowVersion and totals | historical evidence verified |
| Persistence/migration | live Accounting schema evidence | sole writable owner and both name columns | recheck during live stage |
| Web | list/form/permission/component tests | create/edit/view both names plus conflict | source tests verified |
| Mobile | runtime schema/query/screen tests | Table/Cards and both names | source tests verified |
| E2E/manual/live | authenticated EN/AR responsive journey | enter, edit and view Arabic and English names | queued after Fiscal Years closure |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-001 is registered and reviewed.
- [x] Boundary, typed source ownership, bilingual fields, Web, Mobile and historical evidence are reconciled.
- [ ] Current authenticated integrated API/Web/Mobile revalidation is recorded in roadmap order.
- [ ] Live database schema/migration evidence is refreshed for the current run.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Creation, editing, viewing and listing verify both Arabic and English stored names.
- [ ] Documentation/manifest/recipe and education evidence are reconciled after verification.
- [ ] The roadmap records current closure before COA becomes Active.
