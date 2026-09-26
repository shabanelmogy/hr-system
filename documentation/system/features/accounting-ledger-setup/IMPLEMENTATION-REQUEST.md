# Accounting Ledger Setup Implementation Request

Status: **Domain/API and clean-baseline evidence exists; typed Currency and COA
clients also exist. The current v2 execution run starts with Fiscal Years as the
sole Active step; Currency and every later child remain Queued until the preceding
step is Closed (reconciled 2026-09-25).**

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Accounting Ledger Setup` (`accounting-ledger-setup`) |
| Operating mode | New vertical slice extending the existing Accounting bounded context |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Canonical plan | `documentation/plans/business/accounting-core-gl/PLAN.md` |
| Slice 1 execution decomposition | `documentation/plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| Applied implementation reference | `fiscal-years` — same-module architecture/verification pattern only |
| Request date | 2026-09-20 |
| Review artifact | `documentation/system/features/accounting-ledger-setup/ACCOUNTING_LEDGER_SETUP-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/accounting-ledger-setup/required-files.json` |
| Owning module | Accounting |
| Module docs | `documentation/modules/accounting/` |
| Public module contract | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Contracts/` |
| Shared reuse inventory | `documentation/project/SHARED_REUSE_CATALOG.md`, Fiscal Years profiles, Web/Mobile shared component libraries |
| Customer education | Required after Phase 06 `Verified`; target `documentation/plans/business/accounting-core-gl/education/accounting-ledger-setup.md` |

## Execution request

Implement Slice 1 end to end in the **existing** Accounting module. Do not implement
JournalEntry/posting runtime, GL/TB, independent Month Close, opening balances,
subledgers, or fake source masters.

Before changing runtime source, read the approved plan, this request, the review
artifact, the four Accounting Ledger Setup applied profiles, Accounting module docs,
API workflow, Fiscal Years reference evidence, and generated Phase 00 packet.

If implementation discovers a business change that affects ownership, persisted
financial meaning, security, lifecycle or a Required customer journey, stop the
affected work and reopen the relevant plan gate. Do not solve it as a feature-local
exception.

### Child execution authority

This umbrella request remains the Slice 1 integration/history contract. Current v2
Slice 1 revalidation, implementation and corrective work is decomposed by
`SLICE-01-LEDGER-SETUP-EXECUTION.md` into `1A` Currency, `1B` COA/Hierarchy, `1C`
Dimensions, `1D` Books/Journals, `1E` Company Settings, `1F` Exchange Rates, `1G`
Link Accounts, `1H` Posting Profiles and `1V` Integration/Verification.

Work one step at a time. Fiscal Years is the sole Active v2 step; `1A` is queued
behind it, `1B` is queued behind `1A`, and the remaining children follow the master
roadmap. Historical implementation or closure is evidence, not permission to skip
the current ordered live-revalidation gate. Each child owns typed API/transport
models, feature-owned client data boundaries and an explicit Screen Contract. The
current generic `LedgerSetupRecord`/resource renderer is compatibility evidence to
refactor, not an architecture to expand. The umbrella remains responsible for
cross-child integration and the final Phase 06 result.

Each human roadmap step also owns a mandatory manual gate. When its automated
API/Web/Mobile evidence is ready, the implementation agent must send a completed,
feature-specific copy of
`documentation/plans/business/accounting-core-gl/MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`.
The user executes or supervises the Web and actual-device journey and returns an
explicit decision. Until the decision is `Accepted`, the current step remains
Active, Phase 06 and documentation closure remain open, and no later child becomes
Active. A failure produces a versioned, impact-scoped retest scenario after the fix.

## Approved product decisions translated for execution

| Concern | Frozen execution decision |
| --- | --- |
| Scope | Tenant + current company from trusted actor; clients never submit scope |
| Currency ownership | Move the single company Currency master from HR Organizational Structure to Accounting; never run two writable masters |
| Company financial policy | One `AccountingCompanySettings` row/company with FunctionalCurrencyId + PrimaryBookId + RowVersion |
| COA | Company-owned hierarchy; configurable levels; server proposes editable unique code |
| Posting account | Level `CanPost` + Account `AllowPosting`; posting account cannot have children |
| Manual posting | Allowed / Restricted / Blocked |
| Account currency | Any / FunctionalOnly / SpecificCurrency |
| Dimensions | Configurable, typed value sources; no generic EAV API or copied source master |
| Books | One Primary Book/company V1; model remains book-aware |
| Journal setup | Definition/category/numbering config only; no JournalEntry lifecycle in Slice 1 |
| FX | Accounting-owned ExchangeRateType + historical/versioned ExchangeRate; former HR ExchangeRateToDefault ceases to be financial authority |
| Link Accounts | Typed/effective direct purpose mappings; company-purpose default always available |
| Posting Profiles | Effective/versioned deterministic rules + resolve-preview; zero/ambiguous result blocks |
| External source types | Expose only when owning Contract/master exists; do not invent BankAccount/PaymentMethod/Cashbox/ContactGroup/PartyRole |
| Fiscal Years | Reuse existing Accounting authority unchanged |
| Bilingual names | Every named master stores and transports distinct required `NameAr` and `NameEn`; create/edit/view/list/search and local mock drafts preserve both. Non-named settings, relationship and historical rows display localized names from their linked named owners and must not invent duplicate name fields. |
| Permissions | Every resource uses exact action claims. Accounts, hierarchy levels, dimension definitions/values, currencies, books, journals, and exchange-rate types use `View/Create/Edit/Archive/Restore`; settings and account-dimension policies use `View/Edit`; exchange rates and account mappings use `View/Create/Edit`; posting profiles use `View/Create/Edit/Resolve`. No runtime `Manage` claim. |
| Web | Apply each child contract's approved UI pattern and per-view capability decisions; no umbrella-wide assumption that every setup screen needs or forbids Cards. Import/Bulk remain outside Slice 1 unless a child explicitly reopens them. |
| Mobile | Apply each child contract's approved UI pattern and per-view Table/Cards decision; offline writes/import remain Excluded. |
| Reporting | N/A for Slice 1; GL/TB later |
| Notifications/realtime | Deferred; correctness never depends on them |

## Existing-System Relationship Review

| Concern | Decision |
| --- | --- |
| Owning capability | Existing Accounting bounded context: `api/Modules/Accounting` |
| Primary relationship | Extend existing Accounting owner + cleanly rebaseline Currency ownership + add new Accounting setup aggregates |
| Existing behavior retained | Fiscal Years, acc schema, Accounting UoW, Inbox/Outbox, PartyReference, tenant/company isolation, RowVersion patterns |
| Existing behavior changed | Accounting owns writable Currency from baseline; HR currency consumers validate CurrencyCode snapshots through Accounting catalog; Web/Mobile Currency management is routed under Accounting Ledger Setup |
| Existing path disposition | Fiscal Years remains canonical; `/finance/ledger-setup/currencies` is the only Web/Mobile Currency management path; HR has no Currency persistence/management owner and no legacy Currency client route; Branch/CostCenter remain HR-owned |
| Evidence inspected | Accounting module/domain/DbContext/migration/tests, HR Currency/Organizational Structure, Contacts Party contracts, Web/Mobile Fiscal Years, shared UI, central plan/evidence/decisions |

### Ownership, contracts, and reuse inventory

| Item | Owner/source | Decision |
| --- | --- | --- |
| Accounting domain/persistence | Accounting six-project module + `AccountingDbContext` | Extend; all new financial setup stays in `acc` |
| Currency catalog contract | Accounting Contracts | Add stable active-currency lookup/validation contract for HR/other consumers |
| Currency master | Accounting | Own from `InitialAccounting`; `InitialHr` never creates Currency; no cutover/data-copy path |
| Branch/CostCenter | HR Organizational Structure | Reuse by stable Contract/projection only when enabled as typed source |
| Party | Contacts; current Accounting PartyReference projection | Reuse existing projection; no Party master duplication |
| Fiscal calendar | Accounting Fiscal Years | Reuse unchanged |
| Web COA hierarchy | `SplitTreeView` / `HierarchicalTreeList` | Reuse; generic extension only if evidence proves a shared gap |
| Web lists/forms | `PageHeader`, `MyDataGrid`, `MyForm`, shared dialogs/feedback | Reuse |
| Mobile hierarchy | `AppHierarchicalTree` | Reuse/extend generically |
| Mobile lists/forms | `AppListScreen`, `AppDataTable`, `AppForm`, `AppStateView`, confirmations | Reuse |
| Applied implementation reference | Fiscal Years | Reuse architecture/verification discipline only; no copied business rules |

### Approved UI pattern map

| Capability | Pattern | Required composition |
| --- | --- | --- |
| Fiscal Years, Currency and flat setup masters | `P-001` Server-managed Grid/CRUD | Web Grid; Mobile Table and Cards only where the child contract marks Cards Required |
| Accounts | `P-002` Hierarchical Master/Detail + secondary `P-001` list | Web `SplitTreeView`; Mobile `AppHierarchicalTree`; typed detail and lifecycle forms |
| Dimension constraints and Link Accounts | `P-006` Scoped Relationship / Mapping Editor | typed owner/context selectors, relationship matrix/list, explicit save and conflict feedback |
| Company Settings | `P-005` Singleton Settings Editor | one authoritative settings form; no fabricated list or lifecycle |
| Ledger Setup overview | `P-007` Settings Navigation Hub | permission-filtered child navigation and truthful readiness/feedback states |
| Posting resolve preview | Feature-specific diagnostic sub-surface under `P-001` | read-only typed request/result panel; never presented as a writable master |

The patterns are approved, not Candidate. Feature pages must compose the shared Web
and Mobile design-system components named in the child contract. The generic Ledger
Setup renderer is compatibility evidence only and is not a substitute for any pattern
above.

## Mandatory Business Readiness Gate

### Business Rules Matrix

| ID | Business rule | Owner / enforcement | Stable outcome | Required test |
| --- | --- | --- | --- | --- |
| BR-001 | Current tenant/company is mandatory and server-authoritative | Application + DbContext filters | Missing scope fails closed | company-isolation tests |
| BR-002 | Currency code is normalized ISO 3-letter and unique/company | Domain + database | Validation/duplicate conflict | Currency domain + unique-race tests |
| BR-003 | Exactly one writable Currency master exists and it is Accounting-owned from baseline | Baseline persistence + architecture | `acc.Currencies` exists; HR owns no Currency table/entity/management surface | baseline migration + architecture test |
| BR-004 | Company settings is one row/company | Domain/application + unique DB key | deterministic singleton conflict | persistence/concurrency tests |
| BR-005 | Functional currency references active same-company Currency | Application + DB integrity | invalid/inactive reference rejected | handler tests |
| BR-006 | V1 company has one Primary Book selected by settings | Domain/application | invalid/missing primary setup rejected | company-settings tests |
| BR-007 | Account hierarchy level numbers are company-unique and ordered | Domain + database | validation/duplicate conflict | level tests |
| BR-008 | Posting account requires level CanPost + AllowPosting and no children | Domain + persisted-state handler | invalid hierarchy rejected | account domain/handler tests |
| BR-009 | Account code is server-proposed but user-editable if valid/unique; D-024 uses a non-hierarchical company-wide `ACC-####` suggestion and keeps archived codes reserved | Application + database | proposed or accepted unique code; duplicate race is deterministic | proposal/reservation + race tests |
| BR-010 | Used financial setup is archived/versioned, not destructively deleted | Domain/application | archive or in-use conflict | dependency lifecycle tests |
| BR-011 | ManualPostingPolicy is Allowed/Restricted/Blocked | Domain | undefined value rejected | enum/policy tests |
| BR-012 | CurrencyPolicy is Any/FunctionalOnly/SpecificCurrency | Domain/application | missing/incompatible specific currency rejected | account currency tests |
| BR-013 | Dimension source is typed; source adapter must exist before enabling external source | Domain/application | unsupported source rejected | dimension source tests |
| BR-014 | No generic EAV mutation endpoint exists | Architecture | typed contracts only | architecture tests |
| BR-015 | Journal in Slice 1 is setup/numbering only | Scope/architecture | no JournalEntry runtime route | architecture/route tests |
| BR-016 | Exchange rates are effective/versioned historical series | Domain + database | duplicate/effective conflict | FX tests |
| BR-017 | Direct mapping resolves purpose/context only when exactly one effective winner exists | Domain/application | no-match or ambiguous diagnostic | resolver tests |
| BR-018 | Equal winning Posting Profile specificity/priority is ambiguous | Domain/application | explicit ambiguous result | resolver tie tests |
| BR-019 | No suspense/random account fallback | Domain/application | no winner blocks | resolver tests |
| BR-020 | Source-specific mapping type is exposed only with a real owner Contract | Application + clients | unavailable type absent/rejected | capability/catalog tests |
| BR-021 | Fiscal Years/period lifecycle is reused, not recreated | Architecture | no duplicate period owner | architecture tests |
| BR-022 | Every protected mutation uses RowVersion where concurrent edit matters | Application + EF | stale write -> concurrency conflict | concurrency tests |

### Edge Cases & Validation Matrix

| Category | Scenario | Expected behavior | Stable outcome | Layer | Required test |
| --- | --- | --- | --- | --- | --- |
| Input shape | blank codes/names, invalid enums, non-ISO currency | reject before handler mutation | validation 400 | FluentValidation/Domain | validator tests |
| Normalization | mixed-case account/currency/setup codes | trim/uppercase according to contract | normalized persisted key | Domain/Application | normalization tests |
| Duplicate persisted data | two same-company codes concurrently | one succeeds, other deterministic conflict | 409 | DB + Application | SQL/metadata race test |
| Relationship state | archived currency/parent/book/dimension referenced | mutation rejected | validation/conflict | Application | handler tests |
| Scope | foreign-company ID/reference supplied indirectly | treated unavailable; no cross-company mutation | 404/validation | filters/Application | isolation tests |
| Permission | caller lacks feature permission or app is read-only | mutation blocked | 403/read-only UI | Presentation/Application/clients | permission parity tests |
| Hierarchy lifecycle | add child beneath posting account or enable posting while children exist | reject | hierarchy conflict | Domain/Application | account tests |
| Concurrency | stale RowVersion update/settings switch | reject and client reloads authoritative state | 409 | EF/Application | concurrency tests |
| Idempotency | repeated identical setup request | no duplicate business record; uniqueness is authoritative | existing/conflict per route contract | Application/DB | retry tests |
| Rollback | Multi-row Accounting settings mutation fails | transaction rolls back; no partial setup state | operation fails | Infrastructure | transaction tests |
| Post-commit effects | notifications/realtime unavailable | setup commit remains authoritative | no correctness loss | N/A/Deferred effects | explicit absence test |
| Archive/dependency | archive used account/book/currency | block or archive only when allowed; never orphan history | conflict | Application | dependency tests |
| Paging/query | large accounts/rates/profiles | server filters/sorts/pages deterministically | bounded response | Read store | query tests |
| Money/FX | rate <=0, duplicate effective version, invalid pair | reject | validation/conflict | Domain/DB | FX tests |
| Dates | overlapping/equal effective mappings/rates | deterministic validity/ambiguity rules | conflict/diagnostic | Domain/Application | effective-date tests |
| Bulk/import | setup import requested in Slice 1 | no reachable endpoint/UI | Deferred | Scope | architecture/UI absence test |
| Integration | HR accepts a new/changed user-supplied CurrencyCode | validate through `IAccountingCurrencyCatalog`; derived/existing snapshots remain code values | invalid/inactive code fails closed; no HR Currency persistence | Contracts/Application | integration/handler tests |
| Missing source master | BankAccount/PaymentMethod/etc mapping requested | type unavailable/rejected; no fake record | validation | Application/clients | capability test |
| Security-sensitive files | no file upload in Slice 1 | no file surface | N/A | Scope | N/A — no file capability |
| Baseline ownership | development schema starts clean | `InitialAccounting` creates `acc.Currencies`; `InitialHr` never creates `hr.Currencies`; no demo-data preservation/backfill | one owner from first migration | Migration/Architecture | clean-database schema test |
| Cancellation/failure | request cancelled before commit | no partial mutation | cancelled/failed | Application/Infrastructure | cancellation/fault test |
| Scale/operability | COA/rate/profile lists grow | indexed server queries; production load measurement remains RISK-007 | bounded query, G4 still gated | DB/read store | query-plan/scale evidence later |

### Impact Matrix

| Area | Decision | Existing owner/artifact | Required change | Evidence / required test |
| --- | --- | --- | --- | --- |
| Domain | Add + Change | Accounting Domain; historical HR Currency design | add setup aggregates; Currency exists only in Accounting | domain + architecture tests |
| Application/CQRS | Add | Accounting Application | feature commands/queries/ports/errors | handler/validator tests |
| Infrastructure | Extend | AccountingDbContext/UoW + clean baselines | tables/config/stores; Currency in Accounting initial baseline only | baseline migration/model tests |
| Presentation/API | Add | Accounting Presentation | thin versioned controllers per route family | controller contract tests |
| Permissions | Extend | AccountingPermissions | Slice 1 permissions only | permission catalog/parity tests |
| Tenant/company scope | Reuse | AccountingDbContext/current actor | apply existing fail-closed scope to all new entities | isolation tests |
| Migration/data compatibility | Rebaseline | Accounting + HR initial migrations | no Currency cutover/data copy; no HR Currency table; no `IsDefault`/`ExchangeRateToDefault` backfill | clean-database + no-pending-model tests |
| Integration contracts | Add/Reuse | Accounting Contracts, HR Contracts, Contacts events | Accounting Currency contract; optional HR reference adapters; keep Party projection | integration tests |
| Jobs/realtime/cache | N/A/Deferred | existing platform systems | no correctness dependency in Slice 1 | absence documented |
| Module tests | Extend | ErpSystem.Modules.Accounting.Tests | domain/handler/persistence/controller/migration tests | focused suite |
| Architecture tests | Extend | ErpSystem.ArchitectureTests | owner/dependency/no-duplicate/no-runtime-scope guards | architecture suite |
| Web | Add + Change | Accounting Fiscal Years + historical HR Currency UI | Accounting setup workspace; HR consumers use Accounting lookup only | type/architecture/component/route tests |
| Mobile | Add + Change | Accounting Fiscal Years + historical HR Currency UI | Accounting setup screens; HR consumers use Accounting lookup only | type/architecture/API/route tests |
| Documentation | Extend | plan/module/system/applied profiles | keep current-vs-target and actual evidence synchronized | generator/planning checks |

## Import contract

Import is **Deferred on Web and Excluded on Mobile for Slice 1**. There is no
endpoint, parser, template, upload button, placeholder route or partial import
implementation. Reopen only under a separate contract defining atomicity,
duplicates, dependency resolution, limits and rejected-row handling.

## Required implementation

Execution follows the child-package order in
`SLICE-01-LEDGER-SETUP-EXECUTION.md`. The list below remains the umbrella scope
inventory and must not be interpreted as one generic CRUD implementation unit.

API:
1. Accounting-owned Currency in the clean baseline plus stable Accounting Currency catalog Contract; no HR Currency persistence or cutover migration.
2. AccountingCompanySettings.
3. AccountHierarchyLevel + Account.
4. DimensionDefinition/DimensionValue and typed-source policy.
5. Book and Journal definition/numbering configuration.
6. ExchangeRateType/ExchangeRate.
7. AccountMapping and PostingProfile + resolution preview.
8. Slice 1 permissions, routes, persistence, stable errors, localization and tests.

Web/Mobile:
1. extend existing Accounting module/navigation/route registries;
2. COA tree/detail/create/edit/archive;
3. setup pages/forms for currency, dimensions, books, journals, rates, Link Accounts,
   Posting Profiles and company accounting settings;
4. keep HR free of Currency management/persistence and make its currency consumers
   use the Accounting catalog;
5. preserve distinct `NameAr` and `NameEn` through every named-master create, edit,
   view, list, search and local mock-data journey; linked non-named rows render the
   localized owner label rather than a fabricated name;
6. permission/read-only/localization/RTL/accessibility/responsive tests;
7. implement the approved `P-001`/`P-002`/`P-005`/`P-006`/`P-007` compositions from
   the child contracts, reusing shared components before any feature-local UI.

Explicitly not implemented in Slice 1: JournalEntry posting workflow, GL/TB,
PostingReceipt runtime, independent period close, opening balances, AP/AR, bank/
payment/cashbox masters, realtime/notification dependency, bulk/import.

## Optional offline and synchronization decisions

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| Cached/offline read | Online authoritative | Browser cache only through existing query system | Deferred | no approved mobile offline-read policy for financial setup |
| Local draft/write | Excluded | Excluded | Excluded | server confirmation required |
| Sync/outbox write | N/A for client writes | Excluded | Excluded | do not synthesize financial setup success |
| Connection required | Required for mutations | Required | Required | authorization and concurrency are server-owned |
| Local security | existing platform session rules | existing shell rules | existing secure session rules | no feature-specific credential storage |
| Recovery | standard retry/reload | 409 reload authoritative state | error/refetch authoritative state | no queued mutation |

## Verification and handoff

Phase 01 now applies an entity-by-entity completion gate. Each mutable setup
entity is reviewed separately for create/read/update, archive or an explicit
domain alternative, restore, archived discovery, dependency guards, shared
atomic resources, RowVersion, permissions, localized stable errors and tests.
`AccountingCompanySettings` is update-only singleton configuration;
`AccountDimensionPolicy` is an upserted relationship; ExchangeRate,
AccountMapping and PostingProfile use effective/versioned history instead of a
destructive lifecycle route. All other setup masters expose archive/restore and
`RecordStatus` discovery.

Child-package completion does not close Slice 1. Package `1V` must reconcile the
typed child contracts, exact Screen Contracts and cross-package journeys before
umbrella Phase 06 may record `Verified`.

The same manual gate applies twice where relevant: once to each individual human
feature step and again to `1V`'s final cross-child setup chain. The Phase 06 record
must include the completed scenario, sanitized evidence, results by case ID, and the
user's verbatim acceptance. Historical verification or an agent-authored pass must
not be substituted for that decision.

The same gate is now generated for every future module by
`api/scripts/New-ErpModule.ps1`, and solution architecture tests prevent modules
from replacing host-wide localization registration.

Phase 00 is **Ready for Coding** because:

- this file and review artifact contain no unresolved placeholders;
- the four applied implementation contracts are registered;
- `required-files.json` contains verified preflight evidence;
- generated Phase 00 is current;
- Planning Check, Documentation Check, ArchitectureTests and `git diff --check`
  pass.

Recorded Phase 00 evidence on 2026-09-20: Planning Check PASS; documentation
generator/check PASS for 85 recipes; ArchitectureTests 51/51 PASS; JSON manifest,
placeholder and archive-isolation checks PASS; `git diff --check` has no
non-warning findings.

Phases 01–05 then update the books/manifest with actual runtime paths. Phase 06
records only `Verified` or `Not Verified`, and may record `Verified` only after the
current detailed manual scenario is completed and explicitly accepted by the user.
Customer education starts only after `Verified`.

Persistence checkpoint recorded on 2026-09-22: the EF-generated
`20260922091842_InitialAccounting` clean baseline is registered in the required-file
manifest, has no pending model changes, and passes the clean SQL Server
apply/idempotency integration test. A development database carrying the superseded
Accounting migration history must be reset before this baseline is applied.

Current v2 handoff recorded on 2026-09-25: only Fiscal Years is Active. Historical
Currency and COA evidence remains valid input to their later revalidation, but it
does not mark those steps Active or permit execution to skip the documented order.
