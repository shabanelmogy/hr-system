# Accounting Ledger Setup Implementation Request

Status: **Phase 00 — READY FOR CODING (2026-09-20); no Ledger Setup runtime code
has been written yet.**

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Accounting Ledger Setup` (`accounting-ledger-setup`) |
| Operating mode | New vertical slice extending the existing Accounting bounded context |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Canonical plan | `documentation/plans/business/accounting-core-gl/PLAN.md` |
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
| Permissions | Accounts:View, Accounts:Manage, Dimensions:View, Dimensions:Manage, AccountingSetup:Manage |
| Web | COA tree + setup lists/forms Required; Cards/Import/Bulk Deferred |
| Mobile | COA tree + setup lists/forms Required; offline writes/import Excluded |
| Reporting | N/A for Slice 1; GL/TB later |
| Notifications/realtime | Deferred; correctness never depends on them |

## Existing-System Relationship Review

| Concern | Decision |
| --- | --- |
| Owning capability | Existing Accounting bounded context: `api/Modules/Accounting` |
| Primary relationship | Extend existing owner + Change transitional Currency ownership + Add new Accounting setup aggregates |
| Existing behavior retained | Fiscal Years, acc schema, Accounting UoW, Inbox/Outbox, PartyReference, tenant/company isolation, RowVersion patterns |
| Existing behavior changed | HR-owned writable Currency management moves to Accounting; HR currency consumers use Accounting catalog |
| Existing path disposition | Fiscal Years remains canonical; HR Currency path is replaced after coordinated migration; Branch/CostCenter remain HR-owned |
| Evidence inspected | Accounting module/domain/DbContext/migration/tests, HR Currency/Organizational Structure, Contacts Party contracts, Web/Mobile Fiscal Years, shared UI, central plan/evidence/decisions |

### Ownership, contracts, and reuse inventory

| Item | Owner/source | Decision |
| --- | --- | --- |
| Accounting domain/persistence | Accounting six-project module + `AccountingDbContext` | Extend; all new financial setup stays in `acc` |
| Currency catalog contract | Accounting Contracts | Add stable active-currency lookup/validation contract for HR/other consumers |
| HR currency master | HR Organizational Structure | Replace through one migration; remove writable HR owner after cutover |
| Branch/CostCenter | HR Organizational Structure | Reuse by stable Contract/projection only when enabled as typed source |
| Party | Contacts; current Accounting PartyReference projection | Reuse existing projection; no Party master duplication |
| Fiscal calendar | Accounting Fiscal Years | Reuse unchanged |
| Web COA hierarchy | `SplitTreeView` / `HierarchicalTreeList` | Reuse; generic extension only if evidence proves a shared gap |
| Web lists/forms | `PageHeader`, `MyDataGrid`, `MyForm`, shared dialogs/feedback | Reuse |
| Mobile hierarchy | `AppHierarchicalTree` | Reuse/extend generically |
| Mobile lists/forms | `AppListScreen`, `AppDataTable`, `AppForm`, `AppStateView`, confirmations | Reuse |
| Applied implementation reference | Fiscal Years | Reuse architecture/verification discipline only; no copied business rules |

## Mandatory Business Readiness Gate

### Business Rules Matrix

| ID | Business rule | Owner / enforcement | Stable outcome | Required test |
| --- | --- | --- | --- | --- |
| BR-001 | Current tenant/company is mandatory and server-authoritative | Application + DbContext filters | Missing scope fails closed | company-isolation tests |
| BR-002 | Currency code is normalized ISO 3-letter and unique/company | Domain + database | Validation/duplicate conflict | Currency domain + unique-race tests |
| BR-003 | Exactly one Accounting Currency master exists after migration | Migration + architecture | No HR writable duplicate remains | migration + architecture test |
| BR-004 | Company settings is one row/company | Domain/application + unique DB key | deterministic singleton conflict | persistence/concurrency tests |
| BR-005 | Functional currency references active same-company Currency | Application + DB integrity | invalid/inactive reference rejected | handler tests |
| BR-006 | V1 company has one Primary Book selected by settings | Domain/application | invalid/missing primary setup rejected | company-settings tests |
| BR-007 | Account hierarchy level numbers are company-unique and ordered | Domain + database | validation/duplicate conflict | level tests |
| BR-008 | Posting account requires level CanPost + AllowPosting and no children | Domain + persisted-state handler | invalid hierarchy rejected | account domain/handler tests |
| BR-009 | Account code is server-proposed but user-editable if valid/unique | Application + database | proposed or accepted unique code | code-generation + race tests |
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
| Rollback | Currency migration or multi-row settings mutation fails | transaction rolls back; no dual partial owner | operation fails | Infrastructure | migration/transaction tests |
| Post-commit effects | notifications/realtime unavailable | setup commit remains authoritative | no correctness loss | N/A/Deferred effects | explicit absence test |
| Archive/dependency | archive used account/book/currency | block or archive only when allowed; never orphan history | conflict | Application | dependency tests |
| Paging/query | large accounts/rates/profiles | server filters/sorts/pages deterministically | bounded response | Read store | query tests |
| Money/FX | rate <=0, duplicate effective version, invalid pair | reject | validation/conflict | Domain/DB | FX tests |
| Dates | overlapping/equal effective mappings/rates | deterministic validity/ambiguity rules | conflict/diagnostic | Domain/Application | effective-date tests |
| Bulk/import | setup import requested in Slice 1 | no reachable endpoint/UI | Deferred | Scope | architecture/UI absence test |
| Integration | HR currency selector during ownership cutover | consumes Accounting catalog after cutover; historical CurrencyCode remains | no broken historical row | Contracts/migration | integration tests |
| Missing source master | BankAccount/PaymentMethod/etc mapping requested | type unavailable/rejected; no fake record | validation | Application/clients | capability test |
| Security-sensitive files | no file upload in Slice 1 | no file surface | N/A | Scope | N/A — no file capability |
| Compatibility | existing hr.Currencies rows | migrate by tenant/company+ISO code, preserve metadata, then retire HR owner | migration verified | Migration | data-preservation test |
| Cancellation/failure | request cancelled before commit | no partial mutation | cancelled/failed | Application/Infrastructure | cancellation/fault test |
| Scale/operability | COA/rate/profile lists grow | indexed server queries; production load measurement remains RISK-007 | bounded query, G4 still gated | DB/read store | query-plan/scale evidence later |

### Impact Matrix

| Area | Decision | Existing owner/artifact | Required change | Evidence / required test |
| --- | --- | --- | --- | --- |
| Domain | Add + Change | Accounting Domain; HR Currency | add setup aggregates; move Currency owner | domain + architecture tests |
| Application/CQRS | Add | Accounting Application | feature commands/queries/ports/errors | handler/validator tests |
| Infrastructure | Extend | AccountingDbContext/UoW | tables/config/stores + Currency migration | migration/model tests |
| Presentation/API | Add | Accounting Presentation | thin versioned controllers per route family | controller contract tests |
| Permissions | Extend | AccountingPermissions | Slice 1 permissions only | permission catalog/parity tests |
| Tenant/company scope | Reuse | AccountingDbContext/current actor | apply existing fail-closed scope to all new entities | isolation tests |
| Migration/data compatibility | Change | hr.Currencies + acc schema | one ownership cutover; preserve ISO/company data | migration preservation tests |
| Integration contracts | Add/Reuse | Accounting Contracts, HR Contracts, Contacts events | Accounting Currency contract; optional HR reference adapters; keep Party projection | integration tests |
| Jobs/realtime/cache | N/A/Deferred | existing platform systems | no correctness dependency in Slice 1 | absence documented |
| Module tests | Extend | ErpSystem.Modules.Accounting.Tests | domain/handler/persistence/controller/migration tests | focused suite |
| Architecture tests | Extend | ErpSystem.ArchitectureTests | owner/dependency/no-duplicate/no-runtime-scope guards | architecture suite |
| Web | Add + Change | Accounting Fiscal Years + HR Currency UI | setup workspace + retire HR Currency management/consume Accounting lookup | type/architecture/component/route tests |
| Mobile | Add + Change | Accounting Fiscal Years + HR Currency UI | setup screens + retire HR Currency management/consume Accounting lookup | type/architecture/API/route tests |
| Documentation | Extend | plan/module/system/applied profiles | keep current-vs-target and actual evidence synchronized | generator/planning checks |

## Import contract

Import is **Deferred on Web and Excluded on Mobile for Slice 1**. There is no
endpoint, parser, template, upload button, placeholder route or partial import
implementation. Reopen only under a separate contract defining atomicity,
duplicates, dependency resolution, limits and rejected-row handling.

## Required implementation

API:
1. Currency ownership migration and Accounting Currency catalog Contract.
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
4. switch HR currency consumers to Accounting catalog and retire HR Currency
   management surface;
5. permission/read-only/localization/RTL/accessibility/responsive tests.

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
records only `Verified` or `Not Verified`. Customer education starts only after
`Verified`.
