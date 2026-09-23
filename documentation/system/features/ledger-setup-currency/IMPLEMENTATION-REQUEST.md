# Ledger Setup Currency Implementation Request

This is the execution contract for child package `ledger-setup-currency`. Product
intent remains owned by `accounting-core-gl`; this file translates the closed child
Screen/Workflow Contract and verified current runtime into implementation work.

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Ledger Setup Currency` (`ledger-setup-currency`) |
| Operating mode | `existing-feature change / reconciliation` |
| Plan ID | `accounting-core-gl` |
| Authorized slice / phase | `Slice 1 — Ledger setup spine` / child `1A` |
| Canonical plan | `documentation/plans/business/accounting-core-gl/PLAN.md` |
| Feature decomposition decision | `Decompose` |
| Screen/Workflow Contract | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-currency.md` |
| Applied implementation reference | `fiscal-years` |
| Request date | `2026-09-22` |
| Review artifact | `documentation/system/features/ledger-setup-currency/LEDGER_SETUP_CURRENCY-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/ledger-setup-currency/required-files.json` |
| Owning module | `Accounting` |
| Module documentation package | `documentation/modules/accounting/` |
| Public module contract | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Contracts/CurrencyCatalogContracts.cs` |
| Shared reuse inventory | `documentation/project/SHARED_REUSE_CATALOG.md` plus exact components recorded in the child contract and platform profiles |

## Execution request

Reconcile the existing Accounting Currency vertical slice against the closed child
contract. Keep one canonical owner and one runtime surface; do not create a parallel
Currency aggregate, generic CRUD service, compatibility facade, or alternate client
screen. Existing runtime is evidence only until the package exit gate is verified.

Execution order is fixed by the master Slice 1 decomposition. This package is first.
No COA/Hierarchy child implementation is accepted as started until Currency reaches
its child exit gate.

Before runtime changes, Phase 00 must have final applied books, required-file
manifest, registered generated packet and green documentation check. A material
contradiction affecting ownership, persisted meaning, lifecycle or a Required
customer journey reopens the owning plan decision before coding.

## Approved product decisions translated for execution

| Concern | Required decision |
| --- | --- |
| Ownership and scope | Accounting owns the writable Currency master; records are tenant + company scoped from trusted `ICurrentActor`; HR only stores validated `CurrencyCode` snapshots in its own business records. |
| Fields and relationships | `CurrencyCode` is exactly three ASCII letters, trimmed and normalized uppercase; `NameEn` and `NameAr` are required max 100; `Symbol` required max 10; opaque RowVersion protects mutations. No `IsDefault` or `ExchangeRateToDefault` authority exists. |
| Permissions and read-only | Reads and active lookup require `AccountingSetup:View`; create/update/archive/restore require `AccountingSetup:Manage`; application read-only mode suppresses all writes. |
| List contract | Server-owned paging; search max 200; fields `all/currencyCode/nameAr/nameEn/symbol`; operators `contains/doesNotContain/equals/doesNotEqual/startsWith/endsWith`; status `active/archived/all`; sort `currencyCode/nameAr/nameEn/symbol/createdOn`; deterministic Id tie-break. |
| Lifecycle | Create active; update active record; soft archive; restore. Archive is idempotent when already archived and is blocked while referenced by Accounting settings, accounts or exchange rates. Restore of active record is idempotent. Update/archive/restore use current RowVersion. |
| Web views | Grid/list + detail/create/edit + archive/restore are Required. Separate Cards/Tree/Chart/Report/Import/Export views are Excluded for this child. |
| Mobile views | Table + Cards sharing one server list, detail/create/edit and archive/restore are Required. Tree/Chart/Report/Import/Export are Excluded. |
| Reporting | Excluded from Currency master child; no reporting dataset or runtime placeholder. Reopen only under a future approved reporting requirement. |
| Import | Excluded from API/Web/Mobile for Slice 1 Currency; low-volume master maintenance is explicit. Reopen only through a later approved bulk-onboarding requirement. |
| Realtime and notifications | No Currency-specific notification contract is required. Client mutations must invalidate/refetch Currency page/detail/lookup state after committed success; no client may synthesize financial truth. |
| Customer Education Pack | Required at Slice 1 closure: `documentation/plans/business/accounting-core-gl/education/ledger-setup-currency.md`; Phase 07 starts only after Phase 06 records `Verified`. |

## Existing-System Relationship Review

| Concern | Required decision |
| --- | --- |
| Owning capability | Accounting → Finance → Ledger Setup → Currencies; Domain `Currency`, Currency CQRS vertical slice, `AccountingDbContext.Currencies`, `/api/v1/currencies`, Accounting Web/Mobile Currency modules. |
| Primary relationship | `Same aggregate/capability already owns the rule` — extend/reconcile the existing capability; never create a parallel feature. |
| Existing behavior affected | Preserve current Accounting ownership, company isolation, normalized ISO code, typed page/detail/lookup, soft lifecycle, concurrency, View/Manage permissions and HR public catalog consumption; correct only verified deviations from this child contract. |
| Existing path disposition | Existing Accounting Currency paths are canonical and retained; the older `accounting-ledger-setup` generic umbrella remains integration/history evidence, not child CRUD authority. |
| Evidence inspected | Currency Domain/Application/Infrastructure/Presentation, `CurrencyOwnershipTests`, initial Accounting migration/model, architecture/integration ownership tests, Web Currency module/route/service/hooks/form/grid/tests, Mobile Currency module/route/remote/use-cases/schemas/screen/tests, Accounting/HR Currency Contract consumers. |

### Ownership, contracts, and reuse inventory

| Item | Owner/source | Decision and evidence |
| --- | --- | --- |
| Domain rules and persistence | `api/Modules/Accounting/.../Domain/Finance/LedgerSetup/Entities/Currency.cs`, `AccountingDbContext`, `CurrencyStores.cs` | Reuse/extend existing owner. Company uniqueness is race-safe in `acc.Currencies`; lifecycle remains soft-delete. |
| Cross-module Contract/event | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Contracts/CurrencyCatalogContracts.cs` | Reuse current read-only active catalog; HR consumes it without writable Currency ownership. No new event is required by this child. |
| Web list state | `web-next/src/shared/hooks/useServerListState.ts`, `useAdaptivePagination.ts`, `MyDataGrid.tsx` | Reuse; server remains authoritative for criteria, totals and paging. |
| Web form/lifecycle | `MyForm.tsx`, `MyTextField.tsx`, `ConfirmationDialog.tsx`, shared feedback | Reuse; Currency-specific validation/error mapping stays module-local. |
| Mobile collection/forms | `AppListScreen.tsx`, `AppDataTable.tsx`, `AppForm.tsx`, `AppStateView.tsx`, `ConfirmationDialog.tsx` | Reuse; Currency repository/use-case/schema layers remain module-local. |
| Existing generic Ledger Setup renderer | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` and mobile equivalent | Rejected as child authority; it may remain umbrella/history evidence but must not replace the typed Currency slice. |

## Mandatory Business Readiness Gate

### Business Rules Matrix

| ID | Business rule | Owner / enforcement layer | Stable error or outcome | Required test |
| --- | --- | --- | --- | --- |
| `CUR-BR-001` | Currency code is a normalized uppercase three-letter ISO-shaped identifier. | Domain + Application shape validation | validation failure | lowercase/whitespace normalization + malformed code rejection |
| `CUR-BR-002` | Code is unique inside trusted tenant/company scope, including archived records so archive does not free the business key. | Application pre-check + Database unique index | `Currency.DuplicateCode` / conflict | duplicate active and archived key + race-safe index evidence |
| `CUR-BR-003` | Tenant/company scope comes only from the current actor; missing scope fails closed. | Application + global query filters | `Currency.CompanyContextRequired` / forbidden | missing scope and cross-company isolation |
| `CUR-BR-004` | Only active Currency records appear in lookup/catalog contracts. | Infrastructure owner projection | empty/not found for archived code | active vs archived lookup/catalog tests |
| `CUR-BR-005` | A Currency referenced by Accounting Company Settings, Accounts or Exchange Rates cannot be archived. | Application through narrow write store | `Currency.InUse` / conflict | each dependency class blocks archive |
| `CUR-BR-006` | Update, archive and restore use optimistic concurrency; stale writers never overwrite newer state. | Application + EF/Database RowVersion | shared `ConcurrencyConflict` / conflict | stale update/archive/restore |
| `CUR-BR-007` | Archive is soft-delete and repeated archive is idempotent; restore is idempotent when already active. | Application lifecycle handler | success/no duplicate side effect | repeated lifecycle actions |
| `CUR-BR-008` | Currency is the Accounting master; Functional Currency and Exchange Rates remain sibling child workflows and are not fields on Currency. | Plan/Domain boundary | no legacy/default-rate fields | architecture/model assertion for absence of `IsDefault` and `ExchangeRateToDefault` |
| `CUR-BR-009` | HR validates user-supplied currency snapshots through `IAccountingCurrencyCatalog`; HR cannot own/query a writable Currency table. | Accounting public Contract + HR Application adapter | HR stable invalid/inactive currency failure | architecture/integration consumer tests |
| `CUR-BR-010` | List criteria and total count are server-owned with deterministic ordering. | Application validator + Infrastructure projection | validation failure or page response | invalid criteria + total + Id tie-break tests |

Approvals, monetary calculations/rounding, fiscal locks, reversal/amendment and
numbering are `N/A` for the Currency master itself; those rules belong to later
Accounting children and must not be copied into this aggregate.

### Edge Cases & Validation Matrix

| Category | Scenario | Expected behavior | Stable error / HTTP outcome | Enforcement layer | Required test |
| --- | --- | --- | --- | --- | --- |
| Input shape / null / format / range | blank names/symbol, code not exactly three ASCII letters, over-length fields | reject before persistence; trim/uppercase code in owner | validation / 400 | FluentValidation + Domain | valid boundary and malformed requests |
| Duplicate input / normalization | ` egp ` when EGP exists | normalized duplicate rejected | `Currency.DuplicateCode` / 409 | Application | normalized duplicate |
| Duplicate persisted data / uniqueness race | concurrent same-company creates | at most one persisted row | database conflict translated stably | Database + Application | unique-index/race evidence |
| Relationship existence / active or archived state | archive record referenced by settings/account/FX | reject archive | `Currency.InUse` / 409 | Application store query | reference guard cases |
| Tenant / company / branch / site / warehouse scope | missing tenant/company or cross-company id | fail closed / not visible | forbidden or not found | Application + query filters | scope/isolation tests; branch/site/warehouse N/A |
| Permission / entitlement / actor state | View-only caller attempts write | deny before handler; read remains available | 403 | authorization pipeline | controller/route permission tests |
| Lifecycle / invalid, repeated, or out-of-order transition | repeated archive/restore | idempotent as defined; archived update rejected | success or not-found/invalid-state contract | Application | repeated lifecycle + archived update |
| Concurrency / stale revision / competing writes | stale RowVersion on update/archive/restore | reject without lost update; clients reload | `ConcurrencyConflict` / 409 | EF concurrency + Application mapping | stale mutation tests |
| Idempotency / retry / double-submit | retry create after successful commit | uniqueness prevents second record; lifecycle retries idempotent | duplicate conflict or lifecycle success | Application + Database | create retry + lifecycle retry |
| Transaction rollback / commit failure | save fails | no success response or partial logical mutation | stable unexpected/persistence ProblemDetails | Unit of Work | transaction failure where infrastructure harness supports it |
| Post-commit side-effect failure | no required external side effect in Currency child | N/A: client cache invalidation happens after HTTP success and is not server business state | N/A | N/A | N/A |
| Archive / restore / delete / dependency behavior | referenced archive, archived lookup, restore | reference guard, lookup exclusion, restore preserves identity | `Currency.InUse` or success | Application/Infrastructure | lifecycle/catalog tests |
| Paging / filtering / sorting / deterministic ordering / query shape | invalid criteria, empty page, large page, equal sort values | validate allow-lists/limits; return real total; Id tie-break | validation / 400 | Application + Infrastructure | criteria and deterministic order tests |
| Money / quantity / UOM / rounding / currency | Currency master stores identity only | N/A: no amount/rate/rounding fields | N/A | N/A | model assertion |
| Dates / timezone / effective dates / closed periods | master has audit timestamps only | N/A: no business effective-date/fiscal-period lifecycle | N/A | N/A | no feature-owned date rule |
| Bulk / import / partial-versus-atomic behavior | bulk import requested | N/A: Import Excluded for Slice 1 | no endpoint/screen | architecture/UI absence | no reachable import path |
| Integration duplicate / out-of-order / timeout / retry exhaustion / reconciliation | HR catalog lookup while code archived | lookup returns no active match; HR fails closed | HR stable invalid/inactive currency outcome | public Contract + HR Application | consumer integration test |
| File / security-sensitive input / ownership / unsafe paths or secrets | no file input | N/A: feature accepts typed text fields only | N/A | N/A | no upload surface |
| Compatibility / versioning / existing-data migration | legacy HR Currency ownership/default-rate fields | clean development baseline only; no legacy facade/backfill authority | one `acc.Currencies` owner | migrations + architecture | baseline migration/ownership tests |
| Cancellation / timeout / unexpected failure | cancelled query/write or unexpected DB failure | honor token; no false success | stable platform ProblemDetails | Application/Infrastructure/host | cancellation/failure path as supported |
| Scale / N+1 / hot-path index / operability / replay-recovery | company catalog/list grows | bounded pages, indexed company/code, projection-only reads; active lookup remains explicit | bounded response | Database/Infrastructure | index/model + query-shape evidence |

### Impact Matrix

| Area | Decision | Existing owner / artifact | Required change | Evidence / required test |
| --- | --- | --- | --- | --- |
| Domain | Reuse | `Currency.cs` | reconcile invariants only if contract gap is proven | domain tests |
| Application / CQRS | Reuse | Currency Commands/Queries/Contracts/Errors | preserve typed vertical slice; fill only verified contract gaps | handler/validator tests |
| Infrastructure / persistence | Reuse | `CurrencyStores.cs`, `AccountingCurrencyCatalog.cs`, `AccountingDbContext`, initial migration | preserve scope, indexes, soft lifecycle and active catalog | model/store/catalog tests |
| Presentation / API contract | Reuse | `CurrenciesController.cs` | keep thin `/api/v1/currencies` View/Manage surface | controller contract tests |
| Permissions / security | Reuse | `AccountingPermissions`, endpoint attributes, client route guards | verify View/Manage/read-only parity | authorization tests |
| Tenant / company / business scope | Reuse | `ICurrentActor`, Accounting global filters | no client-owned scope | isolation tests |
| Migration / data compatibility | Reuse | `20260922091842_InitialAccounting.cs`, `InitialHr` clean baseline | no legacy migration/backfill; verify one owner | baseline migration tests |
| Integration contracts / events / projections | Reuse | `IAccountingCurrencyCatalog` | keep active read-only cross-module catalog | HR/Accounting contract tests |
| Jobs / realtime / cache | N/A | no Currency-specific server job/realtime contract required | client query invalidation only | client mutation tests |
| Module tests | Extend | `CurrencyOwnershipTests.cs` | add focused cases only for any discovered gap | Accounting module focused tests |
| Architecture / integration tests | Reuse/Extend | `CurrencyOwnershipArchitectureTests.cs`, `CurrencyBaselineMigrationTests.cs` | preserve ownership/baseline guards; extend only if gap found | architecture/integration tests |
| Web consumer | Reuse/Extend | `web-next/src/modules/accounting/currencies/` | reconcile current screen with child contract; no generic umbrella authority | service/component/route/access tests |
| Mobile consumer | Reuse/Extend | `mobile-react/src/modules/accounting/currencies/` | reconcile current Table/Cards/form flow with child contract | remote/use-case/screen/access tests |
| Documentation / runbook | Add | this child package and four applied books | register/generate Phase 00–07 child recipes; Phase 07 education after verification | generator/check |

## Import contract

Import is **Excluded** for API, Web and Mobile in this child. There is no parser,
template, multipart/JSON bulk endpoint, rejected-row artifact or placeholder UI.
Reopen only if a later approved plan requires bounded master-data onboarding; that
future decision must define format, size/row limits, exact envelope, duplicate scope,
transaction semantics and permissions before runtime is introduced.

## Required implementation

- API: reconcile the existing Currency Domain/Application/Infrastructure/Presentation
  path against this request; do not replace a correct existing path for symmetry.
- Next.js: retain the dedicated typed Currency route, service, server-list state,
  Grid/form/lifecycle and shared primitives; fix only contract gaps.
- Expo: retain the dedicated layered Currency route, runtime schemas, repository,
  use cases, Table/Cards/form/lifecycle and permissions; fix only contract gaps.
- Documentation: keep this execution package, the four applied books, final evidence
  manifest, registered recipes and generated phases current. Education is Phase 07.

## Optional offline and synchronization decisions

| Capability | API | Web | Mobile | Decision, owner, and acceptance evidence |
| --- | --- | --- | --- | --- |
| Cached/offline read | Excluded | Excluded as authoritative offline data | Excluded as authoritative offline data | ordinary in-memory query cache may render while refreshing, but no feature-owned persistent financial cache becomes truth |
| Local draft/write | Excluded | Excluded | Excluded | Currency writes require live authorization and server validation |
| Sync/outbox write | Excluded | Excluded | Excluded | no offline write queue or client outbox |
| Connection required | Required for runtime API | Required for mutations/authoritative refresh | Required for mutations/authoritative refresh | failed/uncertain request never shows synthesized success |
| Local security | N/A | N/A beyond platform session/cache policy | N/A beyond platform session/cache policy | no Currency-owned persisted secrets or local database |
| Lifecycle/recovery | N/A | refetch after conflict/failure | refetch after conflict/failure | server state wins after 409/uncertain mutation |

## Phase 00 execution-readiness decision

Phase 00 may close when all of the following are true:

- the nine Slice 1 child Screen/Workflow Contracts remain closed and planning checks pass;
- this file and the review artifact contain no unresolved placeholders;
- the four Currency applied books exist and describe current vs target-only behavior;
- `required-files.json` includes current API/Web/Mobile/configuration/localization/test evidence;
- Currency recipes are registered and the generated Phase 00 packet is current;
- `Generate-Documentation.ps1 -Check` passes.

Passing Phase 00 authorizes **review/reconciliation implementation** for Currency; it
does not mark Currency complete and it does not authorize the next child package.
