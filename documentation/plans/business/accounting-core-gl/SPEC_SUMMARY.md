# Accounting Core GL — Pre-Plan Specification

## Product and outcome

بناء أول vertical slice محاسبي تشغيلي بعد Fiscal Years، بحيث يصبح لدى ERPSYSTEM
قلب General Ledger واحد: إعداد → قيد يدوي → مراجعة/اعتماد → ترحيل مرة واحدة →
GL/Trial Balance → عكس/تصحيح → period control.

المستخدمون الأساسيون: Accounting Administrator، Accountant، Approver،
Poster/Controller، Finance Manager، Auditor.

## Scope

### Required

- Core accounting setup without rebuilding Fiscal Years.
- COA hierarchy/lifecycle.
- Dimensions/account-dimension constraints.
- Company-owned COA with company-configurable levels, posting-level policy and account `AllowPosting`.
- Configurable dimensions with typed value sources and line-level authoritative assignments.
- One primary Book per company in V1; Journals/Currencies/numbering.
- Multi-currency transaction model with historical rate series + applied-rate snapshot.
- Link Accounts + Posting Profiles as one purpose-based account-determination model.
- Journal draft/edit/submit/approve/reject/post.
- Central posting engine.
- Reverse/Correct.
- GL + Trial Balance + drill-through.
- Existing Fiscal Years posting/year-generated period state reused as current authority.
- New independent Month Closing/per-period lifecycle is additive Core GL scope after the posting backbone, not a claim about current Fiscal Years APIs.
- Tenant/company isolation, SoD, audit, concurrency, idempotency.
- Web + Mobile journeys using shared components first.

### Deferred

- AP/AR, invoicing, tax/e-invoicing, treasury, expenses, checks, assets,
  deferrals/financing, statement designer, budgets, year-end package,
  legacy cutover and provider payment lifecycle.

### Excluded

- Inventory quantity/cost ownership.
- Sales/POS/Procurement workflow truth.
- Payroll ownership.
- Complex consolidation/elimination.
- Specialized leases/derivatives.
- Offline financial posting.

## Primary journeys

1. Admin configures COA/dimensions/books/journals/posting profiles.
2. Accountant creates balanced draft and submits.
3. Approver approves/rejects.
4. Poster posts atomically/idempotently.
5. Finance user reconciles GL/Trial Balance and drills to journal.
6. Controller reverses/corrects by linked new effect.
7. After the posting backbone exists, finance manager runs the additive Month Closing process; closed/locked period policy then rejects ineligible posting.

## Domain and source of truth

- Accounting owns financial ledger truth.
- Platform owns identity/session/tenant/company actor context; HR Organizational
  Structure owns Branch and CostCenter masters.
- Contacts owns Party master.
- Fiscal Years/Periods already belong to Accounting and are reused; current runtime does not prove an independent per-period close API.
- `JournalEntry` + `JournalLine` is the single accounting source of truth; posted lines are immutable.
- Posting must balance within company/book and an eligible period.
- Posting Profile resolution is deterministic or posting fails.

## Architecture and integrations

- Controller → ISender → Handler → Application port → Infrastructure adapter.
- Existing `AccountingDbContext` / `acc` / migrations.
- Contracts/events only across modules.
- Future sources use an Accounting-owned posting boundary.
- No external system is required to make manual Core GL commit correct.

## Web / Mobile / Design decisions

- Web Required.
- Mobile Required.
- Offline posting Excluded.
- Notifications Deferred for Core GL V1; correctness never depends on notification delivery.
- Prepared UI is design input only.
- Shared/reusable components first; generic extension second; new shared component
  only if no current primitive fits.
- COA maps first to existing Web/Mobile hierarchical tree primitives.
- Empty/loading/error/forbidden/read-only/conflict/unsaved/RTL/accessibility/
  responsive states are Required.

## Slice 1 execution decomposition

`Slice 1 — Ledger setup spine` is executed as focused child packages under the
existing `accounting-ledger-setup` umbrella. The package order and exact Screen
Contracts live in `SLICE-01-LEDGER-SETUP-EXECUTION.md`:

1. `1A` Currency.
2. `1B` COA + Hierarchy Levels.
3. `1C` Dimensions + Account Dimension Policies.
4. `1D` Books + Journal Definitions.
5. `1E` Accounting Company Settings.
6. `1F` Exchange Rates.
7. `1G` Link Accounts.
8. `1H` Posting Profiles + Resolution Preview.
9. `1V` Slice integration and verification.

Each child requires typed API/transport contracts before client completion and a
specific Web/Mobile Screen Contract. For COA, Web must reuse `SplitTreeView` and use
the existing Cost Center tree master/detail composition as the closest interaction
reference without copying HR domain logic. The umbrella generic Ledger Setup
record/renderer is current implementation evidence, not the long-term client
architecture.

## Privacy / security / commercial applicability

- Financial and audit data are sensitive business data and company-scoped.
- Export/logging/backup/retention controls apply.
- No new pricing/subscription/refund/AI/UGC terms.
- Jurisdiction-specific retention/statutory rules remain DEC-007.

## Verified current-state summary

See `EVIDENCE.md`. Proven: Accounting module foundation, `acc` DbContext/schema,
Inbox/Outbox/PartyReference, Fiscal Years API/Web/Mobile/tests, shared client UI.

Target-only: COA, dimensions, books/journals/posting profiles, journal workflow,
posting engine, GL/Trial Balance.

## ASSUMPTIONS

| ID | Assumption | Why needed | Impact if wrong | Validation trigger |
| --- | --- | --- | --- | --- |
| A-001 | Manual journal + GL/TB proves posting backbone | Keeps first slice bounded | Another source may be needed earlier | Core GL acceptance |
| A-002 | Fiscal Years can be extended additively | Avoid duplicate period model | Period integration grows | Posting guard design |
| A-003 | Party is not Required for manual GL | Keeps GL independent of subledgers | Optional source/party link may be needed | Journal contract review |

## OPEN RISKS / UNKNOWNS

| ID / note | Risk or unknown | Impact | Owner | Resolution/reopen trigger |
| --- | --- | --- | --- | --- |
| DEC-007 | Launch jurisdiction/statutory/retention | Country-dependent release | Product + Accounting + Compliance | Before country-dependent launch |
| DEC-008 | Book/functional/reporting currency model | Resolved for Core GL V1 | Product + Architecture | Reopen only for true parallel books/stored reporting ledger |
| DEC-009 | Branch/intercompany balancing | Deferred outside Core GL V1 | Product + Architecture | Reopen when capability becomes Required |
| DEC-010 | SoD/override/reopen policy | Baseline resolved; company/journal policies remain configurable | Product + Security + Finance | Reopen for stricter policy |
| RISK-006 | Opening/migration data quality | Cutover risk | Accounting + Data | When real source selected |
| RISK-007 | Representative scale unmeasured | Performance risk | Accounting + Performance | Before production G4 |

## Readiness to plan

- [x] High-cost ambiguities are explicit.
- [x] Current vs target separated.
- [x] No unknown is silently converted to a rule.
- [x] Design/privacy/commercial applicability reviewed.
- [x] Requester approved plan drafting.
