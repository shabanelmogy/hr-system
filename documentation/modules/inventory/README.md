# Inventory module

This package is the documentation ownership boundary for the **Inventory** module.
It describes the module's verified runtime foundation and records decisions for
future capabilities. Shared ERP rules remain in `documentation/system/` and are
linked rather than copied here.

## Current status

- Lifecycle: active modular-monolith module.
- Runtime foundation: six projects, a module bootstrap, and an EF Core context
  using the `inv` schema.
- Catalog slice (API only): `api/v1/Categories` (`GetAll`, `GetById/{id}`, `Add`,
  `Update`, `Delete/{id}`; also a V2 `GetAll`) and `api/v1/Subcategories`
  (`GetAll`, `GetAllRelatedToCategory?CategoryId=`, `GetById/{id}`, `Add`, `Update`,
  `Delete/{id}`), all `[TenantMember]` with `Categories:*` / `SubCategories:*`
  permissions (`catalog` submodule). Tests: `InventoryCatalogCqrsTests`,
  `ValidationQueriesTests`.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then record delivery decisions
in [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md). There is no web or mobile surface
yet (record Deferred/Excluded per feature before adding one).

Before adding a component, service, or Contract, inventory shared BuildingBlocks
and module-local reusable pieces. Reuse or extend compatible abstractions and
record the decision in the feature book. Start new behavior module-local and
promote it only when it is domain-neutral and used by multiple modules.