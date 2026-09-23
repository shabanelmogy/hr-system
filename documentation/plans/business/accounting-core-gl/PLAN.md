# Accounting Core GL — Master Build Plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | accounting-core-gl |
| Business capability | Accounting Core General Ledger |
| Owning module | Accounting |
| Status | Slice 1 execution-ready — later slices/release remain gated |
| Target milestone | Accounting Core V1 |
| Primary owner | Accounting Product + Accounting Engineering |
| Reference feature(s) | Existing Accounting Fiscal Years + current Web/Mobile shared component systems |
| Related plans | `accounting-delivery`, future AP/AR/Tax/Treasury/Assets/Reporting plans |
| Last reviewed | 2026-09-22 |

### Planning evidence

- Discovery: `DISCOVERY.md`
- Current-system evidence: `EVIDENCE.md`
- Approved pre-plan specification: `SPEC_SUMMARY.md`
- Decision log: `DECISIONS.md`
- Research notes: `RESEARCH.md`
- Slice 1 execution decomposition: `SLICE-01-LEDGER-SETUP-EXECUTION.md`

Current behavior is proved only by `EVIDENCE.md`. This plan defines target behavior.

## 1. Executive outcome

### Business problem

ERPSYSTEM has an Accounting module foundation and Fiscal Years slice, but it does
not yet have one canonical GL backbone that future financial sources can trust for
account selection, approval, posting, immutability, reconciliation and period
control. Building AP/AR, tax, treasury or assets before this backbone would invite
duplicated posting rules and inconsistent ledger truth.

### Desired outcome

An authorized finance team can configure the core ledger structure, create a manual
journal, validate and submit it, approve/reject it, post it exactly once, inspect the
immutable GL/Trial Balance effect, reverse/correct/void by linked effects, and later
run an additive Month Closing process that controls independent period posting.

Future Accounting capabilities must reuse the same posting contract.

### Success measures

| Measure | Current | Target | Evidence |
| --- | --- | --- | --- |
| Canonical posting path | Not implemented | One Accounting-owned posting engine | Architecture + handler/integration tests |
| Balanced posting | No GL posting engine | Every posted journal balances per company/book | Domain + SQL tests |
| Duplicate posting | No GL posting engine | Same idempotency identity cannot create a second effect | Concurrency/idempotency tests |
| Posted-history mutation | No GL posting engine | Posted journal lines cannot be edited/deleted | Domain/API tests |
| Period enforcement | Fiscal Years exist; independent period close API not proven | Posting consumes current year/period authority first; additive Month Close later blocks ineligible periods | Posting/Fiscal Year + Month Close integration tests |
| Reconciliation | No GL/TB | Trial Balance reconciles to posted lines | Integration/query tests |
| Client coverage | Fiscal Years only | Required Core GL journeys on Web and Mobile | Client tests + E2E/manual evidence |
| Performance | Representative target not measured | Measured budgets before production approval | RISK-007 closure evidence |

## 2. Scope

### Required now

- Accounting setup required by Core GL.
- Chart of Accounts hierarchy/lifecycle.
- Dimensions and account/dimension constraints.
- One primary posting book per company in Core GL V1; schema/contract remains book-aware.
- Journals and numbering.
- One functional currency per company; multi-currency transactions with historical rate series and applied-rate snapshot.
- Optional reporting currency preference translated at report time; no duplicated reporting amount per journal line in V1.
- Account Determination / simple Link Accounts / advanced Posting Profiles.
- Manual Journal Entry lifecycle.
- Posting preview/validation.
- Approval/rejection and server-side SoD.
- Atomic/idempotent posting.
- Reverse/correct/void linked effects.
- General Ledger and Trial Balance.
- Drill-through to journal/source.
- Fiscal Year/year-generated period guard using current slice.
- Additive Month Closing/per-period lifecycle after the posting backbone is operational.
- Audit/history, tenant/company isolation, RowVersion/concurrency.
- Web and Mobile client journeys.

### Deferred

| Capability | Reason | Owner | Reopen trigger |
| --- | --- | --- | --- |
| AP/AR and Accounting Party Profile | Separate source lifecycle; prove GL first | Accounting | Core GL exit gate passes |
| Tax/e-invoicing | Country/provider lifecycle not needed to prove GL | Accounting + Compliance | Jurisdiction/tax plan Required |
| Treasury/banks/payment proposals | Separate settlement lifecycle | Accounting | Treasury plan approved |
| Expenses/advances/checks | Separate documents/subledgers | Accounting | Owning plan approved |
| Fixed assets | Separate asset/depreciation lifecycle | Accounting | Asset plan approved |
| Accruals/deferrals/financing | Schedule-owned recognition logic | Accounting | Owning plan approved |
| Formal statements/designer | Product scope exceeds GL verification | Accounting/Reporting | Reporting plan approved |
| Budgeting/cash forecast | Planning truth separate from actual ledger | Accounting | Budget plan approved |
| Year-end close package | Depends on broader accounting scope | Accounting | Close plan approved |
| Additional IFRS/Tax/Management adjustment books | Core GL V1 proves one primary book first | Accounting | Parallel/adjustment book requirement approved |
| Branch-balanced/intercompany auto-balancing | No V1 business requirement; branch is analysis/scope only | Accounting | Interbranch/intercompany plan approved |
| Payment-provider state/webhooks | Payments bounded-context responsibility | Payments | Payments contract approved |

### Excluded

| Capability | Reason |
| --- | --- |
| Offline financial posting | Server-authoritative period/concurrency/idempotency required |
| Inventory quantity/cost ledger | Inventory ownership |
| Sales/POS/Procurement workflow truth | Owning modules publish approved facts later |
| Payroll truth | Separate HR/Payroll ownership |
| Complex consolidation/elimination | Dedicated future scope |
| Specialized leases/derivatives | Dedicated future scope |

## 3. Ownership and existing-system relationship

Accounting is the single owner of financial ledger truth: accounts, books, journals,
posting configuration, posted effects, GL and Trial Balance.

| Existing concept/system | Relationship | Source of truth | Reuse/change/remove | Evidence |
| --- | --- | --- | --- | --- |
| Tenant/company/user/session | Scope/actor input | Platform | Reuse only | E-010 |
| Branch | Optional authorization/analysis context | HR | Reuse ID/Contract only when a real HR Contract exists | E-010 |
| Fiscal Years/Periods | Current year lifecycle/year-generated period authority | Accounting | Reuse only in Slice 1; additive Month Close explicitly later | E-005/E-018 |
| Contacts Party | Not Required for manual GL | Contacts | Preserve projection boundary | E-003/E-010 |
| Accounting DbContext/schema | Persistence boundary | Accounting | Extend current `acc` context | E-002 |
| Inbox/Outbox | Async reliability boundary | Accounting | Reuse | E-003 |
| Web/Mobile shared UI | Client design system | owning clients | Reuse/extend first | E-006..E-009 |

### Cross-module dependencies

| From | To | Contract/mechanism | Why ownership is not duplicated |
| --- | --- | --- | --- |
| Accounting | Platform | current actor/tenant/company/branch abstractions | Platform remains scope/master owner |
| Accounting | Contacts | existing Party contracts/projection only when needed | Contacts remains Party master |
| Future source modules | Accounting | Accounting-owned posting request/event Contract | Sources publish facts; Accounting owns ledger effect |

## 4. Personas, roles, tenant/company scope

| Persona/role | Goals | Allowed scope | Critical restrictions |
| --- | --- | --- | --- |
| Accounting Administrator | COA/dimensions/books/journals/posting profiles | Tenant + company | No bypass of posting invariants |
| Accountant | Create/edit/submit drafts | Company | Approval/posting requires separate authority |
| Approver | Review/approve/reject | Company | DEC-010 SoD |
| Poster/Controller | Post/reverse/correct | Company | No edit of posted history |
| Finance Manager | GL/TB and period readiness | Company/permitted books | Reopen/override audited |
| Auditor | Read journal/ledger/audit evidence | Authorized company | Read-only |

Every server operation re-evaluates current tenant/company and permission state.

## 5. Domain model

| Concept | Type | Owner | Identifier/business key | Notes |
| --- | --- | --- | --- | --- |
| Account | Aggregate | Accounting | stable ID + company-scoped code | Company-owned hierarchy; level policy + AllowPosting; archive after use |
| AccountHierarchyLevel | Entity/config | Accounting | company + level number | Name + CanPost; depth configured per company |
| DimensionDefinition | Aggregate | Accounting | company + code | Configurable analysis axis with typed value source |
| DimensionValue | Entity/reference | Accounting | definition + code/reference | Accounting-owned value or typed reference to owning module |
| Currency | Aggregate/reference | Accounting | company + ISO code | Accounting-owned from the clean development baseline; identity/metadata only, not a single mutable FX truth |
| AccountingCompanySettings | Company singleton | Accounting | tenant + company | FunctionalCurrencyId + PrimaryBookId + RowVersion; one row per company |
| Book | Aggregate | Accounting | company + code | Exactly one primary book in V1; additional adjustment books Deferred |
| Journal | Aggregate | Accounting | company/book + code | Category/numbering policy |
| ExchangeRateType | Aggregate/config | Accounting | scope + code | Built-in behavior + configurable business series |
| ExchangeRate | Aggregate | Accounting | rate type + pair + effective/version | Historical/versioned rate series |
| AccountMapping | Aggregate/config | Accounting | company/book/purpose/reference/effective range | Typed direct Link Account mapping |
| PostingProfile | Aggregate | Accounting | purpose/context + effective range/version | Conditional deterministic account resolution |
| ApprovalPolicy | Aggregate/config | Accounting | company + code/version | None/Single/MultiLevel + flexible rules; used from Slice 2 |
| JournalEntry | Aggregate | Accounting | company + ID + final journal number | Owns workflow/posting state |
| JournalLine | Child entity | Accounting | entry + sequence | Sole financial line truth; immutable after post |
| PostingReceipt | Idempotency/trace | Accounting | operation + key | Prevents duplicate effect |
| PeriodCloseRun | Aggregate/audit | Accounting | period + run number | New additive Month Closing evidence; Slice 3 |
| FiscalYear/FiscalPeriod | Existing aggregate | Accounting | current IDs | Reused |

### Invariants

1. Posted journal balances within the same company and posting book.
2. Only accounts with `AllowPosting=true`, on a company level whose policy permits posting, and with no children receive journal posting.
3. Required dimensions are present and allowed.
4. Posting resolves exactly one eligible Fiscal Period.
5. Current year/period eligibility blocks invalid posting; after additive Month Close exists, SoftClosed/Closed/Locked policy is enforced before state change.
6. Posted journal lines are immutable and never hard-deleted.
7. Reverse/correct/posted-void create new linked journal effects; the original is unchanged.
8. Same posting identity + same payload recognizes existing result; same identity +
   changed payload conflicts.
9. Posting profile resolution has exactly one deterministic effective winner.
10. Applied rate/rule/version metadata is sufficient to reproduce the posting; reporting-currency translation is not stored per line in V1.
11. Tenant/company authority never comes from untrusted client payload.
12. Journal transition + immutable posted-line state + receipt + mandatory audit commit atomically.
13. A Bank maps to GL through its concrete BankAccount, never one AccountId on the Bank master itself.
14. Contact account determination uses PartyRole + ContactGroup + Purpose, with optional specific-party override; Contacts remains master owner.
15. Source modules never send GL AccountIds; they send typed accounting purposes/components, debit/credit effects and accounting context.

## 6. Lifecycle / state machine

### Journal Entry

Workflow state and posting state are separate. `Posted` means the same persisted
`JournalLine` rows became immutable accounting truth; posting does not copy them to a
second ledger table.

| Current state | Action | Next state | Actor | Preconditions | Side effects |
| --- | --- | --- | --- | --- | --- |
| Draft | Edit | Draft | Accountant | Current RowVersion | Audit update |
| Draft | Submit | Submitted | Accountant | Balanced preview + valid dependencies | Freeze review version |
| Submitted | Return for revision | Draft | Approver | Policy authority | Reason + history retained |
| Submitted | Reject | Rejected | Approver | Policy authority | Reason + audit |
| Submitted | Approve | Approved | Approver | Frozen approval-policy version + unchanged review version | Approval evidence |
| Rejected | Revise | Draft | Accountant | Current RowVersion | History retained |
| Draft/Submitted/Approved/Rejected | Void | Voided | Authorized actor | Not posted | Reason + audit; no financial effect |
| Approved | Post | Posted | Poster | Eligible period + valid profiles + idempotency | Atomic ledger + receipt + audit |
| Posted | Reverse | Posted | Controller | Valid reversal period/reason | Linked reversal effect |
| Posted | Correct | Posted | Controller | Valid correction policy | Linked reversal + corrected effect |
| Posted | Void | Posted + void marker | Authorized controller | Posted-void policy + valid reversal period + reason | Exact linked reversal + void audit; original remains posted history |

Posted is terminal for the original effect.

Approval is configurable per Journal: `None`, `SingleApproval`, or `MultiLevel`.
Self-approval defaults to `Blocked`, with optional `Allowed` or
`AllowedWithOverride`; override requires separate authority, reason and audit.
Approve and Post are separate permissions. Multi-level rules are versioned and frozen
for an approval instance at Submit so later policy edits do not rewrite history.

### Period control target

Current Fiscal Years/year-generated period state is consumed as-is by the initial
posting guard. Independent Month Closing is a new additive Slice 3 capability with
`Open`, `SoftClosed`, `Closed`, and `Locked` policy semantics, audited close/reopen
runs, configurable blocking/warning readiness checks, and separately authorized
late-post/reopen actions. It does not rebuild the existing Fiscal Years slice.

### Account

| Current state | Action | Next state | Preconditions |
| --- | --- | --- | --- |
| Active | Update | Active | No historical reinterpretation |
| Active | Archive | Archived | Historical references preserved |
| Archived | Restore | Active | Code/path/parent validity |

## 7. Business rules matrix

| Rule ID | Action/scenario | Preconditions | Rule/validation | Failure | Side effects |
| --- | --- | --- | --- | --- | --- |
| GL-001 | Post | Approved journal | Debits = credits per company/book | Validation/409 | None |
| GL-002 | Post line | Active account | Summary account cannot receive posting | Validation | None |
| GL-003 | Post | Accounting date | Resolve one eligible Fiscal Period | Period error | None |
| GL-004 | Post | Period status | Closed/locked/ineligible blocks | Conflict | None |
| GL-005 | Retry post | Existing receipt | Same key+payload returns existing; mismatch conflicts | 409 mismatch | No duplicate |
| GL-006 | Concurrent post | Same journal | One winner; stale writer fails | 409 | Single effect |
| GL-007 | Approve/post | Current content | Material edit invalidates prior approval | Transition conflict | Audit |
| GL-008 | Resolve account | Posting context | One effective highest-priority rule | Block with diagnostic | None |
| GL-009 | Reverse | Posted effect | Opposite linked effect; original unchanged | Validation/period error | New posting |
| GL-010 | Correct | Posted effect | Preserve original + reversal + corrected effect | Validation/period error | New postings |
| GL-011 | Dimensions | Account/context | Required/allowed combinations pass | Validation | None |
| GL-012 | Currency | Foreign transaction | Store transaction + functional values + rate metadata | Validation | Snapshot |
| GL-013 | Scope | Every operation | Trusted company owns all referenced financial data | 403/404 | Security audit where required |
| GL-014 | GL/TB | Report query | Posted-only default; drafts separately labelled | No silent draft inclusion | Deterministic result |
| GL-015 | Account archive | Used account | Preserve historical references | Hard delete rejected | Audit |
| GL-016 | Journal numbering | Number allocation | No duplicate/reuse under concurrency | Conflict/retry in transaction | Number evidence |
| GL-017 | Account hierarchy | Create/update account | Level allows posting; `AllowPosting` account has no children | Validation | None |
| GL-018 | Manual control account posting | Manual journal | Allowed/Restricted/Blocked policy satisfied | Validation/403 | None |
| GL-019 | Account determination | Link/profile resolution | Most-specific applicable rule, then priority, has one winner | Missing/ambiguous diagnostic | None |
| GL-020 | Bank mapping | Resolve BANK purpose | Concrete BankAccount belongs to company and linked GL account currency policy is compatible | Validation | None |
| GL-021 | Contact mapping | Resolve party purpose | Specific party override → ContactGroup+Role+Purpose → role/company default | Missing/ambiguous diagnostic | None |
| GL-022 | Source posting contract | Future source request | Typed purpose/components + debit/credit/context; no GL AccountId accepted | Contract validation | None |
| GL-023 | Posted void | Posted journal | Exact reversal of original accounts/dimensions/currencies; original unchanged | Validation/period error | New linked journal + audit |
| GL-024 | Propose Account code | Current company | Suggest the next company-wide non-hierarchical `ACC-####` suffix across active + archived reserved codes; suggestion remains user-editable and is never hierarchy authority | Duplicate create may conflict under concurrency | No reservation; refetch proposal after conflict |

## 8. Edge cases and validation

| Category | Decision |
| --- | --- |
| Duplicate/idempotency | Same key/same payload = same result; same key/different payload = conflict |
| Concurrency/RowVersion | Setup/draft edits use RowVersion; posting adds atomic/idempotent guard |
| Stale data | Refetch/revalidate stale account/profile/dimension/period; material edit invalidates approval |
| Partial failure | No partial ledger/receipt/journal-state commit |
| Invalid lifecycle | Server rejects with stable problem code |
| Missing/archived dependency | Blocks new post; historical reads remain |
| Tenant/company mismatch | Fail closed; never rewrite scope from payload |
| Permission changes | Re-evaluate at command execution |
| Date/time | Accounting date drives period; audit timestamps remain platform time |
| Currency/rounding | Historical/versioned rate series resolves the rate; applied rate + functional amount are snapshotted; reporting currency translates at report time |
| Large dataset | Server paging/aggregate queries only |
| Import duplicate/atomicity | Import Deferred |
| External outage | N/A for manual Core GL commit |
| Mobile offline/conflicts | Financial mutation online-only; reconcile after ambiguous response |
| Audit/history | All sensitive lifecycle actions audited |
| Sensitive data | No secret/full sensitive payload logging; export obeys same ACL |

## 9. Permissions and security

Target action separation:

| Permission | Access mode | Action/data controlled | Server enforcement |
| --- | --- | --- | --- |
| Accounts:View | Company | COA read | Query/controller |
| Accounts:Manage | Company | Account mutations | Command/controller |
| Dimensions:View | Company | Dimension read | Query/controller |
| Dimensions:Manage | Company | Dimension mutations | Command/controller |
| AccountingSetup:Manage | Company | Books/journals/currencies/profiles | Command/controller |
| Journals:View | Company | Journal read | Query/controller |
| Journals:Create | Company | Draft create/edit/submit | Command/controller |
| Journals:Approve | Company | Approve/reject | Command + DEC-010 |
| Journals:Post | Company | Post | Command + DEC-010 |
| Journals:Reverse | Company | Reverse/correct | Command |
| Journals:Void | Company | Void pre/post posting under policy | Command + reason/audit |
| Periods:Close | Company | Month close/soft-close/close/lock | Slice 3 command |
| Periods:Reopen | Company | Exceptional reopen/late-post authority | Slice 3 command + reason/audit |
| Ledger:View | Company | GL/TB | Query/controller |

DEC-010 baseline is approved; company/journal policy may tighten it but cannot bypass
server invariants or audit requirements.

## 10. Persistence and migration

| Store/entity | Schema/owner | Key constraints/indexes | Tenant/company filter | Delete/archive rule |
| --- | --- | --- | --- | --- |
| Accounts | `acc` | unique company+code; parent/type/level indexes | Required | Archive after use |
| AccountHierarchyLevels | `acc` | unique company+level; posting-level policy | Required | Controlled config |
| DimensionDefinitions/Values | `acc` | unique company+code; typed value-source/reference indexes | Required | Archive |
| Currencies | `acc` | unique company+ISO code; Accounting-owned from the development baseline | Required | Archive when unused; canonical company Currency master |
| AccountingCompanySettings | `acc` | unique tenant+company singleton; FunctionalCurrencyId + PrimaryBookId; RowVersion | Required | Update only; no hard delete |
| Books | `acc` | unique company+code; exactly one primary in V1 | Required | Archive when safe |
| Journals | `acc` | unique company/book+code | Required | Archive |
| ExchangeRateTypes/Rates | `acc` | rate type + currency pair + effective/version uniqueness | Required | Version/end-date; used historical versions retained |
| AccountMappings | `acc` | company/book/purpose/reference/effective uniqueness | Required | Version/end-date |
| PostingProfiles | `acc` | purpose/context/effective/version/specificity/priority indexes | Required | Version/end-date |
| ApprovalPolicies | `acc` | company+code+version/effective indexes | Required | Versioned; Slice 2 |
| JournalEntries | `acc` | company+journal+number; workflow/posting/date; RowVersion | Required | Pre-post void/cancel only; never delete posted |
| JournalLines | `acc` | entry+sequence; account indexes; separate line-dimension indexes | Through parent | Sole financial truth; immutable after post |
| PostingReceipts | `acc` | unique company+operation+idempotency key + fingerprint | Required | Retain by policy |
| PeriodCloseRuns | `acc` | period+run; status/date/policy-version | Required | Append audit history; Slice 3 |

Persistence/baseline strategy:

1. Real Accounting EF migrations.
2. No Fiscal Years/Periods recreation.
3. Rebaseline development persistence so `InitialAccounting` owns `acc.Currencies` from the first Accounting migration and `InitialHr` never creates `hr.Currencies`. There is no Currency cutover/data-copy migration and no demo-data preservation requirement.
4. `IsDefault` and `ExchangeRateToDefault` are not retained, migrated, or backfilled. Accounting owns Functional Currency through `AccountingCompanySettings` and historical FX through `ExchangeRateType` + `ExchangeRate` only.
5. Seed only explicitly approved technical defaults; never invent statutory COA.
6. `FunctionalCurrencyId` is established through normal Accounting setup together with a valid `PrimaryBookId`; it is not inferred or backfilled from former HR Currency state.
7. Opening balances/legacy migration handled by separate cutover plan.

Posting transaction owns journal transition, freezing the same journal lines as
posted truth, receipt and mandatory audit in one unit/commit boundary. GL/TB read
directly from posted journal lines. Optional period/account balance tables are
rebuildable read projections, never a second source of financial truth.

## 11. API / CQRS / contracts

These are target contracts, not current endpoint claims. Controllers dispatch
through `ISender`; handlers use narrow Application ports.

| Operation | Type | Target route/message | Permission | Error/concurrency contract |
| --- | --- | --- | --- | --- |
| Account list/tree/detail | Query | `GET /api/v1/accounts...` | Accounts:View | scoped criteria/errors |
| Account mutations | Command | accounts family | Accounts:Manage | duplicate/stale/in-use 409 |
| Dimensions | CQRS | accounting-dimensions family | Dimensions:* | duplicate/stale 409 |
| Books/Journals setup | CQRS | accounting-books/journals | AccountingSetup:Manage | duplicate/stale 409 |
| Exchange-rate types/rates | CQRS | accounting-exchange-rates | AccountingSetup:Manage | duplicate/effective-version 409 |
| Link Accounts | CQRS | account-mappings | AccountingSetup:Manage | typed reference/currency/missing-reference errors |
| Profile resolution preview | Query | posting-profiles/resolve-preview | AccountingSetup:Manage | zero/ambiguous diagnostic |
| Journal page/detail | Query | journal-entries | Journals:View | scoped 404/403 |
| Journal create/update | Command | journal-entries | Journals:Create | RowVersion 409 |
| Submit/approve/reject | Command | journal lifecycle | Create/Approve | lifecycle/SoD/stale |
| Posting preview | Query/validation | journal posting-preview | Journals:View/Create | no state change |
| Post | Command | journal post | Journals:Post | stale/key/period/profile 409 |
| Reverse/correct/void | Command | journal reverse/correct/void | Journals:Reverse / Journals:Void | period/idempotency/policy errors |
| General Ledger | Query | general-ledger | Ledger:View | bounded/server-paged |
| Trial Balance | Query | trial-balance | Ledger:View | deterministic aggregate |

Core GL introduces no mandatory new external producer. The future stable posting
boundary is nevertheless frozen now: source modules send typed accounting
purpose/components, debit/credit effects and accounting context; they never send GL
AccountIds. Source modules own business calculations; Accounting owns account
resolution, journal construction and ledger truth.

## 12. Web experience

Prepared UI/design references: none supplied yet. Any later Google/Figma/image/
prototype reference is design input only.

| Capability | Required/Deferred/Excluded | Notes |
| --- | --- | --- |
| COA Tree | Required | Hierarchy/search/detail/actions |
| List/Grid | Required | Setup/journals/GL |
| Cards | Deferred | Only if a concrete workflow benefits |
| Detail | Required | Account/journal/posting evidence |
| Create/Edit | Required | Setup + draft journal where lifecycle permits |
| Search/Filter/Sort | Required | Server-owned for large sets |
| Pagination | Required | Journal/GL |
| Bulk actions | Deferred | No bulk posting V1 |
| Import | Deferred | Separate atomicity/duplicate contract |
| Export/Report | Required | GL/TB same authorized dataset |
| Realtime | Deferred | Correctness never depends on realtime |
| Notifications | Deferred | Workflow correctness never depends on notification delivery |

### Shared/reusable component mapping

| UI need | Existing shared component | Decision |
| --- | --- | --- |
| COA hierarchy | `SplitTreeView` / `HierarchicalTreeList` | Reuse; generic extension only if needed |
| Page actions | `PageHeader` | Reuse |
| Lists/ledger | `MyDataGrid` | Reuse |
| Forms | `MyForm` + shared form shell/fields | Reuse |
| Confirmation | shared confirmation dialog | Reuse |
| Loading/empty/error | shared feedback/loaders | Reuse |
| Journal lines | shared form/grid primitives | Feature-local composition first; promote only if genuinely generic |

## 13. Mobile experience

| Capability | Required/Deferred/Excluded | Notes |
| --- | --- | --- |
| COA tree | Required | Touch-friendly hierarchy |
| Setup lists/forms | Required | Native responsive layout |
| Journal draft/edit | Required | Online-authoritative |
| Approval/posting | Required | DEC-010/read-only guards |
| GL/TB | Required | Server-paged/aggregate |
| Offline financial mutation | Excluded | No local success synthesis |
| Cached read | Deferred | Requires approved offline-read policy |
| Import | Excluded V1 | Not first mobile slice |

If connectivity is lost after mutation submission, reconcile authoritative state
before offering another financial mutation.

### Mobile shared/reusable component mapping

| UI need | Existing shared component | Decision |
| --- | --- | --- |
| COA hierarchy | `AppHierarchicalTree` | Reuse/extend generically |
| Lists | `AppListScreen` + `AppDataTable` | Reuse |
| Forms | `AppForm` + sections/tabs/stepper/controls | Reuse |
| Page shell | `AppPageHeader` | Reuse |
| States | `AppStateView` | Reuse |
| Confirmations | `ConfirmationDialog` | Reuse |
| Journal lines | shared primitives | Domain composition unless generic reuse is proven |

## 14. 5-point structured-data parity audit

| Audit point | Web | Mobile | Decision |
| --- | --- | --- | --- |
| Creation | Required | Required | Dedicated controls; no JSON entry |
| Editing | Required | Required | Preserve child lines + RowVersion |
| Viewing | Required | Required | Read-only detail + lifecycle/audit |
| Listing & Filtering | Required | Required | Server criteria/status/account filters |
| Mock/Test Data Generator | Required in development where project pattern applies | Same | Balanced draft only; never auto-persist |

## 15. Reporting / import / export / files

- GL and Trial Balance are Required.
- Export uses the same server-authorized dataset/criteria.
- Formal statements/designer Deferred.
- Journal import Deferred.
- Attachments not Required for manual Core GL V1.
- Notifications Deferred for Core GL V1.

## 16. Integrations and side effects

| Integration | Direction | Trigger | Contract | Failure/recovery |
| --- | --- | --- | --- | --- |
| Platform auth/scope | Platform → Accounting context | Every request | Existing actor/scope/permissions | Fail closed |
| HR Currency consumers | Accounting → HR | Currency lookup/validation | Stable Accounting `IAccountingCurrencyCatalog`; HR persists business CurrencyCode snapshots only | Fail closed for new invalid/inactive code; snapshots remain readable without HR Currency persistence |
| HR organizational references | HR → Accounting | Only when an enabled dimension/source requires Branch/CostCenter | Stable HR Contract/projection; never HR DbContext/FK | Unavailable source type is not selectable; existing mapping remains diagnosable |
| Fiscal year/current period state | Accounting internal | Posting | Existing Fiscal Years/year-generated periods | Slice 1 reuses current authority; fail invalid posting |
| Month Closing | Accounting internal | Slice 3 close/reopen | New additive PeriodClose policy/run contract | Audited blocking/warning checks; no Fiscal Years rebuild |
| Contacts projection | Contacts → Accounting | Existing party events | Current inbox/projection | Not required for manual GL |
| Future source posting | Source → Accounting | Approved fact | Future stable posting Contract | Inbox/outbox/idempotency |

## 17. Non-functional requirements

### Performance and scale

- Server paging/aggregation for large data.
- Trial Balance never loads all ledger rows into a client.
- Indexed company/book/period/account/profile access paths.
- Numeric posting/query budgets must be measured before production G4 (RISK-007).

### Reliability

- Posting/reversal/correction atomic.
- Idempotency survives response loss/retry.
- Restart cannot produce partial ledger state.
- No background job is required to make the financial commit correct.

### Observability

- Structured logs with journal/posting/company IDs; no sensitive payload dumps.
- Metrics: posting success/failure/conflict latency, profile-resolution failure,
  period-block rejection, GL/TB latency.
- Existing correlation/trace infrastructure.
- Production dashboards/alerts follow PROD-024.

### Localization/accessibility/security

- Arabic/English + RTL.
- Keyboard-complete Web editing and screen-reader semantics.
- Touch/phone/tablet behavior on Mobile.
- Shared form validation/focus/error behavior.
- Server authority for scope/permission/lifecycle.

### Privacy and data handling

- Financial/audit data company-scoped.
- Logs redact secrets/unnecessary sensitive descriptions.
- Export requires same authorization as query.
- Retention/deletion follows DEC-007; no unsupported deletion promise.
- Backup/restore evidence follows PROD-023.

### Commercial/legal applicability

No new pricing/subscription/refund/AI/UGC terms. Existing tenant/module entitlement
remains Platform-owned. Jurisdiction-specific financial obligations remain DEC-007.

## 18. Test and verification matrix

| Requirement | Domain | Application | Integration | API | Web | Mobile | E2E/manual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Balanced posting | Unit | Handler | SQL transaction | error contract | preview | preview | balanced/unbalanced |
| Current period guard | policy | handler | Accounting DB | 409 | blocked state | blocked state | current Fiscal Year/period ineligible then post |
| Month Closing | policy | orchestration | close-run/readiness persistence | typed close/reopen errors | close checklist | close checklist | soft-close/close/lock/reopen in Slice 3 |
| Idempotency | fingerprint | handler | SQL duplicate/concurrency | same/mismatch | reconcile retry | reconcile retry | response-loss retry |
| Concurrent post | invariant | transaction orchestration | SQL concurrency | one success/conflict | refresh conflict | refresh conflict | parallel requests |
| Approval invalidation | lifecycle | handler | DB | transition error | action/refetch | same | edit-after-approval |
| Profile resolution | resolver | handler | effective-date DB tests | diagnostic | preview | preview | zero/two rules |
| Reverse/correct/void | lifecycle | handler | linked journal effects | typed contract | flow | flow | original unchanged |
| Link Accounts | mapping policy | handler | typed reference/effective mapping | diagnostics | setup/coverage | setup/coverage | BankAccount + ContactGroup fixtures |
| Dimensions | validation | handler | constraints | field errors | line/form errors | same | invalid combination |
| Company isolation | policy | store | SQL scope | 403/404 | server denial | server denial | cross-company |
| GL/TB reconcile | calculations | query | SQL fixture | typed totals | grid/export | table/export | numeric fixture |
| UI reuse | N/A | N/A | N/A | N/A | architecture/component tests | architecture/component tests | visual parity |

## 19. Rollout and migration plan

1. DEC-008/DEC-009/DEC-010 are resolved for Core GL V1; do not reopen them silently.
2. Keep branch-balanced/intercompany behavior out until a separate requirement reopens DEC-009.
3. Rebaseline development migrations so Accounting owns Currency from `InitialAccounting`, HR never creates a Currency table, current Fiscal Years remain intact, and Slice 1 adds no independent period-close behavior.
4. Deploy API schema/contracts before consuming clients.
5. Do not seed statutory COA; only approved technical defaults.
6. Use production migration/backup gates PROD-016/PROD-023.
7. Production smoke:
   - create setup/account;
   - create/submit/approve/post balanced journal;
   - verify GL/TB;
   - retry same posting and prove no duplicate;
   - use current Fiscal Year/period state to prove an ineligible posting is rejected;
   - in Slice 3, run Month Close and prove SoftClosed/Closed/Locked policy;
   - reverse/correct/void and prove original unchanged;
   - prove cross-company denial.
8. Observe posting and GL/TB metrics via PROD-024.
9. After real financial postings begin, prefer forward-fix; database restore alone
   must not be used to erase acknowledged external/financial reality.

## 20. Risks

| Risk | Likelihood | Impact | Mitigation | Owner | Trigger |
| --- | --- | --- | --- | --- | --- |
| RISK-006 Opening/migration data quality | Medium | High | Separate cutover plan + reconciled trial migrations | Accounting + Data | Real source selected |
| RISK-007 Unknown production scale | Medium | High | Representative posting/GL/TB benchmark before G4 | Accounting + Performance | Production approval |
| Incorrect book/currency implementation drift | Medium | High | Enforce resolved DEC-008 contract; no stored reporting ledger/additional books in V1 | Product + Architecture | Slice 1 |
| Weak SoD policy implementation | Medium | High | Enforce resolved DEC-010 baseline + server tests | Product + Security + Finance | Slice 2 |
| Branch/intercompany scope creep | Medium | High | DEC-009 is Deferred; require separate plan before adding balancing behavior | Product + Architecture | Requirement enters scope |
| Fiscal Years scope regression | Medium | High | Slice 1 consumes current lifecycle only; Month Closing is explicit additive Slice 3 work | Accounting Architecture | Any period-lifecycle change |
| Shared UI duplication | Medium | Medium | Mandatory reuse mapping/review | Web/Mobile | Before new primitive |

### Assumptions

| Assumption | Impact if wrong | Validation trigger | Owner |
| --- | --- | --- | --- |
| Manual journal proves posting backbone | Another source may be needed sooner | Core GL acceptance | Accounting Product |
| Current Fiscal Years/year-generated period state is sufficient for Slice 1 setup and initial posting-guard integration | Period lifecycle work must remain in Slice 3 | Posting guard design | Accounting Architecture |
| Party not Required for manual GL | Optional source/party link may be needed | Journal contract review | Accounting Product |

## 21. Decision log

See `DECISIONS.md`. DEC-008/009/010 are resolved. DEC-007 remains open only for a
jurisdiction-dependent production launch and does not block Slice 1 execution.

## 22. Open questions

| Question | Owner | Blocking? | Due | Resolution |
| --- | --- | --- | --- | --- |
| DEC-007 jurisdiction/retention | Product + Finance + Compliance | Country-dependent release | Before such launch | Open |
| DEC-008 book/currency model | Product + Architecture | No | Reopen only for parallel/stored-reporting requirement | Resolved |
| DEC-009 branch/intercompany | Product + Architecture | No; capability Deferred | Before enabling | Resolved/Deferred |
| DEC-010 SoD/override/reopen | Product + Security + Finance | No for baseline | Reopen only for stricter policy | Resolved |
| Representative scale | Accounting + Performance | Yes for production G4 | Before Slice 4 exit | RISK-007 |

## 23. Implementation phases

### Feature Decomposition Gate

Slice 1 contains materially different setup workflows, so it is explicitly
`Decompose`. Each child has its own Screen/Workflow Contract and independent
acceptance boundary. `accounting-ledger-setup` remains the integration/history
umbrella and does not replace these child contracts.

| Slice | Decision | Feature ID | Screen/Workflow Contract | Boundary / independent acceptance |
| --- | --- | --- | --- | --- |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-currency` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-currency.md` | Accounting-owned Currency master, lifecycle and active catalog/consumer lookup are independently verified |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-coa-hierarchy` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-coa-hierarchy.md` | Hierarchy Levels + Account tree/detail/lifecycle + proposed editable code are independently verified |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-dimensions` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-dimensions.md` | Dimension definitions/values and account-dimension policy workflow are independently verified |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-books-journals` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-books-journals.md` | Book and Journal definition/numbering setup are independently verified without JournalEntry runtime |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-company-settings` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-company-settings.md` | Functional Currency + Primary Book singleton configuration is independently verified |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-exchange-rates` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-exchange-rates.md` | Exchange Rate Types + historical/versioned rate series are independently verified |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-link-accounts` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-link-accounts.md` | Direct typed/effective purpose mappings with truthful source capabilities are independently verified |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-posting-profiles` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-posting-profiles.md` | Posting Profile lifecycle + deterministic resolve-preview diagnostics are independently verified |
| Slice 1 — Ledger setup spine | Decompose | `ledger-setup-integration-verification` | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-integration-verification.md` | Cross-child navigation/permissions/i18n/client integration and umbrella Phase 06 verification are independently reconciled |

**Slice 1 decomposition contract gate: Closed — reviewed 2026-09-22.** All nine
child Screen/Workflow Contracts exist under this plan's `decomposition/` folder and
execution is authorized only in dependency order: Currency → COA/Hierarchy →
Dimensions → Books/Journals → Company Settings → Exchange Rates → Link Accounts →
Posting Profiles → Integration/Verification. Existing umbrella runtime is evidence
to reconcile; it does not count as completion of a child package by itself.

Implementation is vertical across API/Web/Mobile/tests.

| Phase | Goal | Dependencies | Deliverables | Entry gate | Exit gate |
| --- | --- | --- | --- | --- | --- |
| Slice 0 — Gate freeze | Resolve required decisions and freeze contracts | This plan | DEC resolutions + feature docs | Plan drafted | **Complete 2026-09-20 for Slice 1 authority** |
| Slice 1 — Ledger setup spine | Company-owned COA + configurable levels/dimensions + primary book/journal/currency/rates + Link Accounts/profiles | Current Fiscal Years; resolved DEC-008/009/010 | Domain/persistence/API + Web/Mobile setup + migrations/tests | **Domain/API and clean Accounting baseline implemented and verified 2026-09-22; clients/Phase 06 remain** | One valid posting context configured end to end; no journal posting yet |
| Slice 2 — Journal & posting | Draft→submit→approve/reject→post + preview/idempotency/SoD | Slice 1, DEC-010 | Posting engine + clients + SQL tests | Posting context | Balanced journal posts exactly once |
| Slice 3 — Ledger verification + Month Close | GL/TB + drill-through + reverse/correct/void + additive independent period close | Slice 2 | Queries/views/corrections + Month Closing/readiness/reopen integration | Posted fixture | Journal↔GL↔TB reconciles; Month Close blocks correctly; history preserved |
| Slice 4 — Hardening & release | Performance/observability/migration/recovery/smoke | 1–3 | Scale evidence + release gates | Workload agreed | G0–G4 green for release scope |

Later subledger plans start only after Slice 3 proves the backbone.

### Slice 1 child execution packages

Slice 1 remains one business slice and one `accounting-ledger-setup` umbrella for
integration/history evidence, but implementation is decomposed into focused child
packages. The canonical package contracts, Screen Contracts, dependency gates and
exit criteria are defined in `SLICE-01-LEDGER-SETUP-EXECUTION.md`.

The default execution order is:

`1A Currency → 1B COA/Hierarchy → 1C Dimensions → 1D Books/Journals →
1E Company Settings → 1F Exchange Rates → 1G Link Accounts → 1H Posting Profiles
→ 1V Integration/Verification`.

Work one child at a time by default. Each child owns typed transport/API contracts
and a specific Web/Mobile Screen Contract. The current generic Ledger Setup client
record/renderer is implementation evidence to refactor, not the target architecture.
Slice 1 closes only when `1V` reconciles all child contracts and Phase 06 records
`Verified`.

### Post-implementation verification and customer education

| Slice | Customer Education Pack | Closure rule |
| --- | --- | --- |
| Slice 0 — Gate freeze | N/A — planning only | Planning evidence complete |
| Slice 1 — Ledger setup spine | Required | Phase 06 must record `Verified`, then Phase 07 publishes the verified setup/training/video guide before Slice 1 is `Closed` |
| Slice 2 — Journal & posting | Required | Phase 06 `Verified` → Phase 07 customer guide/video material → `Closed` |
| Slice 3 — Ledger verification + Month Close | Required | Phase 06 `Verified` → Phase 07 customer guide/video material → `Closed` |
| Slice 4 — Hardening & release | N/A unless customer-visible behavior changes | Release evidence/G4 plus any education update required by a customer-visible change |

## 24. Acceptance criteria

- [x] Business outcome and first slice explicit.
- [x] Discovery/evidence/spec exist.
- [x] Current vs target separated; Fiscal Years not re-planned; Month Closing explicitly additive later work.
- [x] Assumptions have triggers.
- [x] Ownership/source of truth explicit.
- [x] Lifecycle/invariants/rules/edge cases defined.
- [x] Security/company scope server-authoritative.
- [x] Target persistence/API/integration design explicit.
- [x] Web/Mobile R/D/E + reusable-component mappings explicit.
- [x] Slice 1 child execution packages, dependency order and Screen Contract gates explicit.
- [x] Test matrix and rollout/recovery defined.
- [x] Privacy/commercial/legal applicability reviewed.
- [x] DEC-008 resolved for Book/Currency V1 schema.
- [x] DEC-009 branch balancing/intercompany explicitly Deferred.
- [x] DEC-010 baseline resolved before approval/posting implementation.
- [ ] DEC-007 resolved before jurisdiction-dependent production launch.
- [ ] RISK-007 closed before production G4.

### G0–G4 status

| Gate | Status | Reason |
| --- | --- | --- |
| Preflight | PASS for plan drafting | Discovery/evidence/spec and approval exist |
| G0 Scope & ownership | PASS | R/D/E explicit; branch/intercompany Deferred; Fiscal Years vs additive Month Close boundary frozen |
| G1 Business readiness | PASS for Slice 1 | COA/dimensions/book/currency/link-account rules are approved; Slice 2 workflow policy baseline is also resolved |
| G2 Architecture readiness | PASS for Slice 1 | One Accounting-owned Currency master, company settings for functional currency/primary book, historical FX, single JournalLine truth and account-determination contracts are frozen; period-close schema is not part of Slice 1 |
| G3 Product/client readiness | PASS for Slice 1 | Web/Mobile/states/reuse mapping explicit; notifications/import/realtime classified Deferred |
| G4 Delivery readiness | BLOCKED | Production scale and jurisdiction-dependent release decision remain |

The overall release plan is not production-ready while G4 remains blocked, but Slice 1
is explicitly authorized for implementation. Later slices must satisfy their own entry
conditions; Slice 3 must gate the new Month Closing/per-period lifecycle before work.

### Phase 00 implementation-preflight revalidation — 2026-09-20

Phase 00 source inspection found that Currency had previously been modeled inside
HR Organizational Structure, confirmed that HR financial facts persist CurrencyCode
rather than CurrencyId relationships, and confirmed that several long-term Link
Account source masters do not yet exist. Because the repository is still development
only with no customer data to preserve, D-020 is implemented as a clean baseline:
Accounting owns Currency from `InitialAccounting`, `InitialHr` never owns/persists a
writable Currency master, and HR validates CurrencyCode snapshots through the
Accounting Contract. Functional Currency/Primary Book live in
`AccountingCompanySettings` and are established through normal Accounting setup;
typed source mappings become available only with real owner Contracts.

After these corrections, G0–G3 remain **PASS for Slice 1**. The findings do not
expand Slice 1 into JournalEntry/posting/GL/Month Close and do not create a second
Currency owner. G4 remains blocked only by production scale/jurisdiction release
evidence.

## 25. Handoff

Continue Slice 1 through the child packages in
`SLICE-01-LEDGER-SETUP-EXECUTION.md`, one child at a time by default. Extend the
existing Accounting module/Fiscal Years slice; do not create parallel services,
schemas, ownership or UI primitives. Preserve the umbrella
`accounting-ledger-setup` package for integration/history evidence and final Phase 06
reconciliation. Preserve one central posting engine, immutable history, idempotency,
company isolation, SoD and period authority.

Execution must use the plan-aware feature workflow: Phase 00 Implementation
Preflight → Phases 01–05 implementation → Phase 06 Verification & Acceptance.
Customer-facing education for Slice 1 starts only after Phase 06 records
`Verified`; Phase 07 then completes the Customer Education Pack and closure.

### Canonical documents to update during implementation

- `documentation/modules/accounting/ARCHITECTURE.md`
- `documentation/modules/accounting/DELIVERY-ROADMAP.md`
- Accounting API implementation profile(s)
- feature-scoped request/review evidence under `documentation/system/features/`
- Web/Mobile Accounting feature profiles
- required-file manifests/recipe registrations/generated packets
- ADR only for a material new architecture decision

## 26. Central note references

| Note ID | Type | Reason |
| --- | --- | --- |
| DEC-007 | Decision | Jurisdiction/statutory/retention |
| DEC-008 | Decision | Book/currency model |
| DEC-009 | Decision | Branch/intercompany balancing |
| DEC-010 | Decision | SoD/override/reopen |
| RISK-006 | Risk | Migration data quality |
| RISK-007 | Risk | Production scale not measured |
| PROD-016 | Production | Release-controlled DB migrations |
| PROD-023 | Production | Backup/restore/RPO/RTO |
| PROD-024 | Production | Observability/dashboard/alerts |
