# Ledger Setup COA & Hierarchy — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-coa-hierarchy` |
| Child feature name | Chart of Accounts and Hierarchy Levels |
| Owner | Accounting |
| Depends on | `ledger-setup-currency` |
| Execution status | `Queued` — source phases 01–03 exist; activation waits for Fiscal Years and Currency closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md` and COA API/Web/Mobile feature reviews |

## 1. Child boundary and outcome

This child owns `AccountHierarchyLevel` and `Account`: company hierarchy,
server-proposed editable code, bilingual stored names, posting/manual-posting/
currency policies, tree/detail, and archive/restore. Independent acceptance proves
the Chart of Accounts and its level master without claiming Dimensions, journal
posting, or final Slice 1 integration.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-accounts | Web | `/finance/ledger-setup/accounts` | Build and inspect the account hierarchy | hierarchy plus record list and full detail | P-002 | split tree/detail primary; P-001 server grid secondary; `MyForm` for create/edit | `web-next/src/modules/accounting/ledger-setup/coa-hierarchy/pages/AccountsPage.tsx` | Implemented | Tree Required; Grid Required; Detail Required; Table Cards Report Import Export Chart Excluded | tree/list/detail loading, empty/no-selection/no-results, error/retry, forbidden, dirty form, dependency/concurrency conflict | online authoritative | local valid draft uses server-proposed code and real level/currency/parent lookups only | `Accounts:View/Manage`; current company | desktop split, compact stacked detail, RTL, keyboard tree/actions, focused errors | List is a secondary view of the same server authority, not a second feature |
| ledger-setup-accounts | Mobile | `/finance/ledger-setup/accounts` | Build and inspect the account hierarchy | segmented hierarchy and records with native detail/form | P-002 | `AppHierarchicalTree` plus P-001 Table; full-screen `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/coa-hierarchy/presentation/screens/AccountsScreen.tsx` | Adapted | Tree Required; Table Required; Detail Required; Grid Cards Report Import Export Chart Excluded | tree/list/detail loading, empty/no-selection/no-results, error/retry, forbidden, dirty form, dependency/concurrency conflict | online authoritative; no queued setup writes | local valid draft uses server-proposed code and authoritative lookups only | `Accounts:View/Manage`; current company | phone stacked/segmented, tablet-safe, RTL, touch and screen-reader actions | Mobile does not compress Web split panes into a phone layout |
| ledger-setup-hierarchy-levels | Web | `/finance/ledger-setup/hierarchy-levels` | Manage the ordered account-level master | server-managed flat collection | P-001 | Grid with `MyForm` detail/create/edit | `web-next/src/modules/accounting/ledger-setup/coa-hierarchy/pages/HierarchyLevelsPage.tsx` | Implemented | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty form, dependency/concurrency conflict | online authoritative | valid local bilingual draft; next positive number excludes active and archived loaded levels | `Accounts:View/Manage`; current company | bounded grid, compact form, RTL and keyboard/error focus | Level ordering and `CanPost` remain server-owned |
| ledger-setup-hierarchy-levels | Mobile | `/finance/ledger-setup/hierarchy-levels` | Manage the ordered account-level master | native server-managed collection | P-001 | Table/Cards list with full-screen `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/coa-hierarchy/presentation/screens/HierarchyLevelsScreen.tsx` | Implemented | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty form, dependency/concurrency conflict | online authoritative | valid local bilingual draft; no identity/scope/RowVersion fabrication | `Accounts:View/Manage`; current company | phone/tablet, RTL, touch targets and validation focus | Native Cards adapt the same paged contract |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-002 Cost Centers | `web-next/src/modules/hr/basic-data/organizational-structure/management/pages/CostCentersPage.tsx` and `mobile-react/src/modules/hr/basic-data/organizational-structure/presentation/screens/CostCentersScreen.tsx` | tree selection, responsive master/detail and accessible hierarchy actions | no HR fields, permissions, move rules or code generation copied |
| Current COA source | `web-next/src/modules/accounting/ledger-setup/coa-hierarchy/` and `mobile-react/src/modules/accounting/ledger-setup/coa-hierarchy/` | typed Account/Level source and tests | integrated live verification remains pending |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web hierarchy | `web-next/src/shared/components/tree-view/SplitTreeView.tsx` and `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx` | reuse | one selected Account detail plus server list alternative |
| Web forms | `web-next/src/shared/components/forms/dialog/MyForm.tsx` and shared fields/feedback | reuse | typed Account and Hierarchy Level forms with bilingual fields |
| Mobile hierarchy/forms | `mobile-react/src/shared/components/tree-view/AppHierarchicalTree.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx` | reuse | stacked hierarchy/detail and native level management |
| Currency dependency | Currency active lookup | reuse public child contract | Specific Currency only when CurrencyPolicy requires it |

The generic `LedgerSetupRecord`/resource renderer is not an approved target.

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Accounts tree and list | Required | Web split/tree plus grid; Mobile segmented tree/table | search, select, expand, page and open |
| Account detail/form | Required | full typed detail and shared form | add root/child, view, edit, archive/restore |
| Hierarchy Levels | Required | focused server-managed collection and form | manage order, `NameAr`, `NameEn`, `CanPost` and lifecycle |
| Drag/reparent | Excluded | no inferred gesture | parent change only through an approved typed mutation |
| Report/Import/Export/Chart | Excluded | outside this child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | distinct tree node, Account detail/list/lookup/mutation, Hierarchy Level, code-proposal and lifecycle contracts; named entities include separate `NameAr` and `NameEn` |
| Canonical routes | Accounting Accounts/Hierarchy Levels API plus the two client routes above |
| Server search/filter/sort | Account code, Arabic/English name, level, parent, posting/status filters; Level allow-list; tree by parent IDs |
| Paging/limits | server totals for lists; tree returns the complete permitted company hierarchy |
| Domain errors / ProblemDetails | missing bilingual name, duplicate/proposed code, invalid parent/level, posting-with-children, dependency and concurrency |
| Permission and tenant/company scope | `Accounts:View/Manage`; server-enforced current company |
| Cross-module contract | Currency active lookup only; no cross-module EF access |
| Persistence/schema/migration | Accounting DbContext/migrations own Accounts and Hierarchy Levels; live schema evidence is mandatory |

The `ACC-####` proposal is editable convenience, not a reservation or hierarchy
source. The client never synthesizes it; uniqueness is resolved by the database
and a conflicting create refetches a fresh proposal.

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Add root/child Account | Manage plus authoritative lookups | choose parent/level; enter `NameAr` and `NameEn`; accept/edit proposed code and policies | create Account | tree/list/detail refresh; both names remain visible |
| Edit Account | selected full detail and RowVersion | edit both names and allowed policy fields | update | 409 reloads detail/tree without silently merging languages |
| View Account | selected node | inspect identity, both names, policies and status | GET detail | no mutations in read-only mode |
| Archive/restore Account | valid dependency state | confirm | lifecycle mutation | dependency failures remain explicit |
| Manage Hierarchy Level | Manage | level number, `NameAr`, `NameEn`, `CanPost` | create/update/lifecycle | dependent Accounts remain server-authoritative |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | tree/list/detail states are independent; no-selection differs from empty company |
| Permission / forbidden / read-only | View keeps tree/detail; Manage controls mutations; API remains authority |
| Archived / locked | archived identity remains inspectable per server criteria |
| Unsaved changes / destructive confirmation | shared dirty guard and lifecycle confirmation |
| Offline / stale / conflict | online mutations; selected detail refetches before protected write; 409 reloads key family |
| Mock data | Account keeps server proposal and real dependencies; both Arabic/English names are valid; no fabricated ID, scope, lookup or RowVersion |

## 9. Concurrency, transactions, and consistency

Tree nodes never authorize writes. Edit/lifecycle first use current detail and
RowVersion. Account, parent, level, tree and lookup keys invalidate coherently.
Database constraints own code and parent races; committed writes preserve both
language values transactionally.

## 10. i18n, RTL, accessibility, and responsive behavior

Translated UI text and persisted business names are separate concerns. Account and
Hierarchy Level create/edit/view/list journeys expose `NameAr` and `NameEn`; current
locale selects display while details retain both. Web supports keyboard tree/actions
and compact stacking; Mobile uses touch/screen-reader semantics. Both focus the first
invalid bilingual field and preserve RTL without directional hacks.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Currency contract available | typed Account/Level/code-proposal contracts, migrations, bilingual validation and tests | `documentation/project/LEDGER_SETUP_COA_HIERARCHY_FEATURE_FULL_REVIEW.md` |
| 2 | Web | Verified | API Verified | P-002/P-001 typed journeys, forms and focused tests | `documentation/web-next/features/ledger-setup-coa-hierarchy-frontend-reference.md` |
| 3 | Mobile | Verified | Web Verified | runtime schemas, hierarchy/list/forms and focused tests | `documentation/mobile-react/ledger-setup-coa-hierarchy-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | prior roadmap children closed | agent sends detailed authenticated API/Web/actual-Mobile journey with live-schema checks; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated verification Verified and explicit user acceptance recorded | reconcile canonical books, manifest/recipes and education | `documentation/system/features/ledger-setup-coa-hierarchy/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact hierarchy data, Web and actual-device steps,
EN/AR and RTL/LTR checks, expected outcomes, negative/read-only/conflict cases,
cleanup and evidence. The feature remains Active until the user explicitly accepts.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed` in the roadmap, with explicit user acceptance recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | hierarchy, bilingual requiredness, posting, proposal, lifecycle | posting Account cannot gain child | source tests recorded |
| API/transport | tree/detail/proposal/mutation serialization | both names, RowVersion and proposal race | source tests recorded |
| Persistence/migration | apply current Accounting migration to live database | parent/code/name columns and constraints | pending live stage |
| Web | SplitTreeView, grid, typed forms and mock utility | add child, edit both names, conflict | source implementation recorded |
| Mobile | hierarchy/table/form/runtime schemas and mock utility | phone/tablet view/edit both names | source implementation recorded |
| E2E/manual/live | authenticated EN/AR cross-platform journey | create root/child, lifecycle, read-only, RTL | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-001/P-002 are registered and reviewed.
- [x] API, Web and Mobile source phases are reconciled without generic renderer ownership.
- [ ] Live database migration/schema is applied and recorded.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Creation, editing, viewing and listing prove both Arabic and English names without data loss.
- [ ] Integrated API/Web/actual-Mobile verification is green in roadmap order.
- [ ] Documentation/manifest/recipes and education are reconciled.
- [ ] Roadmap closure is recorded before Dimensions becomes Active.
