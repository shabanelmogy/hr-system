# ReferenceData architecture

`ErpSystem.Modules.ReferenceData.ReferenceDataModule` is the composition root
for this bounded context. The host references that bootstrap project; other
modules integrate through ReferenceData Contracts rather than its EF model,
Infrastructure project, or internal Application types.

## Runtime boundary

- Production layers: Contracts, Domain, Application, Infrastructure,
  Presentation, and the bootstrap project.
- Persistence: `ReferenceDataDbContext` owns the `ref` schema and its
  `__EFMigrationsHistory` table.
- Submodules: `geography` is a global-access capability; `addresses` is a
  tenant-entitlement capability. The parent module is a default module.
- Public integrations: `IReferenceDataCompanyGeographySource` and
  `IReferenceDataReportingSource` provide bounded cross-module read contracts.
- API flow: versioned controllers dispatch MediatR commands/queries; Application
  owns validation and orchestration; Infrastructure implements stores and
  post-commit jobs.

## Domain ownership

| Capability | Ownership and scope | Current delivery |
| --- | --- | --- |
| Countries | Global Platform catalog and top-level geographic lifecycle | API, Web, and Mobile applied |
| States | Global child of Country | API, Web, and Mobile applied |
| Districts | Global child of State | API, Web, and Mobile applied |
| Address Types | Company-scoped classification for Address records | API, Web, and Mobile applied |
| Addresses | Company-scoped reusable location/contact record | Core CQRS/API and persistence applied; standalone clients deferred |
| CompanyAddress / BranchAddress | Owner links with purpose and primary-state rules | Persistence model applied; owner-link command surfaces deferred |

Global Country, State, and District rows are intentionally not filtered by
tenant/company. Address and Address Type rows use fail-closed tenant/company
filters. Address mutations validate the active geographic chain and the current
company's operating-country scope. Platform company-geography workflows consume
the Contracts boundary instead of querying this context directly.

## Persistence and lifecycle

The current migration baseline is
`20260914181144_InitialReferenceData`, which creates the module's Countries,
States, Districts, Address Types, Addresses, CompanyAddresses, and
BranchAddresses tables in the `ref` schema. Domain configurations own foreign
keys, unique indexes, scope constraints, and soft-delete behavior. Geographic
lifecycle locks prevent an Address from being committed against a parent that
is being archived concurrently.

Mutation handlers keep validation, transactions, audit logging, and lifecycle
decisions inside ReferenceData. Realtime and user notifications are scheduled
only after a successful commit. A future service extraction may replace public
Contracts implementations, but it must not move EF entities across the module
boundary.

## Canonical evidence

- The [feature catalog](features/README.md) links the master, API, Web, Mobile,
  and required-file evidence for each slice.
- The [API guide](api/README.md) records the current controller families,
  authorization scopes, and test project.
- The generated architecture manifest is navigation evidence only; authored
  feature books remain the source for decisions and delivery status.

Reuse-first remains part of the module workflow: search shared BuildingBlocks
and local abstractions before adding a new piece, extend compatible generic
behavior, and keep domain-specific logic local.
