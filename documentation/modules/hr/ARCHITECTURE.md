# HR architecture

HR is a bounded context composed through `ErpSystem.Modules.HR.HRModule`. The
host references only that bootstrap. Contracts are the supported integration
surface; other modules must not reference HR Infrastructure or its EF model.

## Ownership

- **Employee identity and workforce:** employee records, recruitment, and
  organizational concepts that are explicitly assigned to HR by the current
  domain books.
- **Authentication identity:** users, tenant identity, public authentication,
  and shared mail delivery are Platform-owned contracts and services.
- **Persistence:** the HR DbContext, migrations, seed data, and the `hr` schema
  including the module's migrations history table.
- **Composition:** service registration, presentation application parts,
  lifecycle hooks, and migration gating through the module bootstrap.

Cross-module integrations use stable IDs, transport-neutral Contracts, and
explicit events/handlers. There are no cross-module EF navigations or foreign
keys. Any approved consuming module must use HR contracts rather than reach into
HR tables.

## Persistence guarantees

The HR context owns the `hr` schema and applies tenant and company scope to
every write. A write fails closed when the current tenant is missing, and a
company-owned write also fails closed when the current company is missing.
Existing tenant and company identifiers are immutable on updates and deletes;
cross-scope mutations are rejected before EF sends SQL. Tenant identifiers are
limited to 32 characters. Every auditable add, update, or soft delete requires
an actor, preserves creation metadata on updates, and stamps the current actor
and machine for the change. Non-owned auditable roots expose a row-version
concurrency token. Resource-locking atomic operations are supported only by
SQL Server; rollback cleanup never masks the original operation failure.

## Extraction status

Employee records, workforce, recruitment, attendance, organizational structure,
and workforce planning are HR-owned. Platform owns authentication, users,
tenants, companies, memberships, entitlements, and identity mail delivery.
ReferenceData owns the global/company geographic catalog, while Platform owns
the company operating-country scope and consumes ReferenceData through a public
contract. Reporting owns report definitions and Crystal metadata. These
boundaries are implemented and covered by module dependency tests; do not add
platform or reference-data persistence back to HR.

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

## Digital-channel boundary

HR remains the current and future source of truth for Candidate profile/link,
EmploymentApplication, requisition/job posting/opening, interview, offer, and
hire lifecycle, in addition to employee and organization data. A future
JobPortal module is a separate bounded context and channel surface. It owns only
public vacancy projection/search/index, tenant-branded channel content, saved
jobs/alerts/preferences, draft application UX, and public/employer BFF workflow
or read models.

At submission JobPortal calls an HR-owned Contract idempotently; it does not own
EmploymentApplication or candidate lifecycle and must not read HR
Infrastructure, EF models, or the hr schema. Platform owns the external auth
principal. Tenant/company resolution comes from approved publication and
host/channel context, never manual visitor selection.

Public job search/indexing and candidate-facing channel UX are excluded from the
current HR runtime, while their source-of-truth lifecycle remains HR-owned.
JobPortal starts only after Recruitment public contracts and privacy/consent
evidence, independently of Accounting or Inventory, and is created with the
future-module workflow rather than added to HR.

Commerce, storefront, checkout, customer ordering, supplier portal, and
fulfillment are also outside HR ownership. HR can publish explicitly approved
recruitment facts through Contracts/events; it does not own external channel
identity or billing.
