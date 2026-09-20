# PointOfSale architecture

The module is a bounded context composed through `ErpSystem.Modules.PointOfSale.PointOfSaleModule`.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: `pos` (one module-owned schema and migrations history table).
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

PointOfSale owns the terminal and retail transaction context when its business
slices are implemented: cash sessions, tills, receipts, returns, operator/
branch workflow, and POS sale facts. Inventory owns stock truth and Accounting
owns financial posting; POS coordinates with them through Contracts and durable
events. A POS sale does not become a Commerce cart or SalesOrder without an
explicit contract.

Commerce carts, storefront catalog, B2B account pricing, customer portal,
payment gateway ownership, and Job Portal capabilities are excluded from POS.
An online order may be accepted later through a reviewed Commerce/Sales
contract, but it must not create a direct POS-to-Commerce table dependency or
a distributed transaction. Future channel work starts with Phase 00 evidence
and an independent New-ErpModule.ps1 package where required; POS business
slices are completed in this existing module.
