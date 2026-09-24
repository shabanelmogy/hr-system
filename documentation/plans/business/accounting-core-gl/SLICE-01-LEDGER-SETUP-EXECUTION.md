# Accounting Core GL — Slice 1 Ledger Setup Execution Decomposition

## 0. Authority and purpose

This document is the canonical execution decomposition for `accounting-core-gl`
`Slice 1 — Ledger setup spine`. `PLAN.md` remains the master business plan.

The existing `accounting-ledger-setup` feature package remains the umbrella for
cross-package integration, historical implementation evidence, generated Phase
00–07 packets, and final Slice 1 verification. New Slice 1 work is executed through
the child packages below so each capability has a typed API boundary, a focused
screen/workflow contract, and an independent exit gate.

This decomposition does not create a new Accounting module, new ownership boundary,
or new business scope. Runtime implementation still lives in the existing
Accounting module and existing Web/Mobile Accounting feature areas.

**ROADMAP_STATUS_AUTHORITY:** This document owns dependency order and the current
execution status for Slice 1. `PLAN.md` links here and does not duplicate the
step-by-step runbook.

**ACTIVE_FEATURE_STEP:** fiscal-years

Exactly one feature may be `Active`. Every later feature remains `Queued` or
`Blocked` until the active feature is `Verified` and its documentation/closure
stage is `Closed`.

## 1. Execution rules

1. Work one child package at a time by default. Finish its API/client contract and
   focused verification before starting the next package, unless a documented
   dependency requires a small prerequisite from another child.
2. A child package is not a generic CRUD batch. It owns one coherent business
   capability and its exact routes, contracts, screen states, lifecycle and tests.
3. The umbrella `accounting-ledger-setup` package is not the future client screen
   implementation authority. Its current generic Ledger Setup implementation is
   valid historical/integration evidence to refactor, not a pattern to preserve.
   The generic `LedgerSetupRecord` catch-all model and resource-name renderer are
   explicitly not the target architecture. Future corrections move toward
   child-owned typed services/hooks/screens instead of expanding generic switching.
   While queued routes remain reachable, the renderer must still honor cross-cutting
   shared-form safety rules such as D-025. That compatibility coverage is not evidence
   that a queued child package is implemented or accepted.
4. Every child must pass an API-readiness gate before client completion: typed
   request/response models, stable errors, permissions, RowVersion/lifecycle rules,
   deterministic paging/filter/sort/search where applicable, and exact lookups.
5. Every client child must have a Screen Contract before implementation is called
   complete. A Screen Contract states route, purpose, primary layout, data owner,
   actions, states, responsive behavior, accessibility, reuse references and
   verification evidence.
6. Reuse order remains D-005: reuse an existing shared primitive first, extend it
   generically only when evidence proves a shared gap, then add a new reusable
   primitive. Do not copy domain-specific code between modules.
7. Cross-child behavior is accepted only in package 1V Integration & Verification.
   A child may be locally complete while Slice 1 remains open.
8. The human execution sequence starts with Step 01 Fiscal Years & Periods, then
   Step 02 Currency, and continues through the historical child packages. Each
   step is a closed vertical slice in the order `API → Web → Mobile → live
   API-backed verification → documentation/closure`; no later step may start
   until integrated live verification is `Verified` and documentation/closure is
   `Closed` for the current step.
9. Every screen contract must state its Pattern ID and reviewed reference,
   platform adaptation, required/Deferred/Excluded views, form/detail shape,
   loading/empty/error/permission states, mock-data decision, and evidence. The
   shared component list alone is not a pattern decision.

## 2. Child package catalog and dependency order

| Order | Package ID | Child feature | Depends on | Primary outcome |
| ---: | --- | --- | --- | --- |
| 1A | `ledger-setup-currency` | Currency | existing Accounting foundation | one Accounting-owned currency master + active lookup/catalog |
| 1B | `ledger-setup-coa-hierarchy` | COA & Hierarchy | Currency | first-class account tree, level policy, account detail/lifecycle |
| 1C | `ledger-setup-dimensions` | Dimensions | COA account identity for account policies | typed dimensions/values + account dimension constraints |
| 1D | `ledger-setup-books-journals` | Books & Journal Definitions | existing Accounting foundation | one primary-capable Book model + journal definition/numbering setup |
| 1E | `ledger-setup-company-settings` | Company Settings | Currency + Book | functional currency + primary book singleton configured explicitly |
| 1F | `ledger-setup-exchange-rates` | Exchange Rates | Currency | historical FX types/rates with effective/versioned history |
| 1G | `ledger-setup-link-accounts` | Link Accounts | Book + Account | direct effective purpose mappings with only available typed sources |
| 1H | `ledger-setup-posting-profiles` | Posting Profiles | Book + Account + account-determination vocabulary | deterministic conditional resolution + resolve preview |
| 1V | `ledger-setup-integration-verification` | Integration & Verification | 1A–1H | one coherent Ledger Setup workspace, cross-package journeys and Phase 06 evidence |

The order is dependency-driven. It does not change business priority or ownership.
Package 1V is mandatory; completing packages 1A–1H separately does not close Slice 1.

### Current execution status

| Package | Status | Meaning |
| --- | --- | --- |
| `1A` Currency | **Queued — current revalidation** | Historical Phase 07 completion is evidence only; start after Fiscal Years is Closed and revalidate the current contract |
| `1B` COA & Hierarchy | Queued | starts only after the current human Step 02 Currency is Verified/Closed |
| `1C` Dimensions | Queued | starts after the `1B` typed composition seam is ready |
| `1D` Books & Journal Definitions | Queued | focused setup child; no JournalEntry lifecycle |
| `1E` Company Settings | Queued | starts after Currency + Book contracts are ready |
| `1F` Exchange Rates | Queued | starts after Currency contract readiness |
| `1G` Link Accounts | Queued | starts after Account + Book contracts are ready |
| `1H` Posting Profiles | Queued | starts after account-determination dependencies are ready |
| `1V` Integration & Verification | Queued — final | runs after `1A`–`1H`; owns umbrella Phase 06 reconciliation only |

### Human execution sequence (current run)

Historical package IDs are intentionally unchanged. They remain the traceability
keys while this table controls the actual review order:

| Step | Feature | Package/reference | Status | Gate |
| ---: | --- | --- | --- | --- |
| 01 | Fiscal Years & Periods | Existing Accounting Fiscal Years | **Active — revalidation** | Integrated live verification must be `Verified`, then documentation/closure must be `Closed` |
| 02 | Currency | `1A` | Queued | Cannot start before Step 01 is `Closed` |
| 03 | COA & Hierarchy | `1B` | Queued | Cannot start before Step 02 is `Closed` |
| 04 | Dimensions | `1C` | Queued | Cannot start before Step 03 is `Closed` |
| 05 | Books & Journal Definitions | `1D` | Queued | Cannot start before Step 04 is `Closed` |
| 06 | Company Settings | `1E` | Queued | Cannot start before Step 05 is `Closed` |
| 07 | Exchange Rates | `1F` | Queued | Cannot start before Step 06 is `Closed` |
| 08 | Link Accounts | `1G` | Queued | Cannot start before Step 07 is `Closed` |
| 09 | Posting Profiles | `1H` | Queued | Cannot start before Step 08 is `Closed` |
| 10 | Integration & Verification | `1V` | Final | Reconcile all steps and close Slice 1 |

## 3. Screen Contract baseline

Every child screen contract must record and verify all applicable items below.

| Area | Required contract |
| --- | --- |
| Route/entry | one canonical Accounting route; existing Finance/Ledger Setup navigation only |
| Authorization | exact View/Manage permission + global read-only behavior; API remains authoritative |
| Data owner | feature-owned typed service/repository + stable query keys/hooks; no direct component-to-HTTP calls |
| Read state | initial loading, background refresh, empty/no-results, error/retry and current authoritative data |
| Write state | create/edit/view/lifecycle actions, server field errors, RowVersion conflict/reload where applicable |
| Criteria | server-owned paging/search/filter/sort for growing collections; no current-page behavior presented as global |
| Forms | shared form primitives, explicit enum/select sources, server-scope fields absent from payloads |
| Mock data | Every writable form exposes the shared mock-data action after authoritative prerequisites load; it fills local valid draft values only and never submits, persists, fabricates identity/concurrency/scope/posting/auth state. Read-only/report/query-only surfaces are N/A. Reachable generic compatibility forms obey the same rule until their typed child replaces them; this does not close the child gate. |
| Accessibility | translated labels/actions, keyboard/touch target semantics, focus/error behavior, screen-reader names |
| Localization | English/Arabic + RTL/LTR verified through the Accounting translation scope/catalog |
| Responsive | bounded desktop content; compact/mobile layouts avoid page-level horizontal overflow |
| Verification | focused contract tests + component/screen tests + live API-backed Phase 06 journey evidence |

## 3A. Step 01 — Fiscal Years & Periods revalidation contract

Fiscal Years is the sole active feature in the current run. Its complete
Screen/Workflow Contract, including the UI Pattern Gate, API/Web/Mobile contracts,
vertical execution ledger, and pending live-evidence boundary, is canonical at
`decomposition/fiscal-years.md`.

This roadmap owns only the order and status. It must not duplicate the Fiscal
Years screen or API details. Historical implementation and test evidence remains
useful, but cannot move the step to `Verified` until the contract's authenticated
Web and actual Mobile/device journey is recorded.

## 4. Package 1A — Currency

**Scope.** Accounting-owned `Currency` management, active lookup/catalog and HR/future
consumer integration. It does not own functional-currency selection or exchange-rate
history.

**API readiness gate.** Typed Currency list/detail/lookup/mutation contracts; stable
ISO-code normalization/uniqueness errors; server total/search/filter/sort contract;
RowVersion archive/restore; `IAccountingCurrencyCatalog` active validation contract.

**Pattern mapping.** Currency will be revalidated as Step 02 against P-001
Server-managed Grid/CRUD; its exact Web/Mobile views, form states, and evidence
must be recorded in its child contract before Step 02 starts.

**Screen Contract.** Web route `/finance/ledger-setup/currencies`; Mobile route
`/finance/ledger-setup/currencies`. Primary view is a server-managed list with
create/view/edit/archive/restore. The form contains ISO code, bilingual names and
symbol. Archived records remain discoverable through status criteria. HR consumers
use the Accounting lookup and keep their own `CurrencyCode` snapshots.

**Reuse.** Web `PageHeader`, `MyDataGrid`, `MyForm`, shared fields,
`ConfirmationDialog`, shared server-list state; Mobile `AppListScreen`,
`AppDataTable`, `AppForm`, `AppStateView`, `ConfirmationDialog`. Fiscal Years is an
architecture/query-state reference only.

**Mock data.** Currency create/edit uses the shared form action on both platforms;
it fills a valid local bilingual currency draft and never calls the API. The action
is visible according to the shared form contract, not a build-environment flag;
view mode remains without it.

**Exit.** One management route/owner, typed clients, HR selectors migrated, no HR
Currency management/persistence surface, client/API contract tests green.

## 5. Package 1D — Books & Journal Definitions

**Scope.** `Book` plus Slice 1 `Journal` definition/category/numbering configuration.
JournalEntry workflow is excluded until Slice 2.

**API readiness gate.** Typed Book and Journal list/detail/mutation contracts;
active Book lookup; `RecordStatus`; RowVersion lifecycle; deterministic server list
criteria; numbering fields and reset policy validated by the server.

**Screen Contract.** Web routes `/finance/ledger-setup/books` and
`/finance/ledger-setup/journals`; Mobile equivalents. Each uses a focused setup list
and form. Journal forms select an active Book and expose only definition/numbering
fields. No Draft/Submit/Approve/Post actions appear in Slice 1.

**Reuse.** Standard shared list/form/confirmation primitives on each client. Reuse
the existing Ledger Setup launcher/navigation; do not create a second accounting
settings shell.

**Exit.** Book and Journal setup work independently with exact permissions,
archive/restore rules, typed contracts and no JournalEntry runtime leakage.

## 6. Package 1E — Company Settings

**Scope.** The one-row-per-company `AccountingCompanySettings` policy holder with
`FunctionalCurrencyId`, `PrimaryBookId` and RowVersion.

**API readiness gate.** Typed singleton GET/PUT contract; deterministic unconfigured
state; active same-company Currency/Book eligibility; optimistic concurrency and
stable validation errors.

**Screen Contract.** Web route `/finance/ledger-setup/company-settings`; Mobile
equivalent. This is a singleton editor, not a fake collection. It shows functional
currency and primary book selectors, explicit loading/error/unconfigured states,
view/read-only behavior and save/update with conflict reload.

**Reuse.** Web `PageHeader`, `MyForm`, `MySelect`, shared feedback; Mobile
`AppPageHeader`, `AppForm`, `AppSelectField`, `AppStateView`. Currency and Book
lookups come from their child packages.

**Exit.** A company can establish one valid functional currency + primary book and
reload the persisted singleton without deriving policy from UI state or old HR data.

## 7. Package 1B — COA & Hierarchy

**Scope.** `AccountHierarchyLevel` + `Account`, including server-proposed editable
account code, hierarchy rules, posting/manual-posting/currency policies,
archive/restore and account detail.

**API readiness gate.** Typed tree-node, account-detail, hierarchy-level, lookup and
mutation contracts; explicit D-024 `ACC-####` proposed-code endpoint/query with
archived-code reservation and database race closure; current RowVersion on
detail; server search/paging metadata for list fallbacks; hierarchy conflicts and
dependency errors; no hierarchy inference from code prefixes.

**Screen Contract — Web.** `/finance/ledger-setup/accounts` is a first-class
master/detail tree workspace. Reuse `SplitTreeView` / `HierarchicalTreeList` and use
the existing Cost Center tree screen as the closest composition reference:
`web-next/src/shared/components/tree-view/SplitTreeView.tsx` is the shared primitive;
`web-next/src/modules/hr/basic-data/organizational-structure/management/components/tree-view/CostCenterTreeDiagram.tsx`
demonstrates controlled selection, search, expanded tree,
`renderDetailPanel`, `renderEmptyDetailPanel`, contextual add-child/edit actions and
a bounded detail pane. Reuse that interaction pattern without copying HR domain
logic, fields, permissions, move rules or CostCenter code. Account tree nodes remain
lightweight; selecting/opening a node fetches typed account detail before edit or
lifecycle actions. Drag/reparent is enabled only if an explicit Accounting server
contract is approved; editing `ParentAccountId` is not a reason to invent tree DnD.

The Account form exposes parent, configured level, **server-proposed but editable
code**, bilingual names, `AllowPosting`, `ManualPostingPolicy`, `CurrencyPolicy` and
conditional `SpecificCurrencyId`. The detail pane explains server-owned posting and
parent rules. Hierarchy Levels use their own focused list/form route
`/finance/ledger-setup/hierarchy-levels` while remaining part of this child package.

**Screen Contract — Mobile.** Use
`mobile-react/src/shared/components/tree-view/AppHierarchicalTree.tsx` for
hierarchy/search/direct actions plus an explicit `AppForm` detail/create/edit
journey. Do not imitate a desktop split pane on narrow screens. Tablet layouts may
show more context using existing responsive primitives.

**Reuse.** Web `SplitTreeView`, `HierarchicalTreeList`, Cost Center master/detail
composition pattern, `PageHeader`, `MyForm`; Mobile `AppHierarchicalTree`,
`AppForm`, `AppStateView`. Domain behavior remains Accounting-owned.

**Cross-package integration.** Dimension constraints are owned by package 1C and
must appear in the final Account create/edit/detail experience before package 1V can
verify Slice 1. Package 1B must expose a typed composition seam rather than embed a
generic string-key resource switch.

**Exit.** Tree/detail/create/edit/archive/restore + hierarchy-level lifecycle pass
focused tests, proposed code works, full detail is fetched for versioned writes, and
the UI has the composition seam required for Dimension constraints.

## 8. Package 1C — Dimensions

**Scope.** `DimensionDefinition`, `DimensionValue`, typed value sources and
`AccountDimensionPolicy` constraints.

**API readiness gate.** Typed definition/value/policy contracts; server paging total
and criteria where lists grow; typed capability/source catalog; archive/restore
rules; policy upsert semantics; unsupported external source rejected before UI
exposure.

**Screen Contract.** `/finance/ledger-setup/dimensions` on Web/Mobile contains
focused Definitions, Values and Account Constraints views with an explicit scope
selector where required. Definitions/Values use shared list/forms; Account
Constraints is a relationship editor, not a fake archiveable entity. The final
Account form/detail from package 1B shows the applicable constraints through a typed
composition owned by this package.

**Reuse.** Shared tabs/segmented navigation already used by the clients, shared
list/form/select/state components, account lookup from package 1B. No generic EAV
editor is created.

**Exit.** Definitions/values/policies are typed, source capabilities are truthful,
and Account create/edit/detail can display/edit Required/Optional/Forbidden rules
without copying external masters.

## 9. Package 1F — Exchange Rates

**Scope.** `ExchangeRateType` and historical/versioned `ExchangeRate` series.

**API readiness gate.** Typed rate-type/rate contracts; currency-pair validation;
positive rate; effective/version rules; deterministic paging/filter/sort/search and
server total; RowVersion where updates are supported; type archive blocked by rate
history.

**Screen Contract.** `/finance/ledger-setup/exchange-rates` uses focused Type and
Rate views. Rate forms select active type/from/to currencies and effective dates,
and display version/rate explicitly. Historical rows remain visible according to
the server criteria; the UI never treats a single mutable rate as current truth.

**Reuse.** Shared list/form/date/select/feedback primitives on both clients; Currency
lookup from package 1A.

**Exit.** Historical series can be created/read/updated according to the approved
contract, invalid pairs/rates fail clearly, and list semantics are collection-wide.

## 10. Package 1G — Link Accounts

**Scope.** Direct `AccountMapping` purpose/context/effective mappings. This is the
simple Link Accounts UX over the common account-determination model.

**API readiness gate.** Typed purpose/source/context contract; server capability
catalog for available source types; effective-date validation; deterministic list
criteria; Book/Account lookup; zero fake source masters.

**Screen Contract.** Web/Mobile account-determination workspace exposes a **Link
Accounts** child view with purpose, Book, source type/reference when available,
Account and effective range. Company-purpose default is always available. Source
selectors appear only when the API says their owner Contract exists. Missing
BankAccount/PaymentMethod/Cashbox/ContactGroup/PartyRole masters never render dead
options.

**Reuse.** Shared list/form/select/state/confirmation patterns; Book lookup from
package 1D and Account lookup from package 1B. Use a typed capability-driven form,
not a hard-coded matrix of unavailable source types.

**Exit.** A valid direct company-purpose mapping can be configured and resolved by
the server with truthful source options and exact effective-date behavior.

## 11. Package 1H — Posting Profiles

**Scope.** Effective/versioned `PostingProfile` rules and read-only resolution
preview/diagnostics.

**API readiness gate.** Typed profile/list/mutation contracts; context capability
catalog; priority/specificity/version semantics; deterministic server criteria;
typed `resolve-preview` response for resolved/zero/ambiguous outcomes with matched
candidate evidence.

**Screen Contract.** The account-determination workspace exposes a **Posting
Profiles** child view plus a clearly separated Resolve Preview action/panel. Profile
forms expose Book, purpose, supported context, account, priority/version and
effective dates. Preview accepts only documented inputs and renders resolved,
no-match or ambiguous diagnostics; preview never mutates configuration.

**Reuse.** Shared list/form/select/feedback/dialog primitives; Book/Account lookups
from prior packages. Mobile uses `AppForm`/`AppStateView`; Web uses `MyForm` and
shared feedback. Do not collapse preview into an untyped alert string.

**Exit.** Profiles are fully typed and version/effective aware, and preview proves
deterministic server resolution including zero/ambiguous results.

## 12. Package 1V — Integration & Verification

**Scope.** Cross-package navigation, permissions, cache invalidation, localization,
responsive/accessibility behavior, HR Currency consumers, current Fiscal Years
linkage and final Slice 1 verification. It owns no new financial aggregate.

**Integration contract.** The existing `/finance/ledger-setup` launcher remains the
single user-facing umbrella. Child packages keep their own typed client boundaries
while sharing Accounting navigation, translation scope and design-system primitives.
No child introduces a parallel Finance sidebar, generic setup service, duplicate
currency owner or duplicate period owner.

**Required integrated journeys.** Configure Currency → Book → Company Settings;
configure hierarchy/account → dimensions/account constraints; create FX history;
configure Link Account → Posting Profile → resolution preview; verify HR currency
selectors consume Accounting lookup; exercise View/Manage/read-only permission
subsets; verify RowVersion conflicts, EN/AR + RTL, desktop/compact Web, phone/tablet
Mobile and authoritative retry/error states.

**Verification gate.** Reconcile every Required target from the master plan and all
eight child Screen Contracts against actual runtime. Static typecheck/unit tests are
necessary evidence but do not replace API-backed Screen Contract verification. Any
missing Required screen behavior is a feature regression, not a release note.

**Exit.** Umbrella Phase 06 records `Verified`; only then may Phase 07 customer
education describe the setup journeys and Slice 1 close.

## 13. Package completion checklist

A child package may be marked locally complete only when all applicable items pass:

- [ ] ownership and business rules match `PLAN.md` / `DECISIONS.md`;
- [ ] typed API request/response/lookup/error contracts are frozen and tested;
- [ ] list criteria have truthful server semantics and real totals where paging is shown;
- [ ] lifecycle + RowVersion/dependency rules are implemented and tested;
- [ ] Web Screen Contract is implemented with approved shared reuse;
- [ ] Mobile Screen Contract is implemented with approved shared reuse;
- [ ] View/Manage/read-only behavior is covered;
- [ ] EN/AR, RTL/LTR, accessibility and responsive states are covered;
- [ ] child-owned focused tests pass;
- [ ] integration obligations are handed to package 1V explicitly.

Slice 1 itself remains open until package 1V passes Phase 06.
