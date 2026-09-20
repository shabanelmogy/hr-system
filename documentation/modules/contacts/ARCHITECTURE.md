# Contacts architecture

The module is a bounded context composed through `ErpSystem.Modules.Contacts.ContactsModule`.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: `contacts` (one module-owned schema and migrations history table).
- Layers: Contracts, Domain, Application, Infrastructure, Presentation, and
  the bootstrap composition root.
- Integrations: stable identifiers, transport-neutral Contracts, and explicit
  events/handlers at module boundaries.
- Application commands depend on the Contacts-owned `IContactsOutbox` contract;
  the unqualified `IIntegrationEventOutbox` base contract is not registered by
  the module. This keeps Contacts outbox selection independent of module
  registration order when the monolith composes several outboxes.
- Contacts Application calls the neutral `AddApplicationPipeline()` extension.
  Its own validators are discovered from the Contacts assembly and run through
  the shared asynchronous validation behavior; no HR-local behavior or validator
  is required.
- Party commands use narrow Contacts-owned ports. `ContactsDbContext` is the
  Infrastructure unit-of-work boundary for the Party row and its outbox fact;
  the module does not add a generic repository over EF Core.
- Party create/update commits the Contacts business row and integration-event
  outbox row in one module unit of work. A module-owned dispatcher publishes
  those durable facts through the transport-neutral publisher boundary.
- Dispatcher failures use bounded exponential retry, stale `Processing` claims
  are recoverable after a processing timeout, and exhausted/unsupported facts
  become operator-visible `Dead` outbox rows rather than disappearing.
- Dispatcher outcomes are structured logs containing identifiers, attempts,
  counts, and error type without serialized event payloads. The `contacts-outbox`
  readiness check performs bounded aggregate reads and reports healthy,
  degraded, or unhealthy state from configurable dead-row and backlog-age
  thresholds. Pending, due failed, and stale processing rows all participate in
  backlog age.
- Accounting consumes only `Contacts.Contracts` events. Its inbox receipt and
  Accounting-local `PartyReference` update are idempotent and transactional;
  Accounting never reads the Contacts DbContext.

The first Party reference workflow is implemented and verified. Additional
Contacts features must preserve this ownership and delivery boundary.

Party revisions are monotonic aggregate versions, independent of timestamps.
The API requires the caller's expected revision and EF protects the eventual
write with concurrency tokens. Created/updated events carry the committed
revision so downstream projections can reject delayed or duplicate updates
even when producer clocks differ. `AddPartyRevision` initializes existing rows
to revision 1 without replacing their identifiers or outbox history.

The outbox health settings live under
`Modules:Contacts:Messaging:Outbox` as `MaxDeadRows` and
`MaxDueBacklogAge`. Operations and recovery steps are documented in
`documentation/api/PRODUCTION_DEPLOYMENT_RUNBOOK.md`.

Reuse-first is part of the module workflow: search shared BuildingBlocks and
local abstractions before creating a new piece, and keep domain logic local.

## Future channel boundary

Contacts remains the owner of Party, customer profile, supplier profile, and
contact data for approved external parties. HR owns Candidate profile/link and
the candidate consent lifecycle unless a reviewed channel contract assigns a
specific responsibility. Commerce and JobPortal may maintain only
channel-scoped preferences and display projections; they must consume Contacts
Contracts and must not turn Contacts into a storefront, checkout, candidate
portal, or campaign engine.

Customer consent, candidate consent, tenant/company ownership, and account
linking must be explicit at the consuming boundary. Public identities and
customer sessions do not automatically gain access to Contacts or HR data.
Future channel modules are created independently after Phase 00 evidence and
New-ErpModule.ps1 generation; no new routes or persistence are implied here.
