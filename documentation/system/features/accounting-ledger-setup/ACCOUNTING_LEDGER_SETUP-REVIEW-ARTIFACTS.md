# Accounting Ledger Setup Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `accounting-ledger-setup` |
| Plan / slice | `accounting-core-gl` / `Slice 1 — Ledger setup spine` |
| Canonical plan | `documentation/plans/business/accounting-core-gl/PLAN.md` |
| Slice 1 execution decomposition | `documentation/plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| Operating mode | New vertical slice extending Accounting |
| Review date | 2026-09-25 v2 planning/UI reconciliation; original preflight 2026-09-20 |
| Review owner | Accounting Product + Architecture + implementation agent |
| Implementation request | `documentation/system/features/accounting-ledger-setup/IMPLEMENTATION-REQUEST.md` |
| Evidence manifest | `documentation/system/features/accounting-ledger-setup/required-files.json` |
| Documentation state | Historical API/client evidence retained; current v2 run has Fiscal Years Active and every later child Queued |
| Applied implementation reference | `fiscal-years` — same-module pattern only |
| Import | Web Deferred; Mobile Excluded |
| Reporting | N/A Slice 1 — GL/TB are later |
| Customer Education Pack | Required after Phase 06 `Verified` |
| Education path | `documentation/plans/business/accounting-core-gl/education/accounting-ledger-setup.md` |

## Requirement manifest

| ID | Requirement | API | Web | Mobile | Phase 00 status |
| --- | --- | --- | --- | --- | --- |
| R-01 | Single company Currency master owned by Accounting | Required | Required | Required | Contract frozen |
| R-02 | Functional Currency + Primary Book company settings | Required | Required | Required | Contract frozen |
| R-03 | Configurable COA hierarchy/levels/account policies | Required | Required tree | Required tree | Contract frozen |
| R-04 | Typed Dimensions | Required | Required | Required | Contract frozen |
| R-05 | Book + Journal setup/numbering | Required | Required | Required | Contract frozen |
| R-06 | Historical FX types/rates | Required | Required | Required | Contract frozen |
| R-07 | Typed Link Accounts | Required | Required | Required | Contract frozen |
| R-08 | Posting Profiles + resolve preview | Required | Required | Required | Contract frozen |
| R-09 | Existing Fiscal Years reused unchanged | Reuse | Reuse | Reuse | Verified current |
| R-10 | Clean baseline has Accounting-only writable Currency ownership | Required baseline | HR consumes catalog | HR consumes catalog | Contract frozen |
| R-11 | JournalEntry/posting/GL/TB/Month Close absent in Slice 1 | Excluded now | Excluded now | Excluded now | Scope guard frozen |
| R-12 | Every named master carries distinct required `NameAr` and `NameEn` through API, Web, Mobile, search and mock-draft journeys | Required | Required | Required | v2 contract frozen |
| R-13 | Every human feature step has a detailed Web/actual-device manual scenario and explicit user acceptance before Phase 06/closure/next-step activation | Evidence prerequisite | Required | Required | v2 gate frozen |

## Platform capability decisions

| Capability | Web | Mobile | Decision |
| --- | --- | --- | --- |
| COA hierarchy | Required | Required | shared tree systems |
| Setup lists/forms | Required | Required | online-authoritative |
| Detail/create/edit/archive | Required | Required | permission/RowVersion aware |
| Cards | Per child v2 contract | Per child v2 contract | Required only where the chosen pattern and viewport justify it; never inferred from the umbrella |
| Bulk | Deferred | Deferred | no bulk financial setup contract |
| Import | Deferred | Excluded | no placeholder |
| Offline write | N/A browser | Excluded | server authority |
| Realtime | Deferred | Deferred | correctness independent |
| Notifications | Deferred | Deferred | no workflow notification in Slice 1 |

## Child execution packages and Screen Contract authority

The umbrella feature is retained for integration/history evidence and final Slice 1
verification. Future implementation/refactoring is reviewed child-by-child against
the canonical decomposition document.

| Package | Capability | Approved pattern | Screen Contract focus | Closest reuse/reference |
| --- | --- | --- | --- | --- |
| Step 01 | Fiscal Years + Periods | `P-001` | current year/period lifecycle revalidation | existing typed Fiscal Years clients |
| `1A` | Currency | `P-001` | server-managed list + create/view/edit/archive/restore + active lookup | Web shared grid/form/list state; Mobile shared list/table/form |
| `1B` | COA + Hierarchy | Accounts `P-002`; Levels `P-001` | first-class tree master/detail, proposed editable code, account lifecycle | Web `SplitTreeView` + Cost Center master/detail composition; Mobile `AppHierarchicalTree` |
| `1C` | Dimensions | Definitions/Values `P-001`; Constraints `P-006` | definitions/values + account constraint relationship editor | shared lists/forms/selectors; typed Account lookup |
| `1D` | Books + Journal Definitions | `P-001` | focused setup lists/forms; numbering config only | shared list/form/confirmation systems |
| `1E` | Company Settings | `P-005` | singleton functional-currency/primary-book editor | shared form/select/state primitives |
| `1F` | Exchange Rates | `P-001` | rate types + historical/versioned rates | shared list/form/date/select primitives |
| `1G` | Link Accounts | `P-006` | capability-driven direct mappings | typed Book/Account lookups + shared relationship editor primitives |
| `1H` | Posting Profiles | `P-001` + diagnostic preview | profile editor + separate resolution preview diagnostics | shared list/form/feedback; typed preview response |
| `1V` | Integration/Verification | `P-007` | launcher, permissions, translations, cross-child journeys, Phase 06 | existing Accounting shell + umbrella generated evidence |

The current generic `LedgerSetupRecord` and generic resource renderer are accepted
only as current-tree evidence. They are not the target client architecture for child
completion. Each child must demonstrate typed transport/runtime contracts and its
own Screen Contract evidence.

## Evidence register

| ID | Classification | Evidence | Finding |
| --- | --- | --- | --- |
| E-01 | VERIFIED CURRENT | `AccountingModule.cs`, six Accounting projects/tests | existing module is canonical owner |
| E-02 | VERIFIED CURRENT | `AccountingDbContext.cs` + initial migration | `acc`, company/tenant filters, RowVersion, Inbox/Outbox/PartyReference/Fiscal Years |
| E-03 | VERIFIED CURRENT | FiscalYear domain/controller/tests | calendar/period authority is implemented; no independent month-close API |
| E-04 | VERIFIED CURRENT | Web Accounting Fiscal Years | current shared Web pattern exists |
| E-05 | VERIFIED CURRENT | Mobile Accounting Fiscal Years | current layered Mobile pattern exists |
| E-06 | HISTORICAL PHASE-00 DISCOVERY | Pre-rebaseline HR Currency model | Phase 00 found HR Currency with ExchangeRateToDefault/IsDefault; final clean baseline deliberately does not preserve that owner or authority |
| E-07 | VERIFIED CURRENT | HR Workforce/Recruitment scan | financial facts predominantly persist CurrencyCode, not CurrencyId |
| E-08 | VERIFIED CURRENT | Geography/Countries canonical guides | financial Currency master was reserved for Finance/Payroll ownership |
| E-09 | VERIFIED CURRENT | Contacts Party/events | Party exists; ContactGroup/PartyRole do not |
| E-10 | VERIFIED CURRENT | repository master scan | no BankAccount/PaymentMethod/Cashbox/Safe runtime masters |
| E-11 | VERIFIED CURRENT | shared Web/Mobile component scan | required tree/list/form primitives already exist |
| E-12 | AUTHORIZED TARGET | Core GL plan/decisions | Slice 1 G0–G3 pass; G4 remains production/release only |
| E-13 | VERIFIED CURRENT | Ledger Setup Domain/Application/Infrastructure/Presentation and focused tests | Phase 01 API exists with complete master lifecycle matrix, shared atomic resources and Accounting-owned localized errors |
| E-14 | VERIFIED CURRENT | `20260922091842_InitialAccounting.cs` + Designer/Snapshot + clean SQL Server migration test | The complete clean `acc` baseline is represented by one EF-generated migration; composite tenant/company keys, RowVersion, unique indexes and Restrict FKs are applied successfully and the second migration run is idempotent |

## Read and list contract

- COA: tree/detail/search/lookup; hierarchy comes from parent+level, never code prefix.
- Currency: active/company lookup for all consumers plus management list.
- Dimensions/Books/Journals/Rates/Mappings/Profiles: deterministic company-scoped
  list/detail/lookup; server paging/filtering/sorting where cardinality grows.
- Resolve Preview: no state change; returns winner or explicit zero/ambiguous
  diagnostics and matched-rule evidence.

## Grid/tree and client contract

Web: `SplitTreeView`/`HierarchicalTreeList` for COA and `MyDataGrid` for setup
lists. Mobile: `AppHierarchicalTree`, `AppListScreen` and `AppDataTable`.
No local business filtering that can disagree with the API.

## Detail and write contract

All named-master create/update forms use typed controls and distinct required
`NameAr`/`NameEn` fields, RowVersion on protected updates, explicit policies/enums
and server field-error mapping. Both names remain visible in detail and list/card
surfaces, searchable where the list contract supports search, and independently
editable without overwriting one another. Local mock-data actions populate both.
Company/tenant scope is not editable or sent by clients. Company Settings,
ExchangeRate history, AccountMapping and resolve-preview results are non-named
records: they show the localized label of their linked named owner instead of
inventing duplicate name properties.

Currency starts with one writable owner: Accounting. `InitialAccounting` creates the
Currency store and `InitialHr` never creates one. HR CurrencyCode snapshots use the
Accounting catalog for validation. There is no demo-data copy/cutover and no
`IsDefault`/`ExchangeRateToDefault` backfill. Functional Currency is configured later
through normal Accounting settings together with Primary Book.

## Permission and lifecycle matrix

| Surface | View | Mutate | Lifecycle |
| --- | --- | --- | --- |
| Accounts | `Accounts:View` | `Accounts:Create/Edit/Archive/Restore` | each action independent; dependency/history rules still apply |
| Dimensions | `DimensionDefinitions:*`, `DimensionValues:*`, `AccountDimensionPolicies:View/Edit` | exact action claim | archive/restore only where the resource supports it |
| Currency/Settings/Books/Journals/FX/Mapping/Profile | resource-specific `View` | resource-specific exact action claim | archive/version/effective-date rules by aggregate |

Clients hide/block mutations in read-only mode; API remains authoritative.

## Integration register

| Integration | Direction | Phase 00 decision |
| --- | --- | --- |
| Platform actor/company | Platform → Accounting | reuse existing trusted context |
| Fiscal Years | Accounting internal | reuse only |
| Currency catalog | Accounting → HR and future consumers | add stable Contract; HR keeps CurrencyCode snapshots |
| Branch/CostCenter | HR → Accounting | only via Contract/projection when a typed source is enabled |
| Party | Contacts → Accounting | retain current PartyReference integration |
| Bank/Payment/Cashbox/ContactGroup/PartyRole | future owner → Accounting | unavailable until real owner Contract exists |

## Import contract

Import is not part of Slice 1 implementation. Web is Deferred and Mobile is
Excluded. No upload route, template, parser or hidden feature flag is permitted.

## Reporting contract

GL/TB/report datasets are not Slice 1 runtime. Setup pages may export nothing beyond
existing shared capabilities explicitly approved later. Formal statements remain a
separate plan.

## Findings and handoffs

| ID | Severity | Finding | Resolution |
| --- | --- | --- | --- |
| F-01 | High | Phase 00 found transitional HR Currency ownership conflicting with long-term Finance ownership | D-020 clean rebaseline: Accounting owns Currency from `InitialAccounting`; HR never persists a writable master |
| F-02 | High | Plan had functional currency/primary book but no explicit company policy holder | D-021: `AccountingCompanySettings` singleton |
| F-03 | High | Long-term Link Account design names source masters that do not exist | D-022: enable typed source only when real Contract exists; company-purpose default works now |
| F-04 | Medium | Accounting architecture attributed Branch ownership to Platform | corrected to HR Branch/CostCenter ownership |
| F-05 | Medium | Web AGENTS had absolute G0–G4-before-code wording | corrected to bounded slice authorization rule |
| F-06 | Medium | Original scaffold lifecycle implied recipe registration only after runtime | system workflow corrected: Phase 00 contracts/manifest/recipe are registered before coding |
| F-07 | High | Initial Phase 01 review proved create/update but did not enumerate lifecycle evidence per mutable entity | fixed with archive/restore/status/dependency guards, entity completion matrix, generated future-module quality gate and architecture tests |
| F-08 | High | Process-wide JSON localization factory/resources were owned and registered by HR | moved global composition/resources to ErpSystem.Api; Ledger Setup uses Accounting-owned embedded resources; architecture test blocks future module registration |
| F-09 | High | Slice 1 was implemented/reviewed as one broad setup client surface, making typed screen contracts and independent completion harder to assess | D-023 decomposes Slice 1 into child packages 1A–1H plus 1V; umbrella retained for integration/history and Phase 06 only |
| F-10 | High | Legacy child contracts did not make the UI-pattern gate or full Arabic/English data parity independently auditable | Resolved by v2 child contracts with approved `P-001`/`P-002`/`P-005`/`P-006`/`P-007` mappings, per-platform view decisions and explicit `NameAr`/`NameEn` acceptance |
| F-11 | High | Automated/source verification alone did not give the user an executable, per-step acceptance journey or a hard transition decision | Resolved by the central manual-acceptance template, feature-specific scenario files, result-by-case evidence, explicit user acceptance, and retest rules |

## Verification

Phase 00 checks:

- Planning gate and central note checks.
- implementation request/review have no unresolved placeholder tokens.
- four numbered applied implementation contracts exist.
- required preflight evidence paths exist.
- feature recipes generate without manual edits.
- ArchitectureTests remain green.
- `git diff --check` has no non-warning finding.
- no active manifest references `documentation/old files`.

Bounded Currency ownership cutover verification on 2026-09-21:

- Accounting Currency tests: 40/40 PASS.
- Currency ownership architecture guards: 2/2 PASS.
- Currency baseline/module-metadata integration guards: 4/4 PASS.
- Web current-tree gates: type-check, lint, architecture and i18n PASS; focused
  Currency/navigation/HR-consumer coverage: 39/39 PASS.
- Mobile current-tree gates: typecheck, lint, architecture, i18n, contract matrix,
  foundation and release source gates PASS; full Jest suite: 446/446 PASS across
  150 suites.
- Mobile contract matrix covers 74 routes, 28 endpoint files and 197 endpoint
  members, including `/finance/ledger-setup/currencies` and the Currency endpoint
  family with `Currencies:View` for reads and exact `Currencies:Create/Edit/Archive/Restore`
  claims for mutations.

Accounting Ledger Setup persistence verification on 2026-09-22:

- `dotnet ef migrations has-pending-model-changes` for `AccountingDbContext`:
  PASS — no model changes remain outside migrations.
- `ModulePersistenceFoundationTests.EveryModuleDbContext_HasBaselineMigrationAndNoPendingModelChanges`:
  1/1 PASS.
- `ModuleMigrationIntegrationTests.InstalledModuleMigrations_ApplyOnCleanDatabase_AndSecondRunIsIdempotent`:
  1/1 PASS against an ephemeral clean SQL Server database.
- Generated `20260922091842_InitialAccounting` contains all 18 current Accounting
  tables and their indexes/FKs in `acc`, including Currency before its dependents.
  It contains no raw SQL or compatibility branch. Development databases carrying
  the superseded Accounting migration history require a clean reset.

This verifies the completed Currency ownership/cutover foundation and Accounting
Ledger Setup persistence. Full Ledger Setup client/runtime reconciliation is
intentionally **not** claimed here; Phase 06 owns that.

Slice 1 execution-decomposition checkpoint on 2026-09-22:

- D-023 and `SLICE-01-LEDGER-SETUP-EXECUTION.md` define child packages `1A`–`1H`
  plus mandatory `1V` integration/verification.
- `PLAN.md` carries the exact `Feature Decomposition Gate`, with one stable Feature
  ID and a current v2 `decomposition/<feature-id>.md` Screen/Workflow Contract for
  every child. Fiscal Years is the sole Active step; `1A`–`1H` and `1V` are ordered
  Queued work despite historical implementation evidence.
- Every child has an API-readiness gate, Web/Mobile Screen Contract and approved UI
  pattern. COA names `SplitTreeView` and the Cost Center master/detail composition as
  the required closest reuse reference without transferring HR domain logic.
- Every named master has explicit `NameAr`/`NameEn` API, form, view, list/search and
  mock-draft parity; non-named rows reuse localized linked-owner labels.
- Planning Check: PASS.
- Documentation system check: PASS for 101 recipes after generator-driven refresh
  and v2 contract registration.
- `required-files.json` parse: PASS; `git diff --check`: PASS with line-ending
  notices only.

## Final reconciliation

Phase 00 decision: **READY FOR CODING — 2026-09-20**.

Closure evidence:

- Planning checks: PASS.
- Documentation generation/check: PASS, 85 recipes.
- ArchitectureTests: 51 passed, 0 failed, 0 skipped.
- Recipe/required-file JSON parse: PASS.
- unresolved-placeholder scan: PASS.
- `documentation/old files` manifest-isolation scan: PASS.
- `git diff --check`: PASS; line-ending notices only.
- generated Phase 00 packet:
  `documentation/system/generated/accounting-ledger-setup/PHASE-00-implementation-preflight.md`.

This decision authorizes **only Slice 1**. It does not mark the feature
`Verified`, does not close G4, and does not permit customer education. Phases
01–05 must update this artifact, the four applied books and `required-files.json`
with actual implementation evidence before Phase 06.

Phase 06 also remains unavailable until each active human step has sent and run its
completed manual scenario, the user has explicitly accepted it, and the verbatim
decision is recorded. For the current run, Fiscal Years remains Active and Currency
remains Queued until
`documentation/plans/business/accounting-core-gl/manual-acceptance/FISCAL-YEARS-STEP-01.md`
is completed and accepted.
