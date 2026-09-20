# Accounting Ledger Setup Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `accounting-ledger-setup` |
| Plan / slice | `accounting-core-gl` / `Slice 1 — Ledger setup spine` |
| Canonical plan | `documentation/plans/business/accounting-core-gl/PLAN.md` |
| Operating mode | New vertical slice extending Accounting |
| Review date | 2026-09-20 |
| Review owner | Accounting Product + Architecture + implementation agent |
| Implementation request | `documentation/system/features/accounting-ledger-setup/IMPLEMENTATION-REQUEST.md` |
| Evidence manifest | `documentation/system/features/accounting-ledger-setup/required-files.json` |
| Documentation state | Phase 00 complete — Ready for Coding |
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
| R-10 | Currency ownership cutover removes HR duplicate | Required migration | HR consumer switch | HR consumer switch | Contract frozen |
| R-11 | JournalEntry/posting/GL/TB/Month Close absent in Slice 1 | Excluded now | Excluded now | Excluded now | Scope guard frozen |

## Platform capability decisions

| Capability | Web | Mobile | Decision |
| --- | --- | --- | --- |
| COA hierarchy | Required | Required | shared tree systems |
| Setup lists/forms | Required | Required | online-authoritative |
| Detail/create/edit/archive | Required | Required | permission/RowVersion aware |
| Cards | Deferred | Deferred | no proven setup value yet |
| Bulk | Deferred | Deferred | no bulk financial setup contract |
| Import | Deferred | Excluded | no placeholder |
| Offline write | N/A browser | Excluded | server authority |
| Realtime | Deferred | Deferred | correctness independent |
| Notifications | Deferred | Deferred | no workflow notification in Slice 1 |

## Evidence register

| ID | Classification | Evidence | Finding |
| --- | --- | --- | --- |
| E-01 | VERIFIED CURRENT | `AccountingModule.cs`, six Accounting projects/tests | existing module is canonical owner |
| E-02 | VERIFIED CURRENT | `AccountingDbContext.cs` + initial migration | `acc`, company/tenant filters, RowVersion, Inbox/Outbox/PartyReference/Fiscal Years |
| E-03 | VERIFIED CURRENT | FiscalYear domain/controller/tests | calendar/period authority is implemented; no independent month-close API |
| E-04 | VERIFIED CURRENT | Web Accounting Fiscal Years | current shared Web pattern exists |
| E-05 | VERIFIED CURRENT | Mobile Accounting Fiscal Years | current layered Mobile pattern exists |
| E-06 | VERIFIED CURRENT | HR `Currency.cs` + Organizational Structure UI | Currency master currently lives in HR with ExchangeRateToDefault/IsDefault |
| E-07 | VERIFIED CURRENT | HR Workforce/Recruitment scan | financial facts predominantly persist CurrencyCode, not CurrencyId |
| E-08 | VERIFIED CURRENT | Geography/Countries canonical guides | financial Currency master was reserved for Finance/Payroll ownership |
| E-09 | VERIFIED CURRENT | Contacts Party/events | Party exists; ContactGroup/PartyRole do not |
| E-10 | VERIFIED CURRENT | repository master scan | no BankAccount/PaymentMethod/Cashbox/Safe runtime masters |
| E-11 | VERIFIED CURRENT | shared Web/Mobile component scan | required tree/list/form primitives already exist |
| E-12 | AUTHORIZED TARGET | Core GL plan/decisions | Slice 1 G0–G3 pass; G4 remains production/release only |

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

All create/update forms use typed controls, bilingual text, RowVersion on protected
updates, explicit policies/enums and server field-error mapping. Company/tenant
scope is not editable or sent by clients.

Currency cutover is coordinated: Accounting becomes writable owner, HR selectors
switch to Accounting catalog, then HR Currency management/persistence is removed.

## Permission and lifecycle matrix

| Surface | View | Mutate | Lifecycle |
| --- | --- | --- | --- |
| Accounts | `Accounts:View` | `Accounts:Manage` | archive/restore subject to dependency/history rules |
| Dimensions | `Dimensions:View` | `Dimensions:Manage` | archive/restore |
| Currency/Settings/Books/Journals/FX/Mapping/Profile | authorized Accounting setup read | `AccountingSetup:Manage` | archive/version/effective-date rules by aggregate |

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
| F-01 | High | Currency currently owned by HR conflicts with long-term Finance ownership and Core GL functional-currency needs | D-020: move one master to Accounting in Slice 1 |
| F-02 | High | Plan had functional currency/primary book but no explicit company policy holder | D-021: `AccountingCompanySettings` singleton |
| F-03 | High | Long-term Link Account design names source masters that do not exist | D-022: enable typed source only when real Contract exists; company-purpose default works now |
| F-04 | Medium | Accounting architecture attributed Branch ownership to Platform | corrected to HR Branch/CostCenter ownership |
| F-05 | Medium | Web AGENTS had absolute G0–G4-before-code wording | corrected to bounded slice authorization rule |
| F-06 | Medium | Original scaffold lifecycle implied recipe registration only after runtime | system workflow corrected: Phase 00 contracts/manifest/recipe are registered before coding |

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

Runtime verification is intentionally **not** claimed here. Phase 06 owns that.

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
