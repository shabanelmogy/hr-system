# ReferenceData module

This package is the documentation ownership boundary for the **ReferenceData**
module. It summarizes the current module and points to the feature-specific
books that remain authoritative for contracts, platform parity, and evidence.
Shared ERP rules stay in `documentation/system/` and are linked rather than
copied here.

## Current status

- Lifecycle: active, default modular-monolith module, version `1.0.0`.
- Runtime: six production projects plus a module-owned test project, composed by
  `ErpSystem.Modules.ReferenceData.ReferenceDataModule`.
- Persistence: `ReferenceDataDbContext`, the module-owned `ref` schema, a
  module-specific migrations history table, and an idempotent Egypt geography
  seed after migration.
- Capability boundaries: `geography` is global Platform reference data;
  `addresses` is the tenant-entitlement submodule granted to new tenants.
- Applied cross-platform features: Countries, States, Districts, and Address
  Types have API, Next.js, Expo, tests, and canonical evidence.
- Applied API foundation: Address has company-scoped CQRS and persistence, while
  owner-link commands and standalone Web/Mobile Address experiences remain
  deferred under the canonical Address books and central notes.

The module is therefore **not scaffold-only**. Start with
[ARCHITECTURE.md](ARCHITECTURE.md), use the
[feature catalog](features/README.md) to select a capability, and follow the
linked project/API/Web/Mobile profiles rather than treating this overview as a
replacement for them.

Platform entry points are summarized under [api/](api/README.md),
[web-next/](web-next/README.md), and [mobile-react/](mobile-react/README.md).
Delivery status and deferrals are in
[DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md).

Before changing a component, service, or Contract, inventory shared
BuildingBlocks and module-local reusable pieces. Reuse or extend compatible
abstractions, keep business rules in the owning module, and update the affected
canonical feature books and required-file manifest in the same change.
