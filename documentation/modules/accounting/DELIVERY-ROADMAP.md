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

## Planned delivery order

The first gated execution plan is
[`accounting-core-gl`](../../plans/business/accounting-core-gl/PLAN.md). It treats
the existing Fiscal Years slice as verified current functionality and delivers the
ledger backbone before source-specific subledgers.

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

The historical 00–21 decomposition remains under [phases/](phases/README.md) as
source/traceability material. New runtime work is authorized by capability-scoped
plans under `documentation/plans/business/` after their applicable G0–G4 gates
pass.
