# Inventory architecture

The module is a bounded context composed through `ErpSystem.Modules.Inventory.InventoryModule`.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: `inv` (one module-owned schema and migrations history table).
- Layers: Contracts, Domain, Application, Infrastructure, Presentation, and
  the bootstrap composition root.
- Integrations: stable identifiers, transport-neutral Contracts, and explicit
  events/handlers at module boundaries.

This file is a generated foundation record. Replace generic statements with
verified symbols as the module grows; do not claim a feature is implemented
until its runtime, API, clients, and tests exist.

Reuse-first is part of the module workflow: search shared BuildingBlocks and
local abstractions before creating a new piece, and keep domain logic local.

## Future channel boundary

The existing Inventory module is the designated current and future source of
truth for operational product/SKU/UOM, warehouse stock, costing, reservation,
and available-to-promise decisions as its documented slices are completed.
Accounting foundation work may proceed in parallel. Commerce, Sales,
Procurement, and Fulfillment are separate future contexts; they request
availability or reservation through reviewed Contracts and do not read the inv
DbContext.

Storefront merchandising, channel assortment, carts, checkout, B2B/B2C price
policy, POS terminal UX, customer accounts, and Job Portal data are excluded
from Inventory. Commerce consumes an explicit product/catalog projection.
Operational product remains Inventory-owned; a separate PIM/Catalog context is
deferred until media/content, variants, or multi-channel localization become
complex enough for an ADR. Future Commerce/Sales/Procurement modules are
created independently after Phase 00 evidence and the standard
New-ErpModule.ps1 package workflow; Inventory itself is completed in place.
