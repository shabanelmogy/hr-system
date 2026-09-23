# Ledger Setup Currency Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `ledger-setup-currency` |
| Plan ID | `accounting-core-gl` |
| Authorized slice / phase | `Slice 1 — Ledger setup spine` / child `1A` |
| Canonical plan | `documentation/plans/business/accounting-core-gl/PLAN.md` |
| Feature decomposition decision | `Decompose` |
| Screen/Workflow Contract | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-currency.md` |
| API route | `/api/v1/currencies` |
| Web route | `/finance/ledger-setup/currencies` |
| Mobile route | `/finance/ledger-setup/currencies` |
| Review owner | `Accounting implementation team` |
| Review date | `2026-09-22` |
| Implementation request | `documentation/system/features/ledger-setup-currency/IMPLEMENTATION-REQUEST.md` |
| Required-file manifest | `documentation/system/features/ledger-setup-currency/required-files.json` |
| Operating mode | `existing-feature change / reconciliation` |
| Documentation state | `Phase 07 Closed — Phase 06 Verified 2026-09-22` |
| Applied implementation reference | `fiscal-years` |
| Import decision | `Excluded` |
| Import platforms | `N/A` |
| Import format | `N/A` |
| Reporting decision | `Excluded` |
| Reporting engine | `N/A` |
| Customer Education Pack | `Complete after Phase 06 Verified` |
| Customer education path | `documentation/plans/business/accounting-core-gl/education/ledger-setup-currency.md` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Accounting is the only writable Currency owner; HR consumes active codes via public Contract. | Plan D-020 + child contract | Existing evidence | Existing evidence | Existing consumer UI evidence | Frozen |
| R-02 | Company-scoped Currency identity is code + bilingual names + symbol; no default-rate/default-currency authority lives on Currency. | Child contract + current Domain/model | Existing evidence | Existing evidence | Existing evidence | Frozen |
| R-03 | Server-managed list supports bounded paging/search/status/sort with real totals and deterministic ordering. | Child contract | Existing evidence | Existing evidence | Existing evidence | Frozen |
| R-04 | Create/edit/view/archive/restore use View/Manage permissions, read-only behavior and RowVersion conflict handling. | Child contract | Existing evidence | Existing evidence | Existing evidence | Frozen |
| R-05 | Archive is blocked while Currency is referenced by Accounting settings, accounts or FX; active lookup excludes archived Currency. | Child contract/current store | Existing evidence | Displays API outcome | Displays API outcome | Frozen |
| R-06 | EN/AR, RTL, accessible shared controls and responsive Web/Mobile composition are required. | Child contract/repository guides | stable errors | Required | Required | Frozen |
| R-07 | Import/Report/Export are absent for this child; education occurs only after verified runtime. | Plan + child package | Excluded | Excluded | Excluded | Frozen |

## Platform capability decisions

| Capability | API | Web | Mobile | Data scope/contract | Reason, owner, or trigger |
| --- | --- | --- | --- | --- | --- |
| Grid/Table | Required | Required | Required | current company, server paged | primary management surface |
| Cards | N/A | Excluded | Required | same Mobile server list/page | phone-friendly alternate view already supported; no separate data truth |
| Detail/Form | Required | Required | Required | one Currency with RowVersion | create/edit/view parity |
| Tree | Excluded | Excluded | Excluded | N/A | Currency is not hierarchical |
| Chart | Excluded | Excluded | Excluded | N/A | no analytical outcome in master maintenance |
| Report | Excluded | Excluded | Excluded | N/A | belongs to later reporting scope if ever approved |
| Import | Excluded | Excluded | Excluded | N/A | not approved for Slice 1 Currency |
| Export | Excluded | Excluded | Excluded | N/A | not approved for Slice 1 Currency |

## Evidence register

| Evidence ID | Claim | File and symbol | Verification |
| --- | --- | --- | --- |
| E-01 | Currency is an Accounting company aggregate with normalized code and no legacy default/rate fields. | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Domain/Finance/LedgerSetup/Entities/Currency.cs` | source inspection + `CurrencyOwnershipTests` |
| E-02 | Writes use trusted actor scope, company catalog locking, duplicate checks, RowVersion and soft lifecycle. | `...Currencies/Commands/CurrencyCommands.cs` | source inspection + handler tests |
| E-03 | Server list owns search/filter/sort/page and real total. | `...Currencies/Queries/CurrencyQueries.cs`, `CurrencyStores.cs` | validator/store inspection |
| E-04 | Public cross-module catalog returns only active same-company Currency. | `ErpSystem.Modules.Accounting.Contracts/CurrencyCatalogContracts.cs`, `AccountingCurrencyCatalog.cs` | `Catalog_IsReadOnlyActiveAndCompanyIsolated` |
| E-05 | API surface is thin and permission split is View vs Manage. | `CurrenciesController.cs` | `Controller_IsThinAccountingOwnedSurface` |
| E-06 | Initial Accounting baseline owns `acc.Currencies`; legacy HR master/default-rate fields are absent. | `20260922091842_InitialAccounting.cs`, migration/architecture tests | current test source inspection |
| E-07 | Web has dedicated typed Currency screen with server list, detail hydration, permission-aware actions and 409 reload behavior. | `web-next/src/modules/accounting/currencies/` | source + service/Grid permission tests + API-backed browser journey |
| E-08 | Mobile has dedicated layered Currency module, runtime schemas, server list Table/Cards, permission/read-only behavior and RowVersion writes. | `mobile-react/src/modules/accounting/currencies/` | source + remote/use-case/screen permission tests |

## Read and list contract

- API pages are one-based. Web converts its zero-based list page once; Mobile sends
  its application page through the typed remote boundary.
- API page size is bounded by `PaginationRequest.MaxClientPageSize`; Web defaults to
  10 and exposes 5/10/25/50; Mobile Table/Cards use the shared server-pagination state.
- Search is trimmed, maximum 200, fields are `all`, `currencyCode`, `nameAr`,
  `nameEn`, `symbol`; the six standard string operators are allow-listed.
- Record status is `active`, `archived`, `all`; default is `active`.
- Sort allow-list is `currencyCode`, `nameAr`, `nameEn`, `symbol`, `createdOn`;
  every server ordering includes Id as deterministic tie-break.
- Page metadata supplies the real total. Clients do not infer a total from the
  current page length.
- Initial loading, background refresh, request failure/retry and zero-result states
  are distinct UI states.

## Grid and card contract

| Field | Web Grid | Mobile Table | Mobile Card | Sortable | Searchable | Responsive behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Currency code | Yes | Yes | title | Yes | Yes | short stable identity remains visible |
| Arabic name | Yes | Yes | secondary text | Yes | Yes | wraps and respects RTL |
| English name | Yes | Yes | secondary text | Yes | Yes | wraps at compact widths |
| Symbol | Yes | Yes | title suffix | Yes | Yes | compact centered value |
| Status | lifecycle/filter | badge/action | badge | filter | No | text + semantic state, never color alone |
| Actions | View/Edit/Archive/Restore | View/Edit/Archive/Restore | same | No | No | permission/read-only aware |

## Detail and write contract

- Create/edit use `CurrencyCode`, `NameEn`, `NameAr`, `Symbol`; clients mirror
  structural rules while Domain/Application remain authoritative.
- Edit/view hydrate authoritative detail before mutation. A detail error blocks save.
- Code normalization is uppercase and trimmed; names/symbol are required and bounded.
- Duplicate code is company scoped and maps to `Currency.DuplicateCode`.
- Update/archive/restore send opaque RowVersion. Conflict closes/invalidates stale
  client state and reloads authoritative data before another write.
- Archive/restore require confirmation. Archive may fail with `Currency.InUse`.
- Bulk actions are Excluded. Hard delete is not a Currency lifecycle operation.

## Permission and lifecycle matrix

| State/action | View | Create | Edit | Archive | Restore | Bulk | Read-only |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Active | View permission | Manage | Manage | Manage + dependency guard | N/A/idempotent server restore | Excluded | view only |
| Archived | View via status filter | Manage | blocked | idempotent | Manage | Excluded | view only |

## Integration register

- API registration: Accounting DbContext/DI owns Currency stores and
  `IAccountingCurrencyCatalog`; Presentation routes through `ISender`.
- Persistence: `acc.Currencies` uses tenant/company scope, company-code uniqueness
  and RowVersion; references from settings/accounts/FX are checked before archive.
- Web: route `/finance/ledger-setup/currencies`, Accounting View route guard,
  dedicated `currencyService`, query keys/hooks, validation, Grid/form, EN/AR.
- Mobile: typed route constant, RBAC route manifest, dedicated repository/remote
  schema/use-cases/query/screen/form, EN/AR Currency translations.
- HR integration: user-supplied CurrencyCode snapshots validate through
  `IAccountingCurrencyCatalog`; no HR writable Currency DbSet/entity is restored.
- Cache: clients invalidate/refetch Currency list/detail/lookup after successful
  mutations; no feature-owned offline financial source of truth.

## Import contract

Import is `Excluded` for API, Web and Mobile. No file format, parser, transport,
preview, batch semantics or rejected-row artifact exists in Slice 1. There must be
no reachable import placeholder. Any future import requires a new approved bounded
contract before implementation.

## Reporting contract

Reporting is `Excluded` for this Currency child. No report engine, dataset, report
key, filter contract, client viewer or deployment dependency is introduced. Currency
reporting can only reopen under a later approved reporting capability.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | High | Previous umbrella documentation treated much of Slice 1 as one execution unit, which could hide child workflow quality. | Feature Decomposition Gate and prior `accounting-ledger-setup` package | Planning | Resolved by nine closed child contracts; umbrella is integration/history evidence only. |
| F-02 | High | Currency runtime already exists from ownership cutover, so accepting it as automatically complete would bypass child acceptance. | current Accounting API/Web/Mobile Currency paths | Accounting | Runtime is evidence only; child package performs explicit reconciliation and exit verification. |
| F-03 | Medium | Currency-specific server notification/realtime contract is not required by the child contract. | current child scope | Accounting clients | Keep client query invalidation/refetch; do not add a new server side-effect merely for symmetry. |
| F-04 | Manual | Authenticated Web EN/AR, desktop/compact, lifecycle and denial behavior required runtime proof. | API-backed browser journey on `https://localhost:3000` | Accounting Web | Resolved 2026-09-22: Admin completed create/edit/archive/restore in Arabic and English, compact width had no page overflow, and Normal User received the expected 403. |
| F-05 | Inherited repository failure | The global Mobile Contract Matrix stops on seven sibling Ledger Setup routes plus the generic sibling transport used by packages `1B`–`1H`. Currency endpoints/routes are registered and its focused boundary tests pass. | `npm run check` stopped at `check:contracts` with 12 sibling-path/transport findings | Packages `1B`–`1H`, then `1V` | Does not hide or defer a Currency regression; must be removed as each sibling is converted to its typed child boundary before Slice `1V`. |
| F-06 | Manual release check | Installed phone/tablet and hosted authenticated device proof requires a release-like build and deployed API. | Central notes `PROD-010` and `PROD-014` | QA + Mobile release | Deliberately remains open for public preview/store release; source, native-config and feature acceptance gates passed for the development child. |

## Verification

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Planning | `./documentation/plans/Check-Planning.ps1` | Passed after all nine Slice 1 contracts were closed | 2026-09-22 |
| Documentation baseline | `./documentation/system/Generate-Documentation.ps1 -Check` before child registration | Passed for existing 85 recipes | 2026-09-22 |
| Contract audit | nine child files, required headings, child IDs, closed status, no template placeholders | Passed 9/9 | 2026-09-22 |
| API Currency behavior | `dotnet test ...Accounting.Tests.csproj --filter FullyQualifiedName~CurrencyOwnershipTests` | Passed `14/14` | 2026-09-22 |
| API ownership/baseline | focused `CurrencyOwnershipArchitectureTests` + `CurrencyBaselineMigrationTests` | Passed `2/2 + 1/1` | 2026-09-22 |
| HR consumer contract | focused `OrganizationalStructureManagementTests`, `RecruitmentCqrsFoundationTests`, `WorkforceBudgetHandlerTests` | Passed `31/31`; HR snapshots validate through the Accounting catalog | 2026-09-22 |
| API architecture gate | Accounting/Currency/Module focused architecture filter | Passed `34/34` | 2026-09-22 |
| Web focused evidence | route access + Accounting navigation + Currency service + Grid permission suites | Passed `34/34` across 4 files | 2026-09-22 |
| Web static/production gates | `npm run check`; `npm run build`; post-test focused ESLint + `npm run type-check` | Passed; optimized build generated `77/77` pages | 2026-09-22 |
| Web API-backed journey | Admin Arabic/English create, edit, archive, archived filter, restore; compact `390x844`; Normal User denial | Passed; SAR remained active as valid development data; no page-level horizontal overflow | 2026-09-22 |
| Mobile focused evidence | route access + remote boundary + use cases + Currency screen conflict/permission/read-only suites | Passed `27/27` across 4 suites | 2026-09-22 |
| Mobile source gates | typecheck, lint, architecture, i18n, dependency, native-config, foundation and release-source checks | Passed | 2026-09-22 |
| Mobile global Contract Matrix | `npm run check` | Inherited repository failure F-05 after prior gates passed; 12 sibling Ledger Setup findings | 2026-09-22 |
| Currency documentation recipes | all eight `ledger-setup-currency-phase-00` through `phase-07` recipe checks | Passed after regeneration | 2026-09-22 |

**Phase 06 decision: `Verified` on 2026-09-22.** Every Currency-owned Required
behavior has implementation and automated or API-backed evidence. F-05 is owned by
the subsequent sibling packages and F-06 is already governed by central production
notes; neither represents a missing Currency behavior.

## Final reconciliation

- [x] Product boundary and Screen/Workflow Contract are frozen before runtime work.
- [x] Existing-system relationship is classified as reconciliation of the same owner.
- [x] Import/Reporting/Export are explicitly Excluded for this child.
- [x] Current API/Web/Mobile evidence paths have been identified.
- [x] Existing generic Ledger Setup renderer is not accepted as child authority.
- [x] Four applied implementation books and final required-file manifest are registered/generated.
- [x] Focused current-runtime evidence commands are recorded and green.
- [x] Phase 06 records `Verified` before customer education is authored/finalized.
- [x] Phase 07 publishes the verified customer setup/training/video guide before child closure.

Child `1A` is closed. Slice 1 remains open until packages `1B`–`1H` and final package
`1V` complete their own gates.
