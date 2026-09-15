# Accounting architecture

Accounting is a bounded context composed through
`ErpSystem.Modules.Accounting.AccountingModule`. The host references only that
bootstrap. The module owns its Contracts, Domain, Application, Infrastructure,
Presentation, DbContext, migrations, and lifecycle hooks.

## Financial ownership

Accounting is the system of record for the chart of accounts, journals,
posting, periods, balances, payables, receivables, cash/bank, tax, fixed assets,
and accounting reports once those capabilities are implemented. Source modules
may publish business facts, but they do not write Accounting tables directly.

The fiscal-period policy is an explicit design decision: Accounting owns posting
periods and close/reopen rules; HR may own HR-specific planning or payroll
period metadata, but payroll-to-ledger integration must use a reviewed Contract
or event. Resolve the boundary before implementing either workflow.

## Repository-specific platform reuse

Platform owns identity, authentication, tenancy, users, companies, branches,
and the common authorization plumbing. Accounting
must consume those capabilities through stable Contracts or platform abstractions
and must not create duplicate auth/user/company/branch tables, services, or UI.
Accounting owns only financial permissions and authorization policies (for
example posting, approval, close, and report access). If a neutral capability is
missing, extend it at its owning platform/module boundary and expose a Contract;
do not copy it into Accounting. Validate this reuse boundary in Phase 00 before
Phase 01 implementation.

## Persistence and boundaries

- One module DbContext, `acc` default schema, and `acc.__EFMigrationsHistory`.
- No cross-module EF navigations, foreign keys, shared entity types, or direct
  Infrastructure references.
- Integrations use stable IDs, transport-neutral Contracts, and explicit domain
  events/handlers. Approved upstream business facts are translated into
  Accounting-owned journal effects at the Accounting boundary; this document
  does not preselect future source modules.
- Accounting producers use the module-owned `IAccountingOutbox` application
  contract. The shared `IIntegrationEventOutbox` base is intentionally not
  registered, so composing Accounting with Contacts cannot select an outbox by
  last-registration-wins behavior.
- Accounting consumers use the module-owned `IAccountingInbox` application
  contract. The shared `IIntegrationEventInbox` base is intentionally not
  registered, so adding another inbox-owning module cannot replace Accounting's
  receipt store through an unqualified DI lookup.
- The first verified cross-module slice consumes Contacts party-created/updated
  Contracts through the Accounting inbox and maintains an Accounting-owned
  `PartyReference`. Duplicate delivery is suppressed by the inbox receipt and
  failed consumption can be retried without duplicate projection effects.
  Positive source revisions order updates independently of timestamps; legacy
  revision-zero payloads cannot overwrite a versioned projection. See the
  [API contract](api/README.md) for ordering and migration rules.
- Every posting operation must be auditable, idempotent, balanced, and tied to a
  fiscal period before it can affect the ledger.

## Reuse-first workflow

Before inventing an Accounting component, service, or Contract, inventory the
shared BuildingBlocks and existing Accounting-local abstractions. Reuse or
extend a compatible piece and record the decision in the feature evidence. New
pieces start inside Accounting; promote them to shared only when they are
genuinely domain-neutral and used by multiple modules. Accounting financial
rules never belong in shared code, and shared capabilities must not be
copy/pasted into this module.

## Target capability areas

These are design targets, not current runtime evidence: foundation and company
configuration; chart of accounts; fiscal periods; general ledger and journals;
posting engine; accounts payable; accounts receivable; cash and bank; tax;
fixed assets; approved external-fact integration; period close, reporting, and
audit. Each area requires its own reviewed feature contract and tests before
being marked Required or implemented.
