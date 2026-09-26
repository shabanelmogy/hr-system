# ERPSYSTEM API Architecture Map

Read this reference for API analysis, review, debugging, design, and implementation
orientation. Current source and higher-authority canonical documents win if this map
becomes stale.

## Authority order

1. `documentation/api/ERP_ARCHITECTURE_CONSTITUTION.md`
2. Approved Plan/Slice under `documentation/plans/` for planned business work
3. `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md`
4. Owning package under `documentation/modules/<module>/`
5. `documentation/api/Clean_Architecture_CQRS_Guide.md`
6. `documentation/api/MODULAR_MONOLITH_ARCHITECTURE.md`
7. Feature profiles and reviews as applied evidence, never higher authority

The API workflow requires one owner, one canonical business model, one CQRS path,
explicit contracts, explicit persistence ownership, and executable evidence.

Architecture documents define required direction; they do not by themselves prove
that runtime behavior exists. Current-state claims must be backed by current source,
tests, configuration, migrations, or live evidence. Historical plans, generated
packets, roadmap entries, and scaffold-era module text are not implementation proof.
When documentation sources disagree, preserve the conflict as a finding and update
the owning authored sources through the documented workflow.

## Solution boundary

`api/ErpSystem.sln` is the .NET 10 modular-monolith solution. `api/global.json`
pins SDK `10.0.400` with latest-patch roll-forward. `api/Directory.Packages.props`
owns versions for solution packages; solution project `PackageReference` items are
versionless. `api/Directory.Build.props` enables nullable, current analyzers, and
compiler warnings as errors for the ERP solution.

Two applications under `api/` are independent and outside the ERP solution gates:

- `api/CrystalReportGeneratorApi/`
- `api/ErpSystem.AttendanceConnector/`

Do not apply the modular-monolith workflow to them unless the request explicitly
includes them. Verify them with their own project/application constraints.

## Runtime topology

`api/ErpSystem.Api/` is the generic host and composition root. The explicit module
order lives in `ErpSystem.Api/Modules/ErpModuleRegistry.cs`; reflection-based module
discovery is deliberately not used.

Registered bounded contexts:

| Module | Primary ownership |
| --- | --- |
| `Platform` | Identity, authentication, tenants, companies, memberships, roles, permissions, entitlements, sessions, files, notifications, audit, API keys, token infrastructure |
| `ReferenceData` | Global/company-scoped geographic and other reference data |
| `Contacts` | Contact/Party truth and its durable integration-event outbox |
| `Accounting` | Accounting and finance, including inbox/outbox integration foundation |
| `Inventory` | Inventory catalog and stock boundary |
| `HR` | Workforce, organizational structure, recruitment, attendance, employees |
| `CRM` | Customer-relationship-management boundary |
| `Reporting` | Report metadata/templates, approved data sources, Crystal integration boundary |
| `PointOfSale` | Point-of-sale boundary |

Module-specific ownership, dependencies, roadmap, API/web/mobile entry points, and
feature catalog live under `documentation/modules/<module>/`.

## Canonical module shape

Every bounded context has six runtime projects and one owned test project:

```text
api/Modules/<Module>/
  ErpSystem.Modules.<Module>.Contracts/
  ErpSystem.Modules.<Module>.Domain/
  ErpSystem.Modules.<Module>.Application/
  ErpSystem.Modules.<Module>.Infrastructure/
  ErpSystem.Modules.<Module>.Presentation/
  ErpSystem.Modules.<Module>/              # bootstrap/composition
  ErpSystem.Modules.<Module>.Tests/
```

Dependency direction:

```text
Domain         -> no project references
Contracts      -> domain-neutral BuildingBlocks only when necessary
Application    -> own Domain + own Contracts + approved BuildingBlocks
Infrastructure -> own Application + Domain + Contracts + BuildingBlocks
Presentation   -> own Application + Contracts + presentation BuildingBlocks
Bootstrap      -> own Application + Infrastructure + Presentation + Modularity
Host           -> shared BuildingBlocks + module bootstraps only
```

Another module may be referenced only through its public `*.Contracts` project.
There are no foreign DbContext accesses, foreign table mappings, cross-module EF
navigations, or direct references to another module's internal layers.

## Shared BuildingBlocks

- `ErpSystem.BuildingBlocks.Application`: `ICommand`, `IQuery`, handlers,
  `Result`/`Error`, pagination, the payload-free logging behavior, asynchronous
  FluentValidation behavior, realtime requests, cache abstraction.
- `ErpSystem.BuildingBlocks.Authorization`: dynamic permission policies and
  `[HasPermission]`/`[TenantMember]` contracts.
- `ErpSystem.BuildingBlocks.Context`: trusted current execution/actor context.
- `ErpSystem.BuildingBlocks.Domain`: technical base entities, scope markers,
  domain exception/guard primitives.
- `ErpSystem.BuildingBlocks.Messaging`: neutral integration-event and Inbox/Outbox
  contracts.
- `ErpSystem.BuildingBlocks.Modularity`: `IModule`, explicit catalog, registration,
  migration and host-runtime contributor contracts.
- `ErpSystem.BuildingBlocks.Presentation`: route and ProblemDetails helpers.

BuildingBlocks are not a shared business layer. Keep a new abstraction module-local
until repeated, domain-neutral use proves it belongs here.

## Request and host flow

`ErpSystem.Api/Program.cs` performs deployment validation before service registration
or startup side effects, registers host infrastructure and explicit modules, then
builds the middleware/endpoints. Notable order:

1. Trusted forwarded headers when enabled.
2. Global exception handling and correlation ID.
3. Early module middleware contributors.
4. HTTPS redirection outside Development, request logging, CORS, localization,
   culture middleware, static files, optional Swagger.
5. Authentication, rate limiting, authorization.
6. Host-runtime preparation, module middleware/runtime contributors.
7. Controllers, module endpoints, host runtime endpoints, health endpoints.

`Platform` implements authentication/authorization truth. Presentation modules use
shared authorization contracts without depending on Platform Infrastructure.
Authentication, permission, tenant membership, company access, and module
entitlement are intentionally separate gates.

The host owns operational middleware, correlation, ProblemDetails, health,
OpenTelemetry, proxy trust, distributed-runtime selection, Data Protection, and
deployment validation. Modules must not re-register these global facilities.

## Persistence and consistency

Every persistent module has one module-owned DbContext, one unique short schema,
one migrations assembly and schema-local migration history table. Connection
resolution uses `ConnectionStrings:<ModuleName>` with `DefaultConnection` fallback.
The bootstrap creates its own constant schema before applying its own migrations.

The module DbContext commonly implements its Application unit-of-work port. It
owns scope filters, audit stamping, provider-specific locking/concurrency, EF
configuration, migrations, and stable translation of database failures. Reads use
feature-owned ports with bounded projections; writes load aggregates through narrow
ports and commit once.

Inside one aggregate/module transaction, strong consistency is the default.
Cross-module consistency is eventual by default. Public integration events are
transport-neutral records in the producing module's Contracts project. Durable
delivery uses an owning-module Outbox, idempotent consumer Inbox, retry, terminal
failure state, health visibility, and controlled replay.

## Representative implementations

Choose a reference for implementation shape only after confirming it matches the
new capability's ownership and risks:

- Global reference CRUD, bounded management lists, lookup/detail separation,
  archive/restore, thin controller, read/write ports: Countries under
  `Modules/ReferenceData/.../GeographicalInformation/Countries/` plus
  `documentation/api/Countries_API_Implementation_Profile.md`.
- Required parent relationship and dependency validation: States plus
  `documentation/api/States_API_Implementation_Profile.md`.
- Company-scoped, behavior-rich aggregate, explicit lifecycle, optimistic
  concurrency, resource locks, deterministic periods, post-commit effects:
  Fiscal Years plus `documentation/api/FiscalYears_API_Implementation_Profile.md`.
- Cross-module durable messaging and replicated reference: Contacts outbox and
  Accounting inbox, described by ADR-005 and the modular-monolith guide.
- External/device integration and specialized persistence: Attendance Devices plus
  `documentation/api/AttendanceDevices_API_Implementation_Profile.md`.
- Hierarchical domain behavior and cycle prevention: Organizational Structure plus
  `documentation/api/OrganizationalStructure_API_Implementation_Profile.md`.

Countries is useful for global reference data but is not a universal Domain or
scope template. Never copy its global ownership or simple mutation shape into a
tenant/company-owned or behavior-heavy aggregate.

## Error, validation, mapping, and time conventions

- Application returns stable `Result`/`Result<T>` and typed `Error` values when a
  use case has an expected failure. Presentation maps them through `ToProblem()`.
- The host maps unexpected exceptions and FluentValidation failures to stable
  ProblemDetails with correlation/trace information.
- Request-shape rules belong in FluentValidation. Persisted-state and orchestration
  decisions belong in handlers through narrow ports. Domain invariants belong in
  Domain. Race-safe uniqueness/concurrency also needs database enforcement.
- Domain/Application use `TimeProvider`; they do not read `DateTime.Now`,
  `DateTime.UtcNow`, environment variables, or cryptographic providers directly.
- Mapster is optional, convention-first, and mechanical. Natural same-module
  relationships can use navigations plus `ProjectToType<T>()`; synthetic,
  aggregate, reporting, cross-module, or provider-specific reads use explicit
  projections. Domain mutation never relies on automatic mapping when invariants or
  lifecycle behavior exist.

## Test ownership

- Feature Domain, handler, validation, persistence, permission/scope, controller,
  and contract tests: `ErpSystem.Modules.<Module>.Tests`.
- Cross-module/static architecture rules:
  `api/Tests/ErpSystem.ArchitectureTests`.
- Runtime composition, middleware, migrations, cross-module integration:
  `api/Tests/ErpSystem.IntegrationTests`.
- Shared technical behavior: `api/Tests/ErpSystem.BuildingBlocks.Tests`.

Architecture tests enforce the module shape and references, sender-first business
controllers, layer purity, no generic repositories, no direct clocks/environment/
crypto in inner layers, package/version policy, module registry completeness,
schema/history ownership, real migrations, and absence of hidden test sources.
