# ADR-008: Digital Channels, Job Portal, and Commerce Boundaries

**Status:** Accepted as a planning decision
**Date:** 2026-09-19

## Context

The product is expected to grow from an ERP operating system into a SaaS platform
with a public Job Portal and B2B/B2C commerce experiences on web and mobile.
The current repository already has bounded modules for Platform, HR, Contacts,
Accounting, Inventory, PointOfSale, CRM, and Reporting. Adding public channels
inside those modules would duplicate ownership, expose private data, and make a
future service split harder.

The repository is still in development. This ADR records ownership and sequence
only; it does not create a runtime module, route, table, migration, screen, or
placeholder implementation.

## Decision

1. HR remains the current and future source of truth for Candidate profile/link,
   EmploymentApplication, requisition/job posting/opening, interview, offer,
   and hire lifecycle, in addition to employee and organization data. A future
   JobPortal module owns only public vacancy projection/search/index, tenant-
   branded channel content, saved jobs/alerts/preferences, draft application
   UX, and public/employer BFF workflow/read models. On submit it calls an HR
   Contract idempotently; it never becomes the application source of truth or
   reads HR Infrastructure/tables. Platform owns the external auth principal.
   Tenant/company resolution comes from approved publication and host/channel,
   never manual visitor selection.
2. A future Commerce module owns storefront merchandising, channel assortment,
   offers/promotions, carts, checkout session/orchestration, and customer-facing
   order projections. Sales owns quotations, customer contract/terms, final
   price validation, SalesOrder, and commercial order lifecycle. Commerce sends
   an idempotent order request to Sales and does not own SalesOrder truth.
   Commerce does not own stock, GL, POS cash sessions, payment provider state,
   or the canonical party record.
3. Accounting is the financial posting and settlement source of truth.
   Inventory owns operational product/SKU/UOM, warehouses, stock ledger,
   costing, reservation, and ATP. The existing modules are commercial
   foundations; their business slices are completed inside those modules using
   feature documentation workflow, not by creating duplicate modules. They may
   progress in parallel after contract review and integrate through Contracts
   and durable events, never cross-DbContext writes or a distributed
   transaction.
4. Sales and Procurement are future independent contexts after the Accounting
   and Inventory foundations. Sales owns quotations, customer terms, price
   validation, and SalesOrder; Procurement owns RFQ, PO, ASN handoff, and vendor
   terms. POS owns retail/cash transactions and may publish sale facts through
   Contracts; it does not become Commerce. Payments owns provider intents,
   authorization/capture/refund, webhook Inbox, signature/replay protection,
   and payment reconciliation. Fulfillment owns shipments, carriers, delivery,
   and return logistics. Accounting remains financial posting/settlement truth.
5. B2B and B2C are policies and channel experiences of Commerce initially.
   They share a commercial order request where possible, but account, pricing,
   approval, payment, and delivery rules remain explicit. A later split
   requires evidence of scale, ownership, or materially different invariants.
6. Each future module is created atomically with the standard
   Contracts/Domain/Application/Infrastructure/Presentation/Bootstrap projects,
   Tests, and an owned schema/migrations boundary using New-ErpModule.ps1. This
   applies only to new future modules; existing Accounting and Inventory are
   completed in place. Phase 00 feature evidence and a reuse inventory are
   required before runtime work.
7. Web and mobile are deployable channel surfaces, not owners of business rules.
   Public browsing, candidate access, customer accounts, and administrative
   operations use separate authorization and tenant/company/channel policies.
8. Integration facts that must survive process failure use transactional
   Outbox/Inbox, stable identity, revisions or ordering, idempotency, retry,
   dead-letter, and reconciliation. Events are not permission to bypass module
   ownership.
9. Inventory owns operational product/SKU/UOM truth. A separate PIM/Catalog
   context is deferred until media/content, variants, or multi-channel
   localization become materially complex; that decision requires its own ADR.
   Commerce consumes catalog projections and does not become product truth.
10. API surfaces are explicit: authenticated backoffice (tenant/company RBAC),
    public browse (approved host/channel and abuse limits), candidate/customer
    authenticated (external principal, consent, and account scope),
    partner/webhook (API key/OAuth or provider signature, replay protection),
    and internal module integration (trusted context plus tenant/company
    dimensions). Mutations require idempotency where retry is possible;
    webhook Inbox receipts, provider signatures, rate limits, PII minimization,
    audit, and correlation are mandatory. Secrets never ship to clients and
    shared BuildingBlocks contain plumbing only, never business rules.
11. Offline is capability-specific. Browse/search/catalog/job listings may use
    bounded cache/read; application drafts and carts may be local drafts.
    Application submit, offer accept, checkout, payment, final order, and
    financial posting require online confirmation, idempotent retry, and
    reconciliation. POS/warehouse offline requires a separately reviewed
    conflict policy.

## Initial sequence

1. Complete Accounting in the existing module: chart of accounts, fiscal
   periods, double-entry posting, tax, AR/AP, and idempotent source facts.
2. Complete Inventory in the existing module: product/SKU, UOM, warehouses,
   stock ledger, costing, reservation, ATP, and concurrency.
3. Sales and Procurement as independent modules after those foundations.
4. POS business and retail operations, then Commerce core and channels.
5. Payments and Fulfillment after Sales/Commerce order contracts.
6. JobPortal as an independent stream after public Recruitment contracts and
   privacy/consent; it runs independently and does not wait for Accounting or
   Inventory unless paid services are added.

## Consequences

- Existing modules keep narrow ownership and do not absorb storefront, public
  job portal, supplier portal, or checkout capabilities.
- Commerce, Sales, Procurement, and Payments can be extracted later because
  their channel, commercial, procurement, and provider state is separated from
  Inventory, POS, Accounting, and Contacts.
- JobPortal can be deployed independently when public traffic, search, privacy,
  or moderation requirements justify it.
- The monolith can compose these modules while they are developed, but no
  module may access another module's DbContext or schema.
- Offline is policy-specific: bounded cache/drafts are allowed, while JobPortal
  submission, offer accept, Commerce checkout, payment, final order, and
  financial posting remain online-confirmed unless a later decision supplies
  conflict and reconciliation rules.
- A roadmap item is not runtime evidence. Implementation requires the module
  package, contracts, tests, migrations, client surfaces, and verification.

## Rejected alternatives

- Adding Job Portal screens and public entities directly to HR.
- Adding carts, orders, pricing, or checkout directly to Inventory or POS.
- Treating Contacts as a storefront or candidate identity service.
- Sharing a database schema or using a distributed transaction to coordinate
  commercial modules.
- Building all web/mobile channels as one undifferentiated client before their
  authorization and deployment boundaries are explicit.

## Reopening triggers

Revisit this ADR only when a customer contract, legal requirement, measured
traffic/latency, data volume, compliance boundary, or repeated operational
failure demonstrates that the current ownership or sequence no longer fits.
