# Modular Monolith Architecture

This guide is authoritative for module boundaries, lifecycle, and the physical shape
of an approved bounded context. The decision to create a new module starts in
`API_FEATURE_DEVELOPMENT_WORKFLOW.md` with the Existing-System Relationship Review.
Every deployable module uses the same six-project template from its first commit.

## Canonical solution structure

The product identity is **ERP System** (`api/ErpSystem.sln`). It is one
deployable host with explicit module composition:

```text
api/
  ErpSystem.Api/                         # generic web host
  Tests/
    ErpSystem.ArchitectureTests/
    ErpSystem.IntegrationTests/
    ErpSystem.BuildingBlocks.Tests/
  BuildingBlocks/
    ErpSystem.BuildingBlocks.Application/       # shared MediatR logging + validation pipeline
    ErpSystem.BuildingBlocks.Authorization/
    ErpSystem.BuildingBlocks.Context/
    ErpSystem.BuildingBlocks.Messaging/
    ErpSystem.BuildingBlocks.Modularity/
  Modules/
    <Module>/
      ErpSystem.Modules.<Module>.Contracts/
      ErpSystem.Modules.<Module>.Domain/
      ErpSystem.Modules.<Module>.Application/
      ErpSystem.Modules.<Module>.Infrastructure/
      ErpSystem.Modules.<Module>.Presentation/
      ErpSystem.Modules.<Module>/          # composition root / bootstrap
      ErpSystem.Modules.<Module>.Tests/
```

Current registered modules are HR, Accounting, Platform, Contacts, ReferenceData,
Reporting, Inventory, CRM, and PointOfSale.

`CrystalReportGeneratorApi` is an independent application and intentionally
stays outside `ErpSystem.sln` and the ERP build gates.

## SDK and build reproducibility

`api/global.json` pins the ERP solution to .NET SDK 10.0.400 with patch-only roll-forward. The API CI installs the same SDK feature band before restore/build/test so local and hosted gates evaluate the same toolchain.

## Central package management

`api/Directory.Packages.props` is the single package-version policy for the ERP
solution. It enables NuGet Central Package Management only when the evaluated
project identity is `ErpSystem.Api`, `ErpSystem.BuildingBlocks.*`,
`ErpSystem.Modules.*`, `ErpSystem.ArchitectureTests`, or
`ErpSystem.IntegrationTests`. The fallback is
explicitly `ManagePackageVersionsCentrally=false`, so independent projects such
as `CrystalReportGeneratorApi` and `ErpSystem.AttendanceConnector` are not
silently changed by the ERP policy.

Every ERP `PackageReference` is versionless and resolves through one unique
`PackageVersion` entry. Local `Version` and `VersionOverride` values are not
permitted; `CentralPackageVersionOverrideEnabled` is false. Transitive pinning
is also disabled so enabling CPM does not rewrite the existing restore graph.
When upgrading a dependency, change its single `PackageVersion` in
`api/Directory.Packages.props`, then run restore, build, and the modularity
tests. Do not add a version back to an individual project. The module generator
preflights this policy and emits versionless references for every new module.

Every future module is created under `api/Modules/<ModuleName>` with exactly
the same six runtime projects plus its owned test project. Use the approved module
identity consistently. The existing `CRM` identity is an explicit acronym case; the
generator preserves project/module identity as `CRM` while emitting canonical `Crm*`
CLR symbols.

## Reference directions

```text
Domain                 -> no project references
Contracts              -> approved domain-neutral BuildingBlocks only when required
Application            -> own Contracts + own Domain + approved BuildingBlocks;
                           another module's Contracts only for an explicit integration
Infrastructure         -> own Application + own Domain + own Contracts + approved BuildingBlocks
Presentation           -> own Application + own Contracts + approved BuildingBlocks;
                           public cross-module Contracts only when the HTTP boundary needs them
Bootstrap              -> BuildingBlocks.Modularity + own Application,
                           Infrastructure, and Presentation
Host                   -> approved shared BuildingBlocks + module bootstraps only
```

Cross-module references may target only another module's public Contracts; they
must never target another module's Domain, Application, Infrastructure,
Presentation, or bootstrap internals. There are no cross-module EF navigations,
foreign keys, or direct infrastructure calls.
`ModuleModularityTests` enforces the six-project shape, allowed directions,
canonical identities, and host boundary for every directory under `Modules`.

Each runtime module has a matching ownership package under
`documentation/modules/<doc-slug>/` with `module.json`, architecture,
roadmap, API/web/mobile entry points, and a feature catalog. The package is the
module-specific documentation authority; shared workflow rules remain in
`documentation/system/`. HR currently catalogs its established canonical books
at their existing manifest paths, while Accounting's package records its
foundation and planned capabilities without claiming absent features.
The dependency-ordered Accounting work plan is maintained in
`documentation/modules/accounting/phases/` and is explicitly Planned / Not
started until runtime evidence is delivered.

## Module responsibilities

Each module owns its service registration, MVC application part, middleware,
endpoint mappings, initialization, database context, migrations, and seed data
through its bootstrap (`<ModuleName>Module : IModule`). The host does not know
module inner-layer types. `ModuleCatalog` invokes registration, migration,
initialization, middleware configuration, and endpoint mapping in deterministic
registration order.

Platform owns reusable platform contracts, policy/orchestration seams, technical
module-catalog behavior, authorization handlers, Identity, tenant/company
records, session state, entitlements, files, notifications, audit records, API
keys, and token implementation in its own `platform` schema. HR owns only HR
business persistence. Accounting, Contacts, ReferenceData, Reporting, Inventory,
CRM, and POS own independent contexts and communicate through public Contracts
and durable messaging where required.

Physical ownership is enforced at the EF model boundary: Platform maps only its
own tables, while other modules keep scalar tenant/company identifiers and use
public source contracts for cross-module decisions. No module maps another
module's tables or imports another module's Infrastructure or EF model. During
extraction, these contracts become remote or replicated adapters without
changing business Application code.

Tenant creation is serialized by normalized identifier on SQL Server and
atomically persists the tenant, `DEFAULT` company, module entitlements, and
security audit in `PlatformDbContext` with one save. Realtime publication runs
after commit as a non-critical, logged best-effort effect. Initial-admin
invitation, provisioning status, request-replay idempotency, tenant settings,
and recoverable email delivery remain additive capabilities.

`ErpSystem.BuildingBlocks.Application`, `.Authorization`, `.Context`, `.Messaging`,
and `.Modularity` contain domain-neutral primitives only. The Application block
owns the payload-free request logging and asynchronous FluentValidation behaviors;
its `AddApplicationPipeline()` registration is idempotent, so every module may
call it without duplicate open-generic MediatR behaviors. Host runtime contributor
interfaces let the host own startup/middleware/endpoint timing without moving
module-owned physical implementations into the host. `ModuleCatalog` runs
registration, migrations, initialization, middleware, and endpoint mapping in
deterministic dependency order.

## Database boundaries

Each module gets one `DbContext`, its own migrations assembly, and exactly one
short default schema with its EF migrations history table inside that schema;
no other module touches it. There is no sub-schema per feature by default.

| Module | CLR / project name | SQL schema |
| --- | --- | --- |
| HR | `HR` | `hr` |
| Accounting | `Accounting` | `acc` |
| Platform (technical) | `Platform` | `platform` |
| Contacts | `Contacts` | `contacts` |

CLR namespaces, assemblies, and project names use the explicit approved module name.
Only the database schema may use a documented short form; otherwise the generator
falls back to snake_case (overridable with `-DatabaseSchema`). Technical
scaffolding never commits the system to a future business-module roadmap.

Before introducing a component, service, or contract, the owning module must
inventory shared BuildingBlocks and module-local reusable pieces, then reuse or
extend a compatible abstraction and record the decision in its documentation.
New pieces start module-local and may move to shared only when they are truly
domain-neutral and used by multiple modules. HR and Accounting domain logic
never belongs in shared code, and shared capabilities are never copy/pasted.

Each module bootstrap first ensures its own schema exists (fresh databases need
it before EF creates `<schema>.__EFMigrationsHistory`) and then applies only
that module's migration assembly. Migration history is never moved between
module schemas. New modules must create their schema before applying their first
migration and must make migration execution idempotent.

## Compatibility values

Protocol and persisted-data compatibility values may retain
`HrManagementSystem` where changing them would invalidate existing JWTs,
UserSecrets, data-protection purposes, correlation keys, cookies, or persisted
Hangfire payloads. These are compatibility values only; namespaces, assemblies,
project names, solution identity, and module boundaries use `ErpSystem`.

## Adding a module

Run the canonical generator from inside `api` only after the bounded-context name
and ownership are approved:

```powershell
./scripts/New-ErpModule.ps1 -ModuleName SampleModule
```

The generator creates the six canonical projects with matching directory,
project, `AssemblyName`, `RootNamespace`, and CLR identities, then wires them
explicitly:

1. Projects land under `Modules/<ModuleName>/` with the same layer references
   as Accounting (Application on own Contracts and Domain; Infrastructure on
   Application, Contracts, and Domain; Presentation on Application and
   Contracts; bootstrap on BuildingBlocks plus Application, Infrastructure,
   and Presentation).
2. The bootstrap `<ModuleName>Module : IModule` gets MediatR plus
   FluentValidation registration, an EF Core SQL Server DbContext with its own
   module schema (`sample_module` by fallback for `SampleModule`, overridable with `-DatabaseSchema`), a module-owned
   migrations history table, Presentation application-part registration, and
   migration gating through `ModuleMigrationSettings`.
3. A matching module documentation package is created atomically under
   `documentation/modules/<lower-kebab-module>` with a machine-readable
   `module.json` and truthful Foundation guidance. The generator requires the
   module documentation root to exist, never overwrites an existing package,
   and honors `-WhatIf`.
4. The six projects are attached to `ErpSystem.sln` under solution folder
   `Modules/<ModuleName>`, the bootstrap is referenced by `ErpSystem.Api`,
   and one line is inserted into `ErpModuleRegistry.Create()`.
5. Composition stays explicit and deterministic: the host registers exactly
   what `ErpModuleRegistry.Create()` returns, in order. Reflection and
   assembly scanning are never used.
6. The generator first verifies `api/Directory.Packages.props` is valid and
   contains the central versions required by the template. If that policy is
   missing or incomplete, no module files are written.

What remains for the developer: add domain entities and configurations, create
the first EF migration for the module DbContext, add controllers and
application handlers, and extend the module boundary tests only if new
cross-module contracts appear. The existing `ModuleModularityTests` already
derive expectations from every `Modules/<ModuleName>` directory and verify the
registry covers each one exactly once, so no test update is needed for the new
module itself. Complete a reuse inventory and record it in the module package
before creating the first feature slice.

The generator also creates `FEATURE-QUALITY-GATE.md`. Every mutable entity must
receive one completed lifecycle row before a feature is called implemented.
The row separately proves CRUD or its domain alternative, archived discovery,
dependency guards, shared transaction resources, optimistic concurrency,
permissions, stable localized errors, and executable tests. This prevents a
green build from hiding an incomplete archive/restore or concurrency surface.

Process-wide localization is host-owned. Modules consume the host factory for
shared legacy resources or implement a module-owned localization port with
module-owned resources; a module must never replace `IStringLocalizerFactory`
or register MVC localization globally. `LocalizationOwnershipArchitectureTests`
enforces the rule for all current and future module directories.

Generic uploads remain a Platform capability even while the HTTP compatibility
controller is HR-owned. `IFileOperationsService` calls
`IFileUploadInspectionService` before writing any binary or metadata record;
bulk uploads inspect every item first. Supported content is checked against both
the declared type and bounded signatures, and production enables the optional
ClamAV TCP `INSTREAM` gate with fail-closed behavior. The protected local
storage adapter remains the current provider. Existing profile-picture and
Crystal Report writes also pass through the same inspection contract before
their feature-owned persistence; shared object storage is a future deployment
decision.

Connection strings resolve per module with fallback: the generator reads
`ConnectionStrings:<ModuleName>` first and falls back to
`ConnectionStrings:DefaultConnection`, so a module shares the database by
default and gets an isolated connection only when one is configured. Every
generated EF design-time factory locates the API through `ErpSystem.Api.csproj`
or `appsettings.example.json`, loads example/live/environment-specific files
optionally, and applies environment variables last. Empty and `<...>` sentinel
values are treated as unconfigured and fail with a clear design-time error
before SQL Server is contacted.

### Migration ownership and deployment

Every installed module owns the complete lifecycle of its context: schema
creation, the context-specific migrations assembly, and
`<module>.__EFMigrationsHistory`. The host invokes `ModuleCatalog` in stable
dependency order, but production deployments should run migrations as an
explicit release step when `DatabaseSettings:ApplyMigrationsOnStartup` is
disabled. The checked-in operator script discovers the explicit module registry,
module-local contexts, and design-time factories without maintaining a second
module list:

```powershell
$env:ConnectionStrings__DefaultConnection = '<secret-store-value>'
./scripts/Apply-ErpModuleMigrations.ps1 -Configuration Release
```

The script never accepts a connection string on the command line or writes its
value to output. `-WhatIf` enumerates the dependency-ordered operations without
connecting to SQL Server. A module may move to a separate database by setting
`ConnectionStrings__<ModuleName>` for its design-time factory; its schema and
history remain owned by that module after extraction. Passing
`-ConnectionStringEnvironmentVariable` explicitly forces one secret-store
value across all discovered modules for that run and restores process values on
exit. Cross-module foreign keys and a shared context are not used as an
extraction shortcut.

In the default mode, the shared `DefaultConnection` may be omitted when every
installed module provides a non-empty module-specific connection variable. The
operator script validates that effective connection contract before invoking
EF and names only missing settings in its error.

CI runs a clean SQL Server database test through the real `ErpModuleRegistry`
and `ModuleCatalog`. It applies every installed migration chain twice, checks
that all contexts have no pending migrations, and verifies each owned schema and
schema-local history table. This gate complements the model-drift check and
must be extended only through the module generator/registry when a new module
is installed. The test discovers the module-owned context and schema from every
installed registry module, so adding a module with its first migration does not
require a hand-maintained list of contexts or assertions.

Presentation source must not import its own Domain or Infrastructure projects,
and Application source must not import Presentation or Infrastructure. Use
Application ports and transport-neutral records at those boundaries; only the
module bootstrap composes the inner layers.

Application ports remain narrow and feature-owned. They expose asynchronous
operations needed by one use case and never expose EF Core types, `DbSet`,
`IQueryable`, or a generic repository. A module's scoped `DbContext` implements
those ports and is the Infrastructure unit-of-work and transaction boundary:
business state and durable outbox/inbox rows are staged in that context and
committed through one `SaveChangesAsync`. This keeps the modular monolith
portable to a service-owned database without leaking persistence details into
Application.

## Durable messaging boundary

Integration events are versioned transport-neutral records in the producing
module's Contracts project. Contacts persists a public Party fact in its own
outbox in the same transaction as the Party change. Its module-owned hosted
worker claims committed rows, applies bounded retry and stale-claim recovery,
and delegates transport to `IIntegrationEventPublisher`. Unsupported or
exhausted messages remain as `Dead` rows for operator action.

Accounting consumes only Contacts Contracts. It stores the inbox receipt and
its Accounting-owned `PartyReference` projection in one Accounting transaction,
so redelivery is idempotent. Neither module accesses the other's DbContext or
tables. The current publisher is an in-process host adapter; replacing it with
a broker adapter during extraction does not change producer Application code or
consumer contracts.

Contacts also owns its outbox operational check. Readiness uses aggregate
no-tracking queries for dead rows, due messages, and stale processing claims;
it does not read payloads or expose stored errors. Each future durable producer
must own equivalent dispatch, recovery, observability, and operator procedures
rather than sharing another module's outbox table.

## Verification gates

- `dotnet restore api/ErpSystem.sln`
- `dotnet build api/ErpSystem.sln --no-restore`
- full `ErpSystem.sln` tests, including module-owned tests plus Architecture,
  Integration, and BuildingBlocks system test projects
- EF `migrations has-pending-model-changes` for every module context
- documentation generator check and `git diff --check`
- `.github/workflows/api-ci.yml` repeats restore, build, the full API test suite,
  EF pending-model checks for every current module context, Release publish,
  transitive NuGet vulnerability audit, validated SPDX SBOM generation,
  artifact upload, and a Linux production-container build without registry push.
- `.github/workflows/documentation-ci.yml` runs the centralized documentation
  manifest/recipe check whenever API, web, mobile, or documentation evidence moves.

### Deployment configuration preflight

`ErpSystem.Api` runs `HostDeploymentConfigurationValidator` immediately after
the explicit module registry is created and before service registration or any
startup side effect. Every installed module and Hangfire must resolve a real
connection string (module-specific values override `DefaultConnection`), and
diagnostics contain setting names only. Production rejects wildcard or
loopback `AllowedHosts`, non-HTTPS or loopback CORS/frontend origins,
`TrustServerCertificate=true`, `Encrypt=false`, placeholder JWT or SMTP
secrets, startup seeding/migrations, and one-sided Google OAuth settings.

Production migrations are an explicit release step through
`api/scripts/Apply-ErpModuleMigrations.ps1`; startup migration and seeding
remain development-only switches. `appsettings.example.json` is a safe
template, while runtime secrets come from environment variables, user secrets,
or a deployment secret manager. CI runs a pinned Gitleaks current-tree scan
using `.gitleaks.toml`; the allowlist excludes generated/build/cache/vendor
and binary output only.

The canonical rollout, readiness, and rollback/forward-fix sequence is in
`documentation/api/PRODUCTION_DEPLOYMENT_RUNBOOK.md`. The checked-in Dockerfile
is a runtime artifact only; migrations run from a trusted .NET SDK release
runner before application instances receive traffic.

Supply-chain evidence is commit scoped: CI retains the JSON NuGet audit report,
the SPDX 2.2 manifest for the published API, and the Microsoft SBOM validation
output. A manifest with no packages or no published files fails the gate. Image
registry publication, signing, and provenance attestation remain deployment
platform decisions.

The host also owns OpenTelemetry composition. It exports ASP.NET Core,
`HttpClient`, runtime, and `ErpSystem.Application` signals through OTLP when
enabled. The shared application pipeline emits provider-neutral `ActivitySource`
and `Meter` signals so every module receives CQRS latency, count, and outcome
coverage without referencing the exporter. Request bodies, command values, and
exception messages are excluded from telemetry tags. Collector choice,
retention, dashboards, alerts, and SLO thresholds remain deployment ownership.

The host exclusively owns reverse-proxy normalization. When explicitly enabled,
it processes `X-Forwarded-For` and `X-Forwarded-Proto` before every security and
module middleware, and only from configured exact proxies or non-universal CIDR
networks. Modules never parse forwarding headers or configure their own proxy
trust; they consume the normalized connection address and request scheme.

The host also owns process topology. One replica uses local cache and SignalR
lifetime services. The optional distributed-runtime mode replaces the cache with
Redis and adds the Redis SignalR backplane without changing module contracts.
Modules consume `IDistributedCache`, `HybridCache`, and the existing realtime
abstractions; they never register a backplane or depend on Redis packages. A
multi-replica declaration is rejected unless the deployment also declares its
external aggregate rate limit, shared file storage, and session affinity. This
keeps infrastructure selection at the composition root and leaves module code
portable to a later service host.

The separate Crystal application is verified independently when its own work is
requested; it is not part of the ERP modular-monolith gate.
