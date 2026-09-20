# Module documentation

This directory is the ownership entry point for runtime-module documentation
in the ERP modular monolith. Each module gets one package with the same shape:

Start every module or feature review with the general
[ERP documentation guide](../project/ERP_DOCUMENTATION_GUIDE_AR.md) and the
[shared reuse catalog](../project/SHARED_REUSE_CATALOG.md). The workflow and
reuse inventory are mandatory for every module; this index only adds
module-specific ownership and evidence.

```text
<slug>/
  module.json
  README.md
  ARCHITECTURE.md
  DELIVERY-ROADMAP.md
  api/README.md
  web-next/README.md
  mobile-react/README.md
  features/README.md
  phases/README.md
```

## Ownership boundary

- `documentation/modules/<slug>/` owns module-specific architecture, delivery
  decisions, feature indexes, API/web/mobile notes, and (when needed) an
  ordered phase plan.
- `documentation/system/` owns the shared documentation workflow, recipe
  manifests, templates, generated phase packets, and status vocabulary.
- `documentation/project/` and the top-level platform books remain shared when
  a rule applies to more than one module.

Do not copy shared rules into a module package. Link to the canonical source and
record only the module-specific decision or evidence. Generated packets under
`documentation/system/generated/` are never edited by hand.

## Reuse-first implementation rule

Before inventing a component, service, or Contract, inventory the shared
BuildingBlocks and reusable pieces already present in the owning module. Reuse
or extend a compatible abstraction and record the decision in the module's
architecture or feature book. New pieces start module-local; promote them to a
shared BuildingBlock only when they are genuinely domain-neutral and used by
multiple modules. HR and Accounting domain logic must remain in those modules;
never copy/paste an existing shared capability.

## Status vocabulary

Use these values consistently in module roadmaps and feature indexes:

- **Foundation** — the structural scaffold is implemented and verified.
- **Required** — committed for the current release, with an owner and gates.
- **Planned** — accepted future capability not yet in the current release.
- **Deferred** — intentionally moved to a later milestone with a reason.
- **Excluded** — outside the module contract, with a documented rationale.

The word “implemented” requires runtime, contract, and relevant client/test
evidence. A roadmap entry is not evidence of an endpoint, entity, screen, or
migration.

## `module.json` contract

Every package has a machine-readable `module.json` containing at least:

- `moduleName`: explicit approved CLR/project module name (for example `Accounting` or `Platform`).
- `docSlug`: lower-kebab directory name (for example `accounting` or `platform`).
- `databaseSchema`: the module-owned SQL schema (for example `acc` or `platform`).
- `lifecycle` and `status`: current module state using the vocabulary above.
- `runtimePaths` and `documentationPaths`: repository-relative ownership map.

The API module generator validates the documentation root and creates this
package atomically with every new six-project module. It never overwrites an
existing runtime module or documentation package and honors `-WhatIf`.

## Moving existing books

HR has established canonical feature books under the existing `project/`,
`api/`, `web-next/`, and `mobile-react/` paths. The HR package catalogs those
locations; it does not duplicate or move them. A future move must update
`documentation/system/recipe-manifest.json`, required-file manifests, links,
and generated packets in one manifest-aware change, then pass
`Generate-Documentation.ps1 -Check`. Until that migration is complete, the
current paths remain authoritative.

## Future business and channel modules

The product blueprint plans independent future modules for JobPortal, Commerce,
Sales, Procurement, Payments, and (when justified) Fulfillment or Supplier
Portal. These names are roadmap boundaries only; no runtime project, route, table, or
documentation package is implied by this section.

When one of these modules is approved for implementation, complete Phase 00
feature evidence and the shared reuse inventory first, then create the package
atomically with New-ErpModule.ps1. The package must contain the standard
Contracts, Domain, Application, Infrastructure, Presentation, and Bootstrap
projects, module-owned Tests, and an owned schema/migrations boundary. Its
web/mobile surfaces and integration contracts are documented with the module;
they are not added to HR, Inventory, PointOfSale, Contacts, or Accounting as
shortcuts.

See the omnichannel product blueprint and ADR-008 for ownership, sequencing,
and reopening triggers.
