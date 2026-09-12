# HR architecture

HR is a bounded context composed through `ErpSystem.Modules.HR.HRModule`. The
host references only that bootstrap. Contracts are the supported integration
surface; other modules must not reference HR Infrastructure or its EF model.

## Ownership

- **Identity and workforce:** employee and organizational concepts that are
  explicitly assigned to HR by the current domain books.
- **Persistence:** the HR DbContext, migrations, seed data, and the `hr` schema
  including the module's migrations history table.
- **Composition:** service registration, presentation application parts,
  lifecycle hooks, and migration gating through the module bootstrap.

Cross-module integrations use stable IDs, transport-neutral Contracts, and
explicit events/handlers. There are no cross-module EF navigations or foreign
keys. Any approved consuming module must use HR contracts rather than reach into
HR tables.

## Reuse-first workflow

Before adding an HR component, service, or Contract, search the shared
BuildingBlocks and existing HR abstractions. Reuse or extend a compatible piece
and record that decision in the owning feature book. New behavior starts inside
HR; promote it to shared only when it is domain-neutral and used by multiple
modules. HR-specific rules never belong in shared code, and an existing shared
capability must never be copy/pasted into HR.

## Documentation authority

The current feature books listed in [README.md](README.md) are authoritative
until a manifest-aware move places them under this package. A move must update
`documentation/system/recipe-manifest.json`, required-file manifests, links,
and generated packets together; do not create a second copy with divergent
rules.
