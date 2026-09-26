# Ledger Setup Books & Journal Definitions — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-books-journals` |
| Child feature name | Books and Journal Definitions |
| Owner | Accounting |
| Depends on | existing Accounting foundation; ordered after `ledger-setup-dimensions` |
| Execution status | `Queued` after Dimensions closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; generic clients remain compatibility evidence |

## 1. Child boundary and outcome

This child owns `Book` and Slice 1 `Journal` definition/category/numbering
configuration, including Arabic and English stored names. Independent acceptance
proves setup masters, lookups and lifecycle without introducing `JournalEntry`,
approval, posting runtime, or company primary-book selection.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-books | Web | `/finance/ledger-setup/books` | Manage accounting books | server-managed flat collection | P-001 | Grid plus typed `MyForm` | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft only; no identity/scope/RowVersion fabrication | `AccountingSetup:View/Manage`; current company | bounded grid, compact form, RTL and keyboard/error focus | Current generic renderer is evidence only; target is a typed Book child |
| ledger-setup-books | Mobile | `/finance/ledger-setup/books` | Manage accounting books | native server-managed collection | P-001 | Table/Cards plus typed full-screen `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft only; no identity/scope/RowVersion fabrication | `AccountingSetup:View/Manage`; current company | phone/tablet, RTL, touch and validation focus | Target uses typed clean layers rather than generic definitions |
| ledger-setup-journal-definitions | Web | `/finance/ledger-setup/journals` | Configure journal identities and numbering | server-managed collection with Book dependency | P-001 | Grid plus typed `MyForm`; no entry workflow | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | list/Book lookup loading, empty/no-results, error/retry, forbidden, dirty, dependency/numbering/concurrency conflict | online authoritative | local bilingual draft uses a real active Book; numbering is never invented outside allowed form defaults | `AccountingSetup:View/Manage`; current company | bounded grid, compact dependent form, RTL and keyboard/error focus | Journal definition is independent from Book UI and is not P-003 |
| ledger-setup-journal-definitions | Mobile | `/finance/ledger-setup/journals` | Configure journal identities and numbering | native collection with Book dependency | P-001 | Table/Cards plus typed full-screen `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | list/Book lookup loading, empty/no-results, error/retry, forbidden, dirty, dependency/numbering/concurrency conflict | online authoritative | local bilingual draft uses authoritative Book lookup only | `AccountingSetup:View/Manage`; current company | phone/tablet, RTL, touch and validation focus | No JournalEntry actions appear in this setup child |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-001 Currency/Fiscal Years | registered sources in `documentation/project/SCREEN_PATTERN_CATALOG.md` | typed list, form, lifecycle and concurrency discipline | Book/Journal fields, dependency and numbering rules remain Accounting-owned |
| Existing Ledger Setup | current generic Web/Mobile resource screens named above | route/workflow evidence | catch-all record definitions are replaced by typed child services/schemas/forms |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list/forms | `PageHeader`, `MyDataGrid`, `useServerListState`, `MyForm`, shared fields and confirmation under `web-next/src/shared/components/` | reuse | separate typed Book and Journal screens |
| Mobile list/forms | `AppListScreen`, `AppDataTable`, `AppDataCard`, `AppForm`, `AppStateView`, confirmation under `mobile-react/src/shared/components/` | reuse | separate native typed journeys |
| Book selector | child-owned active Book lookup | feature-owned reuse | Journal form accepts eligible same-company Books only |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Books | Required | focused server-managed list/form | create, view, edit, archive/restore; maintain `NameAr`/`NameEn` |
| Journal Definitions | Required | focused server-managed list/form | select Book; maintain code, both names, category and numbering |
| JournalEntry workflow | Excluded | no runtime controls | no draft/submit/approve/post |
| Tree/Report/Import/Export/Chart | Excluded | outside this child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | distinct Book and Journal detail/page/lookup/mutation/lifecycle contracts with `NameAr`, `NameEn` and RowVersion |
| Canonical routes | Accounting Books/Journals APIs plus the two client routes above |
| Server search/filter/sort | code, Arabic/English name, status, Book/category and approved sort allow-lists |
| Paging/limits | authoritative totals; active Book lookup cannot silently truncate |
| Domain errors / ProblemDetails | missing bilingual name, duplicate code, inactive Book, numbering/reset validation, dependency and concurrency |
| Permission and tenant/company scope | `AccountingSetup:View/Manage`; current company enforced by server |
| Cross-module contract | N/A — both aggregates are Accounting-owned |
| Persistence/schema/migration | Accounting mappings/migrations for Books and Journal definitions; live database update required |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create/Edit Book | Manage and current RowVersion when editing | code, `NameAr`, `NameEn` | create/update | list/lookup refresh; both names retained |
| Book lifecycle | valid dependency state | confirm | archive/restore with RowVersion | dependent-use conflicts explicit |
| Create/Edit Journal definition | active Book available | Book, code, `NameAr`, `NameEn`, category, prefix, padding, reset policy and next number | create/update definition | no JournalEntry is created |
| Journal lifecycle/view | permission and valid state | inspect or confirm lifecycle | read or archive/restore | both names/numbering remain inspectable in read-only/history |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | Book and Journal collections plus Book lookup have independent states |
| Permission / forbidden / read-only | View inspects; Manage writes; global read-only removes write controls |
| Archived / locked | archived records discoverable by server status; invalid Book cannot be newly selected |
| Unsaved changes / destructive confirmation | shared dirty guard and lifecycle confirmation |
| Offline / stale / conflict | online-authoritative; uncertain writes refetch; 409 reloads current detail |
| Mock data | valid bilingual local draft only; Journal uses a real Book and approved numbering values; no fabricated identity/scope/concurrency |

## 9. Concurrency, transactions, and consistency

Protected changes use RowVersion. Book mutations invalidate Book lookup and
dependent Journal queries. Database/server own code and numbering races; a conflict
reloads authoritative detail before retry. Both language values commit together.

## 10. i18n, RTL, accessibility, and responsive behavior

Books and Journal definitions expose separate persisted `NameAr` and `NameEn` in
create/edit/view/list on both platforms. UI labels and enum text use EN/AR catalogs;
locale selects primary display without erasing the other value. Shared forms provide
RTL, accessible error links, first-invalid focus, keyboard/touch behavior and compact
layouts with bounded table scrolling.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Queued | Dimensions closed and contract approved | typed bilingual Book/Journal contracts, migrations, permissions and tests | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 2 | Web | Queued | API Verified | typed P-001 screens/forms/states and tests | `documentation/web-next/features/accounting-ledger-setup-frontend-reference.md` |
| 3 | Mobile | Queued | Web Verified | typed clean layers, schemas, native screens/forms and tests | `documentation/mobile-react/accounting-ledger-setup-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | prior stages Verified | agent sends detailed authenticated Book→Journal API/Web/actual-Mobile scenario with live-schema checks; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated verification Verified and explicit user acceptance recorded | canonical docs, manifest/recipes and education reconciled | `documentation/system/features/accounting-ledger-setup/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact Book/Journal data, Web and actual-device
steps, EN/AR and RTL/LTR checks, expected outcomes, negative/read-only/conflict
cases, cleanup and evidence. The feature remains Active until explicit user acceptance.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed` in the roadmap, with explicit user acceptance recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | bilingual, numbering, dependency and lifecycle tests | archive referenced Book; reject missing one name | Queued |
| API/transport | exact page/lookup/mutation serialization | both names, totals, RowVersion and active Book selector | Queued |
| Persistence/migration | apply current Accounting migration | bilingual columns, uniqueness and foreign keys | Queued |
| Web | focused Book/Journal screen/form tests | both names and no JournalEntry actions | Queued |
| Mobile | schema/query/screen tests | create/edit/view/lifecycle on phone/tablet | Queued |
| E2E/manual/live | authenticated setup journey | Book→Journal in EN/AR/read-only/conflict | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-001 is registered and reviewed.
- [ ] Generic source ownership is replaced by typed Book/Journal boundaries.
- [ ] API, Web, Mobile and database verify Arabic and English names end to end.
- [ ] Numbering, dependency, lifecycle, permissions and conflicts are verified.
- [ ] Integrated live verification is green in roadmap order.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Documentation/manifest/recipes and education are reconciled.
- [ ] Roadmap closure is recorded before Company Settings becomes Active.
