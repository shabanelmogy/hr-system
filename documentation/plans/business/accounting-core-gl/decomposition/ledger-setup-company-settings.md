# Ledger Setup Company Settings — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-company-settings` |
| Child feature name | Accounting Company Settings |
| Owner | Accounting |
| Depends on | `ledger-setup-currency`, `ledger-setup-books-journals` |
| Execution status | `Queued` after Books/Journals closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; current generic singleton is compatibility evidence only |

## 1. Child boundary and outcome

This child owns the one-row-per-company `AccountingCompanySettings` workflow that
selects `FunctionalCurrencyId` and `PrimaryBookId` with RowVersion. Independent
acceptance proves explicit company financial policy without deriving either choice
from UI state or another domain. The setting itself has no business-name field;
selectors must display the persisted Arabic/English Currency and Book names from
their owning children.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-company-settings | Web | `/finance/ledger-setup/company-settings` | Configure functional currency and primary book | one singleton per company | P-005 | dedicated `MyForm` editor; no fake grid or lifecycle | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Detail Required; Grid Table Cards Tree Report Import Export Chart Excluded | loading, unconfigured, configured, lookup/load error/retry, forbidden/read-only, dirty, save conflict | online authoritative | local draft may choose only real loaded Currency/Book IDs; no identity/scope/RowVersion fabrication | `AccountingSetup:View/Manage`; current company | compact/wide form, RTL, keyboard/error focus and accessible selector states | Reference proves singleton journey only; generic resource dispatch is excluded from target |
| ledger-setup-company-settings | Mobile | `/finance/ledger-setup/company-settings` | Configure functional currency and primary book | one singleton per company | P-005 | dedicated full-screen `AppForm`; no fake list | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Detail Required; Grid Table Cards Tree Report Import Export Chart Excluded | loading, unconfigured, configured, lookup/load error/retry, forbidden/read-only, dirty, save conflict | online authoritative | local draft may choose only authoritative Currency/Book IDs | `AccountingSetup:View/Manage`; current company | phone/tablet form, RTL, touch/screen-reader selectors and validation focus | Target uses typed clean layers instead of generic resource definitions |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-005 current singleton journey | Web/Mobile paths named in the UI Pattern Gate | first-config/update/read-only/loading composition | catch-all resource definition and transport are not reused |
| Fiscal Years forms | `web-next/src/modules/accounting/fiscal-years/` and `mobile-react/src/modules/accounting/fiscal-years/` | typed Accounting form/query/concurrency discipline | this is a two-reference singleton, not a collection |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web singleton | `PageHeader`, `MyForm`, `MySelect`, shared feedback/dirty guard | reuse | typed GET/PUT editor with unconfigured state |
| Mobile singleton | `AppPageHeader`, `AppForm`, `AppSelectField`, `AppStateView` | reuse | native full-screen typed editor |
| Dependency lookups | active Currency and Book lookup contracts | reuse | display current-locale name while retaining both names in referenced details |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Singleton detail/editor | Required | two authoritative selectors | first configure, view and update |
| List/Grid/archive/delete | Excluded | singleton is not a collection | none |
| Tree/Report/Import/Export/Chart | Excluded | outside this child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | singleton GET/PUT with `FunctionalCurrencyId`, `PrimaryBookId`, configuration state and opaque RowVersion |
| Canonical routes | Accounting Company Settings API and `/finance/ledger-setup/company-settings` |
| Server search/filter/sort | N/A — singleton; dependency lookups own criteria |
| Paging/limits | N/A — singleton; lookups must return complete eligible choices |
| Domain errors / ProblemDetails | missing/inactive/foreign Currency or Book, uniqueness, permission and concurrency |
| Permission and tenant/company scope | `AccountingSetup:View/Manage`; one row per server-enforced company |
| Cross-module contract | N/A — dependencies are Accounting-owned child contracts |
| Persistence/schema/migration | Accounting singleton mapping, unique company constraint and RowVersion; live database update required |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| First configuration | unconfigured plus Manage | select active Currency and Book | singleton PUT/upsert | persisted settings reload; localized selector labels come from bilingual masters |
| View | configured plus View/read-only | inspect selections | GET singleton | no save action; referenced names remain understandable in current locale |
| Update | configured plus Manage and RowVersion | change eligible selector | update singleton | 409 reloads settings and lookups |
| Delete/archive | N/A | no action | no endpoint | singleton identity has no invented lifecycle |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | loading, unconfigured, configured, dependency failure, load failure and saving are distinct |
| Permission / forbidden / read-only | View inspects; Manage saves; global read-only preserves values and removes Save |
| Archived / locked | archived dependencies are not selectable; an existing invalid dependency is displayed as an explicit issue |
| Unsaved changes / destructive confirmation | shared dirty-navigation guard; no destructive lifecycle |
| Offline / stale / conflict | online-authoritative; no cached success; 409 reloads singleton and lookups |
| Mock data | draft may select real loaded dependencies only; no fabricated company, IDs, names or RowVersion |

## 9. Concurrency, transactions, and consistency

Every update sends RowVersion. The unique company constraint prevents duplicate
singletons. Currency/Book lifecycle changes invalidate settings dependencies; a
conflict reloads singleton and lookups before retry.

## 10. i18n, RTL, accessibility, and responsive behavior

UI labels/help/errors are translated EN/AR. This aggregate has no `NameAr` or
`NameEn`; it references Currency and Book masters that do. Selectors display the
current-locale stored name with a documented fallback and never copy or overwrite
either value. Shared forms provide RTL, keyboard/touch access, loading/error state,
linked validation messages and first-invalid focus.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Queued | Books/Journals closed and contract approved | typed singleton, unique company constraint, lookups, migration, permissions and tests | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 2 | Web | Queued | API Verified | typed P-005 editor and first-config/update/read-only/conflict tests | `documentation/web-next/features/accounting-ledger-setup-frontend-reference.md` |
| 3 | Mobile | Queued | Web Verified | typed clean layers, schemas and native P-005 journey/tests | `documentation/mobile-react/accounting-ledger-setup-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | prior stages Verified | agent sends detailed authenticated first-config/update/reload API/Web/actual-Mobile scenario with live-schema checks; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated verification Verified and explicit user acceptance recorded | canonical docs, manifest/recipes and education reconciled | `documentation/system/features/accounting-ledger-setup/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact Currency/Book settings, Web and actual-device
steps, EN/AR and RTL/LTR checks, expected outcomes, negative/read-only/conflict
cases, cleanup and evidence. The feature remains Active until explicit user acceptance.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed` in the roadmap, with explicit user acceptance recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | singleton/reference/concurrency tests | inactive dependency and duplicate company row | Queued |
| API/transport | exact GET/PUT/unconfigured contract | IDs plus RowVersion round trip | Queued |
| Persistence/migration | apply current Accounting migration | unique company and foreign keys | Queued |
| Web | P-005 editor tests | first config, update, localized names, read-only and conflict | Queued |
| Mobile | runtime schema/form/query tests | same journey on phone/tablet | Queued |
| E2E/manual/live | authenticated company setup | select bilingual Currency/Book, save and reload | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-005 is registered and reviewed.
- [ ] Generic singleton evidence is replaced by typed child ownership.
- [ ] API, Web, Mobile and database verify singleton uniqueness and conflict behavior.
- [ ] Selectors correctly present Arabic/English names from their owning masters.
- [ ] Integrated live verification is green in roadmap order.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Documentation/manifest/recipes and education are reconciled.
- [ ] Roadmap closure is recorded before Exchange Rates becomes Active.
