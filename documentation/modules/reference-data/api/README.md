# ReferenceData API documentation

ReferenceData owns a live versioned API, not an empty Presentation scaffold.
Controllers are thin MediatR adapters over Application-owned CQRS commands and
queries; Infrastructure implements module-local stores through
`ReferenceDataDbContext`.

## Current controller families

| Controller | Scope | Route shape | Canonical profile |
| --- | --- | --- | --- |
| Countries | Global Platform / `super_admin` plus action permission | `/api/v1/countries` and resource subroutes | [Countries](../../../api/Countries_API_Implementation_Profile.md) |
| States | Global Platform / `super_admin` plus action permission | `/api/v1/states` and resource subroutes | [States](../../../api/States_API_Implementation_Profile.md) |
| Districts | Global Platform / `super_admin` plus action permission | `/api/v1/districts` and resource subroutes | [Districts](../../../api/Districts_API_Implementation_Profile.md) |
| Address Types | Tenant/company plus action permission | `/api/v1/addresstypes` and resource subroutes | [Address Types](../../../api/AddressTypes_API_Implementation_Profile.md) |
| Addresses | Tenant/company plus action permission | Current action-token compatibility routes under `/api/v1/addresses/{action}` | [Addresses](../../../api/Addresses_API_Implementation_Profile.md) |

Countries, States, Districts, and Address Types use the resource-style
`ApiRoutes.BaseRoute2`. Their applied slices include paged reads, lookups,
detail/relation reads, create/bulk create, update, archive/bulk archive, and
restore, with the exact exceptions documented in their profiles.

Addresses currently uses `ApiRoutes.BaseRoute`, so its concrete compatibility
surface is:

| Method | Route |
| --- | --- |
| GET | `/api/v1/addresses/GetAll` |
| GET | `/api/v1/addresses/GetByID/{id}` |
| GET | `/api/v1/addresses/GetAddressWithDetails/{id}/details` |
| POST | `/api/v1/addresses/Add` |
| PUT | `/api/v1/addresses/Update` |
| DELETE | `/api/v1/addresses/Delete/{id}` |
| GET | `/api/v1/addresses/GetCount/count` |

Do not describe those action-token routes as the resource-style surface or
silently create a client for them. A route cleanup is a contract change and must
be planned with its consumers. Owner-link commands remain deferred as `DEF-006`.

## Persistence, integration, and verification

- The current migration baseline is
  `ErpSystem.Modules.ReferenceData.Infrastructure/Migrations/20260914181144_InitialReferenceData.cs`.
- Module boundary reads are exposed through Contracts, including company
  geography and reporting sources; consumers do not read this DbContext.
- Module-owned tests live in
  `api/Modules/ReferenceData/ErpSystem.Modules.ReferenceData.Tests` and cover
  CQRS architecture, controllers/handlers, company isolation, geographic
  reassignment/lifecycle behavior, seed behavior, reporting, metadata, and audit
  stamping.
- Feature-specific request envelopes, paging/sorting rules, permissions,
  stable errors, side effects, and verification commands remain in the linked
  API profiles and required-file manifests.

Any API change must follow
[`API_FEATURE_DEVELOPMENT_WORKFLOW.md`](../../../api/API_FEATURE_DEVELOPMENT_WORKFLOW.md)
and update the affected cross-platform feature evidence in the same change.
