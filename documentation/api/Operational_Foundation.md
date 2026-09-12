# Operational Foundation

The API operational baseline is intentionally small and uses the infrastructure already required by the application.

## Logging and correlation

Serilog writes structured events to the console and rolling JSON files under `Logs/`. Files are retained for 30 days. The SQL sink is restricted to error events to avoid turning request logging into an unbounded operational table.

Every HTTP request has an `X-Correlation-ID`. A valid client value is preserved; otherwise the API creates one. The value is returned in the response, exposed by the browser CORS policy, added to the Serilog context, and included together with `traceId` in host and module MVC Problem Details responses.

Authentication runs before authorization and before rate limiting. The rate limiter can therefore partition authenticated traffic by the canonical name-identifier claim instead of collapsing signed-in users onto a shared proxy/IP bucket. Request events can include `UserId` and `UserName` for authenticated requests without logging tokens or credentials.

## Traces and metrics

The API host owns the OpenTelemetry SDK and OTLP exporter. Module Domain and
Application projects do not reference an exporter. The shared application
pipeline emits `ErpSystem.Application` activities plus bounded request-count and
duration instruments; tags contain the CQRS request type and outcome only, never
the request payload or exception message.

OpenTelemetry is disabled by default and registers no trace or metric provider
in that mode. A hosted environment enables it through secret-store or deployment
configuration:

```text
OpenTelemetry__Enabled=true
OpenTelemetry__ServiceName=ErpSystem.Api
OpenTelemetry__ServiceNamespace=ErpSystem
OpenTelemetry__TraceSamplingRatio=0.1
OpenTelemetry__OtlpEndpoint=https://collector.example.com:4317
OpenTelemetry__OtlpProtocol=grpc
```

The sampling ratio must be between `0` and `1`; the endpoint must be an absolute
HTTP/HTTPS URI; and the protocol is `grpc` or `http/protobuf`. Exporter
authentication headers belong in the deployment secret store through the
standard `OTEL_EXPORTER_OTLP_HEADERS` variable. ASP.NET Core inbound requests,
outbound `HttpClient` calls, runtime metrics, and CQRS spans/metrics are exported.
Anonymous liveness and readiness probes are excluded from request traces to keep
the trace stream useful; their status remains available to the orchestrator.

## Background work

Hangfire is the default mechanism for scheduled/general application background work. A module-owned hosted worker is permitted only for technical durable messaging infrastructure such as an outbox dispatcher, where it drains that module's persisted outbox and delegates delivery through the neutral messaging contracts. Do not use hosted polling workers as an alternate scheduler for ordinary business jobs that Hangfire already supports.

- Enqueue non-critical notifications and realtime updates only after a successful database save.
- Jobs must be safe to retry because Hangfire provides at-least-once execution.
- Pass tenant, company, actor, and operation identifiers in job requests.
- Establish `ICurrentActorScope` before a job accesses tenant/company-filtered data.
- Use recurring Hangfire jobs only when cleanup or scheduled business behavior is introduced.

## Durable integration-event operations

Contacts owns its transactional outbox and polling worker. Party changes and
their public integration events commit through the same `ContactsDbContext`;
the worker then publishes committed rows through the transport-neutral
`IIntegrationEventPublisher`. Bounded exponential retry, stale-processing
recovery, terminal `Dead` rows, and Accounting inbox receipts provide the
current at-least-once delivery and consumer-idempotency baseline.

The dispatcher emits structured batch and outcome logs without event payloads.
`Modules:Contacts:Messaging:Outbox:MaxDeadRows` and `MaxDueBacklogAge` configure
the readiness thresholds. The health query uses aggregate, no-tracking reads
and reports counts and age only. A database-query failure is unhealthy; dead
rows above the configured allowance or an overdue pending/failed/stale-processing
backlog is degraded.

## Health endpoints

- `/health/live` confirms that the API process can serve requests. It does not call dependencies.
- `/health/ready` checks the effective SQL connection for every installed runtime module (`ConnectionStrings:<ModuleName>` with `DefaultConnection` fallback), Hangfire server availability, and module-schema compatibility. Schema compatibility uses each installed module's EF migration history and reports unhealthy when any required migration is still pending. Separate named database checks are kept even when modules share one database so an operator can see the affected module dependency. It returns the minimal health-check response and allows anonymous infrastructure probes.
- The same readiness endpoint includes `contacts-outbox`; it becomes degraded
  when operator attention is required and unhealthy when the outbox store cannot
  be queried. `/health/ready` maps both degraded and unhealthy states to HTTP
  `503`, so an orchestrator does not route new traffic to an instance that
  cannot drain its durable integration backlog safely.
- `/health` preserves the authenticated detailed response used by the application health page.

External websites are not health dependencies. A Google or public-internet failure must not mark the HR system unhealthy.

## Startup database work

`DatabaseSettings` controls startup behavior:

```json
{
  "DatabaseSettings": {
    "ApplyMigrationsOnStartup": false,
    "SeedOnStartup": false
  }
}
```

Both settings are enabled in local Development. Hosted environments default to disabled so multiple API instances do not race while applying migrations or seeds. Apply production migrations as a deployment step, or explicitly opt in for a controlled single-instance deployment.

The supported deployment command is the module-owned migration script from the
`api` directory. Provide the connection through the process environment or a
secret-store integration; the script does not print or persist the value:

```powershell
$env:ConnectionStrings__DefaultConnection = '<secret-store-value>'
./scripts/Apply-ErpModuleMigrations.ps1 -Configuration Release
```

Use `-WhatIf` to inspect discovered modules, contexts, and dependency order
without requiring a connection. Set
`ConnectionStrings__<ModuleName>` when extracting a module to its own database;
the module's design-time factory and runtime registration use that override
before `ConnectionStrings__DefaultConnection`. Design-time factories locate the
API from `ErpSystem.Api.csproj` or `appsettings.example.json`, treat all JSON
files as optional, apply environment variables last, and reject empty or
`<...>` placeholder values before invoking EF.

In the normal mode, `ConnectionStrings__DefaultConnection` may be omitted when
every installed module has its own non-empty `ConnectionStrings__<ModuleName>`
value. The script fails before invoking EF and lists only the missing setting
names when an installed module has no effective connection.

If the secret store exposes a different variable name, pass
`-ConnectionStringEnvironmentVariable`. That value temporarily overrides the
default and discovered module connection variables for the command, then the
original process values are restored. This explicit mode is useful for a
single-database deployment; use the conventional per-module variables when
different modules intentionally live in different databases.

The API CI gate creates a clean temporary SQL Server database, applies the
registry's full module migration lifecycle twice, and checks every module's
schema-local `__EFMigrationsHistory` and pending-migration state. A passing
model-drift check alone is not sufficient evidence that a clean deployment can
compose all migration chains. Context and schema coverage is discovered from
the installed registry modules, so a new generated module joins this gate
automatically after its first migration is added.

## Release artifact and container

The API CI builds and tests `Release`, verifies EF model drift, creates an
immutable framework-dependent publish artifact, and builds the production
container without pushing it. The multi-stage Dockerfile pins its .NET 10 SDK
and ASP.NET runtime images by tag and manifest digest, copies only published
output into the runtime image, runs as the image's non-root user, and listens
on port `8080`.

Before build and test, CI audits direct and transitive NuGet dependencies using
the .NET 10 package audit source and stores the machine-readable JSON report.
Any known vulnerability fails the job. After publish, the pinned Microsoft SBOM
tool generates an SPDX 2.2 manifest from the release files and source component
graph, then validates file hashes and requires at least one detected package and
published file. The audit report, SBOM, and validation result are retained as
commit-scoped artifacts. CI installs the .NET 8 runtime alongside the pinned
.NET 10 SDK because the selected Microsoft SBOM tool targets .NET 8; application
restore, build, tests, publish, and EF commands remain pinned to SDK 10.0.400 by
`global.json`.

Follow [`PRODUCTION_DEPLOYMENT_RUNBOOK.md`](PRODUCTION_DEPLOYMENT_RUNBOOK.md)
for controlled migrations, rollout probes, smoke checks, and the
rollback/forward-fix decision. Image publication, environment approvals,
image signing, backup schedules, restore drills, and alert routing remain
deployment-platform responsibilities.

Before any migration or startup task can mutate external state, the host executes all ValidateOnStart option validators and validates every installed module migration switch. Startup then runs the optional module migrations and performs a module-neutral pending-migration compatibility check. Host runtime startup tasks and module initialization run only after every installed module reports a compatible schema. This prevents role/permission reconciliation or other startup writes from running against a database whose externally managed migrations have not yet been applied.

System-role permission reconciliation remains active when `SeedOnStartup` is disabled. That path first creates any missing built-in `super_admin`, `admin`, and `user` roles, then reconciles their owned permissions. It is therefore safe after recreating an already-migrated database and remains idempotent across later startups. It does not create bootstrap users, companies, geography, or sample data; those remain controlled by `SeedOnStartup`.

## Configuration validation

JWT, Hangfire, CORS, mail, frontend URL, OpenTelemetry when enabled, module migration switches, and effective per-module database connection settings are validated before startup side effects. Production JWT configuration additionally rejects the development signing key and known placeholder/sentinel values; the checked-in example configuration intentionally leaves the signing key empty so it cannot accidentally satisfy validation. Hosted configuration must provide valid values before the API begins serving requests. Development secrets may remain in development-only configuration, but production secrets belong in environment variables or a secret store.

The tracked `ErpSystem.Api/appsettings.example.json` contains placeholders only;
live `appsettings*.json` files are local and ignored. Supply JWT, SMTP, database,
Hangfire, bootstrap-user, Google, and connector secrets through user secrets,
environment variables, or the deployment secret store; never restore
credentials directly into the tracked example file.

The collector/backend, alert routes, dashboards, and SLO thresholds remain
deployment decisions. A message broker, distributed cache, persistent Data
Protection storage, and gateway-specific configuration can be introduced when
the deployment topology requires them. They are not prerequisites for building
the domain.
