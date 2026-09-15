# Accounting delivery roadmap

Use the shared status vocabulary: **Foundation**, **Required**, **Planned**,
**Deferred**, and **Excluded**. A status describes an evidence-backed decision;
it does not create a route or entity by itself.

## Foundation (verified)

- Canonical six-project module shape and deterministic host composition.
- `acc` schema ownership, context registration, schema bootstrap, and empty
  initial migration.
- No business feature, API endpoint, web route, or mobile surface yet.

## Planned delivery order

1. **Foundation and configuration:** company/book settings, currencies,
   dimensions, numbering, Accounting-specific permissions, and the fiscal-period
   ownership decision. Reuse existing Platform identity, tenancy, company, and
   branch capabilities; do not create duplicate auth or master-data services.
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

The detailed dependency-ordered plan and acceptance gates are maintained in
[phases/](phases/README.md), including country policy, reconciliation, posting
immutability/idempotency, web/mobile, audit/close, and go-live gates.
