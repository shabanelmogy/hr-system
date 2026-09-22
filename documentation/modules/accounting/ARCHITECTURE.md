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

Platform owns identity, authentication, tenancy, users, companies, memberships,
entitlements and the common authorization plumbing. HR Organizational Structure
currently owns Branch and CostCenter. Accounting consumes those capabilities
through stable Contracts/projections when a financial workflow needs them and must
not create duplicate auth/user/company/branch/cost-center tables, services, or UI.
Accounting owns only financial permissions and authorization policies (for
example posting, approval, close, and report access). If a neutral capability is
missing, extend it at its owning platform/module boundary and expose a Contract;
do not copy it into Accounting. Validate this reuse boundary in Phase 00 before
Phase 01 implementation.

The company Currency master is Accounting-owned from the development baseline.
`InitialAccounting` owns `acc.Currencies`; HR never owns or persists a writable
Currency master and its baseline must not create `hr.Currencies`. The earlier
Geography/Countries design already reserved financial Currency ownership for
Finance/Payroll once that bounded context existed.

HR retains CurrencyCode snapshots and validates new or changed values through the
stable Accounting `IAccountingCurrencyCatalog`. Former HR `IsDefault` and
`ExchangeRateToDefault` semantics are not migrated or backfilled. Functional
Currency is selected later through normal `AccountingCompanySettings` setup with a
valid Primary Book, while historical rates are owned by Accounting FX. There is no
Currency cutover/data-copy path and no duplicate writable master.

Client ownership follows the same boundary. Web and Mobile expose Currency
management only at `/finance/ledger-setup/currencies`; the former HR
`/basic-data/organizational-structure/currencies` route is not retained. Currency
page/read/lookup access uses `AccountingSetup:View`, while create, update, archive,
and restore use `AccountingSetup:Manage`. HR forms that accept a user-selected
`CurrencyCode` consume the Accounting active-currency lookup instead of maintaining
an HR list, free-text master, or client-side default-currency authority.

Ledger Setup masters use an explicit entity completion matrix. Hierarchy levels,
accounts, dimension definitions/values, currencies, books, journal definitions
and exchange-rate types expose archive/restore, RowVersion and archived discovery.
Settings and relationship policies are configuration/upsert identities;
ExchangeRate, AccountMapping and PostingProfile preserve effective/versioned
history. Parent/dependency lifecycle checks and competing child mutations acquire
the same company-scoped atomic resources.

Ledger Setup error text is owned by Accounting through an Application port and
embedded Accounting EN/AR resources. Process-wide localization composition and
the shared legacy JSON resource catalog are host-owned; Accounting never replaces
`IStringLocalizerFactory`. This boundary remains valid when Accounting is moved to
its own service host.

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

## Future commercial-channel boundary

The existing Accounting module is the commercial financial source of truth.
Sales, Procurement, POS, Commerce, Payments, and Fulfillment contexts may
publish approved source facts or request financial decisions through
Contracts/events; they do not write acc tables or share the Accounting
DbContext. Sales owns SalesOrder truth, Procurement owns PO/vendor terms,
Payments owns provider state and webhook reconciliation, and Fulfillment owns
shipment/delivery state; Accounting owns financial posting and settlement truth.

Commerce checkout, customer carts, storefront pricing, stock ledger,
reservation, terminal cash UX, and Job Portal workflow are excluded from
Accounting. The first commercial sequence is Accounting and Inventory in
parallel after contract review, then Sales/Procurement, POS, Commerce, and
Payments/Fulfillment. Coordination uses Outbox/Inbox and idempotent
reconciliation, never a distributed transaction.

No new channel capability is runtime-ready because it appears in this
architecture book. Accounting slices are completed in this existing module
through the feature documentation workflow. Each future Sales, Procurement,
Commerce, Payments, or Fulfillment module requires Phase 00 evidence, the
standard New-ErpModule.ps1 package, owned schema/migrations, and client/test
evidence.
