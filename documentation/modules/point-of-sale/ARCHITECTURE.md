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