# Accounting delivery roadmap

Use the shared status vocabulary: **Foundation**, **Required**, **Planned**,
**Deferred**, and **Excluded**. A status describes an evidence-backed decision;
it does not create a route or entity by itself.

## Foundation (verified)

- Canonical six-project module shape and deterministic host composition.
- `acc` schema ownership, context registration, and module migration boundary.
- Fiscal Years is an implemented Accounting vertical slice with Domain/Application
  rules, versioned API/CQRS, Web `/finance/ledger-setup/fiscal-years`, Mobile Fiscal Years
  feature ownership, and focused tests. It is runtime evidence for that slice
  only; it does not imply the remaining Accounting roadmap is implemented.
- Accounting Currency has typed API/Web/Mobile ownership and historical closure
  evidence; it remains queued for the current v2 live revalidation after Fiscal
  Years closes.
- COA & Hierarchy has typed API/Web/Mobile source through client Phase 03; live
  database, integrated verification and documentation closure remain pending.
- The rest of Ledger Setup has broad Domain/API source and reachable generic client
  compatibility screens. Those screens are not completion evidence; the v2 plan
  requires typed children and approved P-001/P-005/P-006 patterns before closure.

## Planned delivery order

The first gated execution plan is
[`accounting-core-gl`](../../plans/business/accounting-core-gl/PLAN.md). It treats
the existing Fiscal Years implementation as current source evidence while its
roadmap performs live revalidation, and delivers the ledger backbone before
source-specific subledgers. The single active feature marker in the Slice 1
execution decomposition is the only current work authority.

Each active feature remains open until the implementation agent sends its completed
detailed scenario from
`documentation/plans/business/accounting-core-gl/MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`,
the user runs or supervises the Web and actual-device journey, and explicitly
accepts the result. The current scenario is Fiscal Years Step 01; Currency remains
queued until that acceptance and documentation closure are recorded.

1. **Foundation and configuration beyond the existing Fiscal Years slice:**
   company/book settings, currencies, dimensions, numbering, and
   Accounting-specific permissions. Reuse existing Platform identity, tenancy,
   company, and branch capabilities; do not create duplicate auth or master-data
   services.
2. **Chart of accounts:** account hierarchy, account types, dimensions, and
   effective-dated changes.
3. **General ledger:** journal drafts, validation, balanced posting, reversals,
   idempotency, audit trail, and period controls.
4. **Subledgers:** AP, AR, cash/bank, tax, and fixed assets with explicit
   reconciliation to the GL.
5. **Integrations:** consume only explicitly approved upstream business facts
   through Contracts or events; no direct table coupling and no assumed future
   module list.
6. **Close and reporting:** close/reopen workflow, trial balance, statements,
   audit exports, and operational observability.

Each step is a vertical slice through domain, application, persistence,
presentation, applicable clients, migration, authorization, and tests. Mark a
step Deferred with its reason and trigger; mark Excluded only with a domain
rationale. Before implementation, complete a reuse inventory of shared
BuildingBlocks and Accounting-local pieces and record what is reused, extended,
or intentionally kept module-local.

For every named master, vertical completion also requires distinct `NameAr` and
`NameEn` persistence/transport and Web/Mobile create, edit, view, list/search and
valid mock-draft evidence. UI translation is a separate requirement. Singleton,
historical and mapping records that have no authored name use localized names from
their referenced masters rather than adding fake bilingual columns.

The historical 00–21 decomposition remains under [phases/](phases/README.md) as
source/traceability material. New runtime work is authorized by capability-scoped
plans under `documentation/plans/business/` after their applicable G0–G4 gates
pass.
