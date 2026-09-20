# CustomerRelationshipManagement architecture

The module is a bounded context composed through `ErpSystem.Modules.CustomerRelationshipManagement.CustomerRelationshipManagementModule`.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: `crm` (one module-owned schema and migrations history table).
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

CRM is the future owner of customer lifecycle, opportunities, segments,
campaigns, and engagement policies when those slices are implemented. It may
consume Commerce and JobPortal signals through reviewed Contracts/events, but
it does not own carts, orders, checkout, stock, financial posting, or public
job listings.

Contacts remains the Party source of truth and HR remains the Candidate
profile/link owner. Platform owns external auth principals. Commerce and
JobPortal remain independent future modules with channel-scoped preferences,
display projections, and persistence; they do not own external identities.
No new digital-channel capability is implied by this foundation package; Phase
00 evidence and the standard New-ErpModule.ps1 workflow are required before
runtime creation.
