# Operational Foundation

The API operational baseline is intentionally small and uses the infrastructure already required by the application.

## Logging and correlation

Serilog writes structured events to stdout through the console sink only. Logger
creation performs no filesystem or database I/O, so startup does not depend on a
module database or on a writable application directory. Deployment platforms,
sidecars, or external agents own collection, retention, indexing, and routing of
stdout/stderr. The API deliberately has no direct file or MSSQL logging sink and
does not auto-create logging tables. When enabled, OpenTelemetry exports traces
and metrics through OTLP to the configured collector; telemetry export remains
separate from application log delivery.

Every HTTP request has an `X-Correlation-ID`. A valid client value is preserved; otherwise the API creates one. The value is returned in the response, exposed by the browser CORS policy, added to the Serilog context, and included together with `traceId` in host and module MVC Problem Details responses.

Authentication runs before authorization and before rate limiting. The rate limiter can therefore partition authenticated traffic by the canonical name-identifier claim instead of collapsing signed-in users onto a shared proxy/IP bucket. Request events can include `UserId` and `UserName` for authenticated requests without logging tokens or credentials.

## Reverse proxy trust

Forwarded headers are host-owned and disabled by default. A deployment behind a
reverse proxy or load balancer enables them only after listing every trusted
proxy address or network:

```text
ForwardedHeaders__Enabled=true
ForwardedHeaders__ForwardLimit=1
ForwardedHeaders__RequireHeaderSymmetry=true
ForwardedHeaders__KnownProxies__0=10.0.0.10
ForwardedHeaders__KnownNetworks__0=10.20.0.0/16
```

The host accepts only `X-Forwarded-For` and `X-Forwarded-Proto`; it never accepts
`X-Forwarded-Host`. The configured trusted lists replace framework defaults,
`ForwardLimit` must be from `1` through `5`, and IPv4/IPv6 `/0` networks are
rejected. Enabling the feature without at least one valid trusted IP or CIDR,
or enabling the framework's unbounded `ASPNETCORE_FORWARDEDHEADERS_ENABLED`
shortcut, fails startup before migrations or other side effects.

`UseForwardedHeaders` runs before exception handling, correlation, HTTPS
redirection, authentication, rate limiting, and module middleware. Consequently,
session and audit IP capture plus anonymous rate limiting use the normalized
client address, while headers sent directly by an untrusted client are ignored.
Modules consume `HttpContext.Connection.RemoteIpAddress` and `Request.Scheme`;
they must never parse forwarded-header values themselves.

## Distributed runtime and horizontal scale

The host uses process-local `IDistributedCache` and SignalR services by default,
which is the safe zero-dependency mode for one replica. Redis is an explicit
opt-in for deployments that need shared cache state or a SignalR backplane:

```text
DistributedRuntime__Enabled=true
DistributedRuntime__ReplicaCount=2
DistributedRuntime__RedisConnectionStringName=Redis
DistributedRuntime__CacheInstanceName=ErpSystem:Production:
DistributedRuntime__SignalRChannelPrefix=ErpSystem.Production
DistributedRuntime__ExternalRateLimitingEnabled=true
DistributedRuntime__SharedFileStorageEnabled=true
DistributedRuntime__SessionAffinityEnabled=true
ConnectionStrings__Redis=<secret-store-reference>
```

When enabled, the host replaces `DistributedMemoryCache` with the Redis
`IDistributedCache` implementation and configures the SignalR Redis backplane.
Separate cache and SignalR prefixes prevent collisions with other applications.
The Redis connection must be valid, non-placeholder secret-backed configuration;
its value is never included in validation diagnostics. Readiness adds
`distributed-runtime:redis` and becomes unhealthy when the cache cannot reach
Redis.

`ReplicaCount` defaults to `1`. A higher value fails startup unless Redis is
enabled and the deployment explicitly attests that an external gateway owns the
aggregate rate limit, uploaded files use storage shared by every replica, and
session affinity is enabled. These booleans are deployment assertions: they do
not provision a gateway or storage. Keep `SharedFileStorageEnabled=false` until
the current file adapter has a shared persistent volume or is replaced by an
object-storage adapter. Redis SignalR delivery is transient; messages emitted
while Redis is unavailable are not replayed, so business-critical integration
facts continue to use module-owned outbox/inbox storage.

## Data Protection key-ring continuity

Production must configure an absolute persistent `DataProtection:KeyRingDirectory`
and a current PFX certificate with its private key. The certificate encrypts the
key ring at rest; `DataProtection:SharedKeyRing=true` is required whenever more
than one replica reads the ring. Certificate rotation is additive: configure the
new certificate as `ProtectionCertificatePath` and keep each still-needed old
certificate in `PreviousProtectionCertificates` with its password. Previous
certificates are used only for decryption and may be expired, but must retain a
private key. Do not delete old key XML files until every protected cookie, token,
and payload has expired and all replicas have loaded the replacement certificate.
After rotation, restart every replica and verify that an artifact protected by
the previous process can be unprotected by the new process before routing traffic.
Keep `ApplicationName` stable across restarts and replicas. Configure previous
PFX entries via `DataProtection__PreviousProtectionCertificates__0__Path` and
`DataProtection__PreviousProtectionCertificates__0__Password`. Credentials belong
in the secret store. The design follows the framework's
[Data Protection configuration guidance](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-10.0).

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

SQL Server LocalDB is a development-only option. In the current two-file layout,
the ignored `ErpSystem.Api/appsettings.json` carries the host SQL Server
connection and the ignored `appsettings.Development.json` overrides it with
LocalDB during local development. A deployment secret store or the
`ConnectionStrings__DefaultConnection` process environment variable may override
the base value when the host supports it. Do not place connection values or
credentials in tracked files. Module-specific
`ConnectionStrings__<ModuleName>` keys remain optional overrides, and
`ConnectionStrings__HangfireConnection` is optional because it falls back to
`ConnectionStrings__DefaultConnection`. The host rejects any effective LocalDB
connection outside `Development`, including when strict production-readiness
validation is explicitly deferred.

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
`api` directory. The module design-time factories read the ignored
`ErpSystem.Api/appsettings.json` host connection, then the ignored
`appsettings.Development.json` LocalDB override when the environment is
`Development`, and finally process environment variables. Preview the module
discovery and dependency order without changing a database:

```powershell
.\scripts\Apply-ErpModuleMigrations.ps1 -Environment Production -WhatIf
```

After reviewing the preview, the exact production migration command is:

```powershell
.\scripts\Apply-ErpModuleMigrations.ps1 -Environment Production
```

No process connection variable is required when the two appsettings files or
module-specific configuration provide the effective values. Set
`ConnectionStrings__<ModuleName>` when extracting a module to its own database;
the module's design-time factory and runtime registration use that override
before `ConnectionStrings__DefaultConnection`. Design-time factories locate the
API from `ErpSystem.Api.csproj` or `appsettings.example.json`, treat all JSON
files as optional, apply environment variables last, and reject empty or
`<...>` placeholder values before invoking EF. The script sets both
`DOTNET_ENVIRONMENT` and `ASPNETCORE_ENVIRONMENT` for the run and restores their
prior process values afterward.

When a design-time factory cannot resolve an effective connection, EF remains
responsible for reporting that failure; the script does not preflight process
variables and does not log connection values.

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

System-role permission reconciliation remains active when `SeedOnStartup` is disabled. That path first creates any missing built-in `super_admin`, `admin`, and `user` roles, then reconciles their owned permissions. It is therefore safe after recreating an already-migrated database and remains idempotent across later startups. The system-role task itself does not create bootstrap users, companies, geography, or sample data; preview bootstrap is controlled separately by `BootstrapUsers:Enabled` below.

`PlatformBootstrapUsersStartupTask` is a separate opt-in preview bootstrap. When
`BootstrapUsers:Enabled=true`, it creates or reuses the configured preview
users, their demo tenant/company scope, memberships, and module entitlements
idempotently. It merges current catalog defaults (HR and ReferenceData
`addresses`) into the existing demo grants case-insensitively, so explicit
Accounting or other module/submodule grants are preserved; global ReferenceData
`geography` is never added. This is useful for a hosted development or preview
environment where demo login must read the shared database. Keep it disabled for
a real production deployment and provide the passwords through the deployment
secret store; the task does not run when the switch is false.

## Configuration validation

JWT, Hangfire, CORS, mail, frontend URL, OpenTelemetry when enabled, module migration switches, file-security scanner settings, and effective per-module database connection settings are validated before startup side effects. Production JWT configuration additionally rejects the development signing key and known placeholder/sentinel values, and production requires explicitly enabled malware scanning with a valid ClamAV host and port for Platform-managed uploads. The checked-in example configuration intentionally leaves the signing key empty and malware scanning disabled so it cannot accidentally satisfy production validation. Hosted configuration must provide valid values before the API begins serving requests. Development secrets may remain in development-only configuration, but production secrets belong in environment variables or a secret store.

The Platform file gate validates supported extension/content-type pairs and bounded
content signatures before persistence. Generic files, profile pictures, and
Crystal Report uploads all invoke this contract before their owning storage writes.
When enabled, ClamAV receives bounded
`zINSTREAM` chunks over a trusted private TCP network; clean, malware, malformed,
and unavailable responses have stable safe API mappings. Object storage,
encryption, retention, and backup remain deployment/provider responsibilities.
The client accepts only the NUL framing required for `z` commands by the
[official ClamAV protocol](https://docs.clamav.net/manual/Usage/ClamdProtocol.html).
It does not authenticate or encrypt the TCP channel; deployment must restrict
that channel to the trusted scanner service. Signature checks inspect a bounded
prefix and are not a complete format parser or a substitute for malware scanning.

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
