# Accounting Core GL — Discovery

## 1. Discovery basis

This discovery consolidates the requester-approved direction to start Accounting
with the strongest maintainable pattern and one canonical implementation path,
`ACCOUNTING_MODULE_PHASES_AR.md` as detailed business/domain source material,
verified current repository evidence, and the canonical planning rules under
`documentation/plans/`.

The first implementation target is not the whole Accounting roadmap. It is the
smallest useful backbone that proves posting integrity end to end before AP/AR,
tax, treasury, assets and other subledgers are added.

## 2. Business outcome

Deliver a production-grade Accounting Core GL vertical slice that lets an authorized
finance team configure the core ledger structure, create and approve balanced journal
entries, post them exactly once into the correct company/fiscal period, reverse or
correct posted effects without mutating history, and reconcile the result through
General Ledger and Trial Balance.

## 3. Verified facts

1. Accounting already exists as a bounded context with Contracts, Domain,
   Application, Infrastructure, Presentation, bootstrap, tests,
   `AccountingDbContext`, and the `acc` schema.
2. Fiscal Years/Periods are not greenfield; Domain/Application/API persistence,
   lifecycle, Web, Mobile, permissions, and focused tests already exist.
3. Accounting owns module-local Inbox/Outbox and a local `PartyReference`
   projection fed from Contacts.
4. Platform owns identity, authentication, tenancy, users, companies, branches,
   and shared authorization plumbing.
5. Contacts owns Party master truth.
6. Web and Mobile already have Accounting module boundaries and Fiscal Years client
   surfaces.
7. Shared Web/Mobile libraries already provide form shells, data grids/tables,
   feedback states, dialogs, and hierarchical tree components.

## 4. Requested decisions

- Accounting Core GL is the first major Accounting business slice.
- Posted financial history is immutable; correction uses linked new effects.
- Every posted journal balances within its legal company and posting book.
- Server-side rules are authoritative.
- Account determination is configuration-driven; no source hard-codes GL accounts.
- Concurrency and idempotency are mandatory.
- Tenant/company isolation applies across persistence, API, reports, files and jobs.
- Web and Mobile both receive a usable Core GL experience.
- Offline financial posting is excluded.
- Existing shared/reusable UI components are used first, then generically extended;
  new shared components are created only where no current primitive fits cleanly.
- Every company owns its own COA; hierarchy depth/posting levels are company-configured.
- Dimensions are configurable, line-level accounting attributes with typed external/internal value sources.
- Core GL V1 uses one functional currency and one primary book per company while preserving a book-aware model for later adjustment books.
- Simple Link Accounts and advanced Posting Profiles share one purpose-based account-determination model.
- `JournalEntry` + `JournalLine` is the only financial source of truth; no duplicated posted-ledger table.

## 5. Personas and authority

| Persona | Primary jobs | Authority needed | Critical restriction |
| --- | --- | --- | --- |
| Accounting administrator | Configure COA, dimensions, books/journals, posting profiles | Setup permissions | Cannot bypass posting invariants |
| Accountant | Draft/edit journals, inspect GL | Create/Edit/View | Cannot approve/post unless separately authorized |
| Approver | Review/reject/approve journals | Approve | Separation-of-duties policy applies |
| Poster/controller | Post, reverse/correct | Post/Reverse | Cannot mutate posted history |
| Finance manager | Trial Balance, period readiness, exceptions | View + lifecycle | Reopen/override audited |
| Auditor/read-only | Trace journal → posting → GL evidence | View/Audit | No mutation |

## 6. Primary journeys

1. Setup: configure account hierarchy, dimensions, books, journals, currencies,
   numbering and posting profiles.
2. Manual journal: Draft → validate → submit → approve/reject → post.
3. Correction: create a linked reversal/correction while original history remains.
4. Period control: Core GL first consumes current Fiscal Years/year-generated period
   state; independent Month Closing/per-period transitions are additive work after the
   posting backbone, with later posting rejected according to the new policy.
5. Reconciliation: run GL/Trial Balance and drill to the journal/source.

## 7. Required scope

- Accounting configuration required by Core GL.
- Chart of Accounts hierarchy and lifecycle.
- Dimensions and account/dimension validation.
- Books, journals, currencies/exchange-rate contract and numbering.
- Account Determination / Posting Profiles.
- Manual journal lifecycle and posting preview.
- Central posting engine.
- Reversal/correction.
- General Ledger and Trial Balance.
- Existing Fiscal Years/Periods integration.
- Additive Month Closing/per-period lifecycle after journal posting is operational.
- Company isolation, permissions, SoD, audit, concurrency and idempotency.
- Web and Mobile Core GL journeys.
- Additive Core GL schema migrations.

## 8. Deferred to separate gated plans

- Accounting Party Profile and AP/AR.
- Invoicing and tax/e-invoicing.
- Treasury/banks/payment proposals.
- Expenses/advances/checks.
- Fixed assets.
- Accruals/deferrals/financing.
- Financial statement designer.
- Budgeting/cash forecast.
- Year-end close package and legacy financial cutover.
- External payment-provider state/webhooks.

## 9. Excluded from Core GL

- Inventory quantity/cost ledger.
- Sales/POS/Procurement operational workflow ownership.
- Payroll ownership.
- Complex consolidation/elimination.
- Specialized leases/derivatives.
- Offline financial posting.

## 10. Product/design decisions

- Prepared designs from Google Docs, Figma, screenshots, prototypes, or another
  source are visual/product input, not business truth.
- Chart of Accounts uses existing shared hierarchical tree primitives first.
- Ordinary setup/list screens follow established shared list/form patterns.
- Journal Entry may use domain-specific composition, while shell, fields,
  validation, feedback and table primitives remain shared.
- Loading, empty, error, forbidden/read-only, conflict, unsaved-change, responsive,
  RTL, keyboard/touch and accessibility states are acceptance requirements.

## 11. Privacy / commercial / legal applicability

- Core GL processes company financial data and audit actor identifiers; access,
  logging/redaction, export, backup and retention apply.
- No pricing, subscriptions, refunds, AI output, UGC licensing or consumer terms
  are introduced by Core GL.
- Jurisdiction-specific accounting retention/statutory requirements are not assumed.

## 12. Open decisions

| Note | Decision | Owner | Blocking point |
| --- | --- | --- | --- |
| DEC-007 | Initial Accounting launch jurisdiction/statutory/retention baseline | Product + Accounting + Compliance | Before jurisdiction-dependent production launch |
| DEC-008 | Resolved: one functional currency + primary book V1; historical FX; report-time reporting-currency translation; additional adjustment books deferred | Accounting Product + Architecture | Reopen for true parallel-ledger requirement |
| DEC-009 | Resolved: branch analysis/scope only; branch balancing/intercompany deferred | Accounting Product + Architecture | Reopen when dependent capability is Required |
| DEC-010 | Resolved baseline: configurable approval/SoD/override/reopen policies | Product + Security + Finance | Reopen for stricter policy |

## 13. Planning consequences

- Fiscal Years are VERIFIED CURRENT and will not be rebuilt.
- The module roadmap stays broader than this plan; later capabilities receive
  independent gated plans.
- Core GL defines the canonical posting contract for later financial sources.
- DEC-007 remains an explicit production-launch decision; resolved decisions above are implementation authority for Core GL V1.

## 14. Discovery completion

- [x] Verified facts separated from requested target.
- [x] Scope narrowed to one vertical slice.
- [x] Ownership/source-of-truth boundaries captured.
- [x] Web/Mobile/design applicability reviewed.
- [x] Privacy/commercial/legal applicability reviewed.
- [x] High-cost unresolved decisions have stable owners/IDs.
- [x] Requester approved preparation of the plan.
