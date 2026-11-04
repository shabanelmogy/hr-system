# Accounting Core GL — Discovery

> **Current discovery cycle: reopened 2026-11-04.** Sections 1–14 preserve the
> earlier interview. Section 15 records the current requester instructions and
> supersedes earlier implementation-acceptance/readiness assumptions for this
> cycle. New business choices are proposals until the requester answers them.

## 1. Discovery basis

This discovery consolidates the requester-approved direction to start Accounting
with the strongest maintainable pattern and one canonical implementation path,
`documentation/modules/accounting/SOURCE-PLAN_AR.md` as detailed business/domain source material,
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

## 15. Reopened comparison and simplification review — 2026-11-04

### Verified facts and review baseline

- The existing plan, decisions and child contracts are available for comparison.
- The requester explicitly directs this review to assume **zero accepted
  implementation of the Accounting plan**. This is an acceptance baseline, not a
  claim that historical API/Next/Mobile source does not exist.
- The requester has not moved Accounting into Angular; Angular is the target Web
  client. Historical Next screens do not satisfy an Angular delivery gate.
- No runtime behavior or live database has been verified in this review cycle.

### Requested decisions

- Review the existing plan against official Odoo Accounting/setup documentation.
- Evaluate changes for business fit, simpler use, implementation and maintenance.
- Odoo supplies comparison ideas; matching Odoo is not a product requirement.
- Initial Accounting release jurisdiction: **Egypt**, explicitly selected by the
  requester on 2026-11-04. In a later clarification the requester selected
  **Egypt and Saudi Arabia for the initial design**. Egypt remains the last
  explicitly selected first launch; simultaneous Saudi launch is not assumed.
- The first release targets a **general system for multiple activities** and
  includes **B2B invoices and B2C sales with Accounting**. The requester further
  explicitly requires **electronic invoices and electronic receipts**. These
  Egyptian integrations cannot remain deferred beyond the first operational
  release. Exact sector/document/tax/report coverage remains DEC-032.
- Use the project's discovery interview and Superpowers brainstorming approach:
  inspect the existing choices, explain alternatives/trade-offs, ask focused
  questions, then record the requester's choices.
- Use the existing canonical files: discovery answers here, external research in
  `RESEARCH.md`, selected rules in `DECISIONS.md`, and the revised master plan
  after the discovery/specification is mature. Do not create a parallel plan tree.

### First review topic — fiscal localization (order corrected 2026-11-04)

The requester identified fiscal localization as the prerequisite to the COA
discussion. Official Odoo sources confirm that dependency. Begin by resolving
DEC-007's initial jurisdictions and the impact on core account/setup contracts.
The country-selection part is resolved as **Egypt for first launch**, with
**Egypt and Saudi Arabia for initial design**. DEC-007 remains open for the
applicable requirements and verification. Electronic invoice/receipt inclusion
is resolved for the Egyptian launch; detailed coverage, country rollout and
delivery decomposition remain open. Country selection alone does not settle them.
Identify country-specific chart constraints/templates, tax/report/document
requirements and retention implications without assuming any country from the
conversation language. Decide release scope for each capability separately.

The prior plan treated DEC-007 as release-only; that classification is not valid
for country-dependent design choices in this reopened review. Completing this
discovery topic does not imply that all localization runtime must be built first.
Country-pack boundaries and implementation order remain planning decisions.

### Fiscal-localization research and issuance discussion — 2026-11-04

The detailed source comparison, observed code gaps, architecture alternatives,
package/version lifecycle and proposed acceptance scenarios are in
[`FISCAL_LOCALIZATION_REVIEW.md`](FISCAL_LOCALIZATION_REVIEW.md).

Confirmed requester answers:

| Question | Answer | Consequence |
| --- | --- | --- |
| Initial business activities | General system for multiple activities | Design common capabilities and define supported sector cases explicitly; no assumption of every sector's compliance |
| First operational accounting scope | B2B invoicing and B2C sales with Accounting | Historical manual-GL-only release scope must be revised; a GL foundation may remain an earlier build slice |
| Electronic channels | Explicitly include electronic invoices and electronic receipts | Egyptian eInvoice and eReceipt are Required for first operational release |
| Saudi direction | Initial design should cover Egypt and Saudi Arabia; requester identified ZATCA as Saudi | Country policies/adapters are first-class; Saudi simultaneous launch remains unspecified |
| ERP screen versus POS/offline | Requester asked which is best; no option approved | Recommend online ERP invoicing first and a POS UI over the same services when needed; offline issuance remains a separate unapproved decision |
| Company and fiscal-country boundary | Requester selected the first option as more suitable and asked what Odoo uses | Initial scope uses one primary fiscal country per legal company, with separate Company records for actual independent Egyptian/Saudi entities. Cross-country registrations within one legal entity are Deferred until a concrete case reopens D-034/DEC-034 |

The company-boundary comparison was verified against official Odoo 19 Companies,
Multi-company, Accounting and Fiscal Localizations documentation. It supports
company-specific country packages and parent-inherited branch localization.
Odoo also supports optional account sharing; our independent-chart direction is
a local selection consistent with D-010, not an assertion that Odoo forbids sharing.
This settles the initial country/company boundary only. Fiscal-site mapping,
registered devices, signing and master-data contracts remain open under DEC-034.

Proposals awaiting discussion include a shared GL/tax capability with distinct
country adapters, effective fiscal profiles, optional editable starter charts,
frozen document facts/rules and separate commercial/fiscal/posting states.
Do not attribute these proposals to the requester. Existing D-006 online-only
financial posting is not silently replaced by an offline sales assumption.

Material remaining questions are centrally tracked: DEC-032 (coverage and
rollout), DEC-033 (issue/post/delivery/correction/outage semantics) and DEC-034
(fiscal sites, authoritative masters, devices and signing topology). DEC-007
continues to own applicable statutory rules, versions and retention evidence.

### Open decisions — COA discussion queued after localization

| Note | Review question | Previous plan | Proposal for discussion | Owner / resolution trigger |
| --- | --- | --- | --- | --- |
| DEC-029 | Is separately configured account-level metadata necessary? | Company level master, level posting policy and account posting flag | Consider deriving depth from parent/child relationships and using explicit group/posting-account behavior; retain level configuration if named levels or level-wide rules are needed | ERP owner + Accounting; answer before freezing the COA model |
| DEC-030 | What account-code experience best fits accountants? | Editable server-proposed, non-hierarchical `ACC-####` | Consider familiar user-editable financial codes; decide whether codes express hierarchy and how proposals work before specifying automation | ERP owner + Accounting; answer before freezing COA code generation/validation |
| DEC-031 | How does a new company start its chart? | Independent company chart; template initialization allowed in principle, delivery not specified | Consider an optional editable starter template with a blank-chart option; no statutory/localization claim without DEC-007 | ERP owner + Accounting; answer before freezing company chart onboarding |

These are review proposals, not newly approved business rules. Central records
and blocking points are in `documentation/plans/notes/DECISION_BACKLOG.md`.
DEC-007 remains open and is the current first discussion topic. DEC-029/030/031
remain unanswered until the localization design impact is understood.

### Planning consequences

- Current state is discovery/Draft; former G0–G3 results are historical and must
  be re-evaluated for the revised scope and Angular client.
- No active roadmap marker, historical contract or generated packet authorizes
  runtime work during this review.
- Record each comparison as: current plan → official reference → alternatives →
  use/maintenance impact → requester decision. A difference from Odoo alone is
  not a defect.
- Review one coherent topic at a time, starting with fiscal localization and
  target-jurisdiction requirements, then company setup and Chart of Accounts.
  Later topics include currencies/FX, books/journals,
  dimensions, account determination, journals/posting, reports and period control.
- Reuse shared Angular controls and the established Reactive Forms approach when
  screen contracts are prepared; business review does not authorize a form-system
  migration or new shared-control implementation.

### Glossary for this discussion

| Term | Meaning in this review | Owner's wording / caution |
| --- | --- | --- |
| Fiscal localization | Country-dependent accounting/fiscal setup and requirements; scope may include charts, taxes, reports and certifications | التوطين المالي/المحاسبي; separate from UI translation and Fiscal Years |
| Chart of Accounts | Company-owned organization of financial accounts | دليل الحسابات / شجرة الحسابات |
| Hierarchy level | Depth in the account tree; whether it also needs separately configured names/rules is DEC-029 | مستوى الحساب |
| Group account | A hierarchy node used for aggregation; its posting policy must be explicit | حساب تجميعي |
| Posting account | An eligible account that can receive journal lines | حساب يقبل الترحيل |
| Journal definition | Configuration that groups and numbers entries | اليومية; distinct from القيد المحاسبي |
| Zero implementation baseline | No part is accepted as delivered for the restarted plan review | Does not erase or deny historical source |

### Current completion

- [x] Requester's review purpose and Angular/zero-acceptance baseline captured.
- [x] Official Odoo 19.0 comparison sources registered in `RESEARCH.md`.
- [x] Initial release country selected: Egypt.
- [x] Initial design expanded to Egypt and Saudi Arabia by requester.
- [x] Initial company fiscal-country boundary selected (D-034).
- [x] Multiple activities, B2B/B2C and electronic invoice/receipt inclusion captured.
- [ ] Initial jurisdictions and localization design impact reviewed (DEC-007).
- [ ] Subsequent COA decision batch answered (DEC-029/030/031).
- [ ] Remaining business topics reviewed and agreed.
- [ ] Revised `SPEC_SUMMARY.md` reviewed before master-plan changes.
- [ ] Revised scope/contracts pass their applicable readiness gates.
