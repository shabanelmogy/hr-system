# ReferenceData architecture

The module is a bounded context composed through `ErpSystem.Modules.ReferenceData.ReferenceDataModule`.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: `ref` (one module-owned schema and migrations history table).
- Layers: Contracts, Domain, Application, Infrastructure, Presentation, and
  the bootstrap composition root.
- Integrations: stable identifiers, transport-neutral Contracts, and explicit
  events/handlers at module boundaries.

`ReferenceDataModule` is a current default module. Its `addresses` submodule is
the tenant-entitlement capability granted to new tenants; `geography` remains a
global platform capability and is never included in tenant grants.

## Verified ownership

ReferenceData owns the global Country, State, and District catalog plus
company-scoped Address, AddressType, CompanyAddress, and BranchAddress records.
`ReferenceDataDbContext` applies the `ref` schema and fail-closed tenant/company
filters for company-owned rows; global geographic rows remain available to
authorized platform catalog operations. Platform company-geography workflows
consume `IReferenceDataCompanyGeographySource` instead of reading this context
directly.

The module exposes versioned CQRS endpoints for the geographic catalog and
address surfaces. Validation, lifecycle locks, audit stamping, and post-commit
notifications stay inside the module. A future service extraction can replace
the public geography contracts without moving EF entities across module
boundaries.

This file is a generated foundation record. Replace generic statements with
verified symbols as the module grows; do not claim a feature is implemented
until its runtime, API, clients, and tests exist.

Reuse-first is part of the module workflow: search shared BuildingBlocks and
local abstractions before creating a new piece, and keep domain logic local.
