# API configuration

`appsettings.json` and `appsettings.Development.json` are local runtime files in
this workspace and are intentionally ignored by Git because they may contain
database credentials, JWT signing material, SMTP passwords, bootstrap-user
passwords, or integration secrets. The two-file database layout is deliberate:
`appsettings.json` contains the hosted SQL Server connection that is packaged for
the current deployment, while `appsettings.Development.json` overrides it with
LocalDB whenever the environment is `Development`.

Use `appsettings.example.json` as the safe configuration template. For deployed
environments, prefer the ASP.NET Core environment-variable convention, for
example:

```text
ConnectionStrings__DefaultConnection
ConnectionStrings__HR
ConnectionStrings__Platform
ConnectionStrings__Accounting
ConnectionStrings__Contacts
ConnectionStrings__HangfireConnection
ConnectionStrings__HR
ConnectionStrings__Accounting
ConnectionStrings__Platform
ConnectionStrings__Contacts
JwtOptions__Key
DeploymentValidation__EnforceProductionReadiness
MailSettings__Enabled
MailSettings__Mail
MailSettings__DisplayName
MailSettings__Password
MailSettings__Host
MailSettings__Port
CrystalReports__RuntimeEnabled
CrystalReports__RuntimeBaseUrl
CrystalReports__RuntimeApiKey
AttendanceConnector__InternalApiKey
ExternalLogin__Google__ClientSecret
BootstrapUsers__SuperAdmin__Password
```

Preview demo accounts are created only when `BootstrapUsers__Enabled=true`.
When enabled, Platform creates an idempotent demo tenant and company and requires
complete `Viewer`, `Admin`, and `SuperAdmin` entries under `BootstrapUsers`,
including a password for each account. Hosted preview deployments may enable the
seed so the web Demo Login buttons work against the hosted database. Set
`BootstrapUsers__Enabled=false` before the real production launch; existing
accounts remain regular Platform identities and should then be managed normally.

Each module resolves its own connection key first and falls back to
`ConnectionStrings__DefaultConnection`, so separate databases can be introduced
without changing module code.

SQL Server LocalDB connections, such as `(localdb)\MSSQLLocalDB`, are supported
only in the `Development` environment. Every hosted environment must set
`ConnectionStrings__DefaultConnection` through the process environment or a
secret-store integration to a SQL Server endpoint reachable from that host;
connection values and credentials must not be committed to tracked files.
Module-specific keys such as `ConnectionStrings__HR` remain optional overrides.
`ConnectionStrings__HangfireConnection` is also optional and falls back to
`ConnectionStrings__DefaultConnection` when it is omitted. The host rejects an
effective LocalDB connection outside `Development`, even when strict production
readiness checks are explicitly deferred.

For local operation, keep the hosted SQL Server connection in the ignored
`appsettings.json` and the LocalDB override in the ignored
`appsettings.Development.json`. The module design-time factories load the base
file, then the selected environment file, and finally process environment
variables. Preview the ordered migration operations without changing a database:

```powershell
.\scripts\Apply-ErpModuleMigrations.ps1 -Environment Production -WhatIf
```

After reviewing the preview, the exact production migration command is:

```powershell
.\scripts\Apply-ErpModuleMigrations.ps1 -Environment Production
```

The script temporarily sets both `DOTNET_ENVIRONMENT` and
`ASPNETCORE_ENVIRONMENT` for the run and restores their prior process values in
all exit paths. It does not print connection strings or require a process
connection variable when the design-time factories can resolve configuration
from the two appsettings files.

Contacts durable integration-event dispatch is configurable under
`Modules__Contacts__Messaging__Outbox__*`. Supported values are `BatchSize`,
`MaxAttempts`, `PollInterval`, `ProcessingTimeout`, `BaseRetryDelay`, and
`MaxRetryDelay`. Time values use .NET `TimeSpan` syntax (for example
`00:00:05`). Defaults are safe for development when the section is omitted.

Do not commit real values for these settings. Existing local runtime files are
left untouched so current login and development behavior are preserved while the
architecture is migrated.

Serilog is configured with the console sink only. Logger creation must not open
files, create database tables, or contact a relational database, so the API can
start before any module database is available. In hosted environments, collect
stdout/stderr with the platform log collector, sidecar, or agent and apply
retention, indexing, and routing there. Do not add `File` or `MSSqlServer`
sinks, `autoCreateSqlTable`, or another direct relational logging sink to the
API settings. When `OpenTelemetry:Enabled=true`, traces and metrics are sent to
the configured OTLP collector; this is the supported route for telemetry
export and remains independent of application log delivery.

Mail delivery is disabled by default for local development. With
`MailSettings:Enabled=false`, the SMTP fields may remain empty and the API can
start without an SMTP account. Any identity flow that needs to send an email
fails explicitly until mail delivery is configured; no network connection is
attempted while it is disabled.

Enable mail delivery only when all SMTP values are configured. For local
user-secrets, environment variables, or a deployment secret store, provide the
following complete set (the double underscore form is used for environment
variables):

```text
MailSettings__Enabled=true
MailSettings__Mail=noreply@example.com
MailSettings__DisplayName=ERP System
MailSettings__Password=<smtp-secret>
MailSettings__Host=smtp.example.com
MailSettings__Port=465
```

Production preflight requires `MailSettings:Enabled=true` and a non-placeholder
`MailSettings:Password`; the remaining SMTP fields are validated by the options
validator during host startup.

`AppSettings:FrontendUrl` is optional while mail delivery is disabled. Any
non-empty value must still be an absolute URL. When mail delivery is enabled,
the value must be a non-empty absolute HTTP or HTTPS URL because identity email
links are built from it.

The API also performs a strict production-readiness preflight when the hosting
environment is `Production`. The switch is configured with
`DeploymentValidation:EnforceProductionReadiness` (or the environment variable
`DeploymentValidation__EnforceProductionReadiness`) and defaults to `true` when
omitted. Keep it `true` before customer or public production. During preview
hosting, where a provider forces the ASP.NET Core environment to `Production`,
it may be set explicitly to `false` to defer strict checks for hosts, CORS,
frontend URLs, production secrets, mail, malware scanning, data-protection
key persistence, and startup migration switches. Basic distributed-runtime
validation and connection-string presence, placeholder, and SQL parsing checks
remain mandatory even when the switch is `false`.

JWT signing remains required for every running process. If the readiness switch
is explicitly `false` and `JwtOptions:Key` is blank, the API generates a strong
ephemeral key in memory for that process. Tokens issued with that key become
invalid after restart, and separate processes do not share it. This is only a
preview convenience; provide `JwtOptions:Key` through a secret store before
enabling readiness validation or serving customer/public traffic. Explicit
placeholder or weak keys are never replaced automatically.

When the hosting environment can be controlled, ASP.NET Core `Staging` remains
the preferred environment for non-production deployments. This switch exists
only for preview deployments that must run with `Production` as their
environment name.

`CorsSettings:AllowedOrigins` may be empty during local or preview hosting. The
API still registers its named browser policy, but no origin is allowed, so
cross-origin browser requests receive no CORS allow-origin header. Any
configured value must remain a complete HTTP or HTTPS origin without a path,
credentials, or wildcard. Strict production readiness continues to require at
least one HTTPS origin on a non-loopback host.

Crystal Reports runtime is a separate optional service. The API keeps its local
report storage and metadata available when the integration is disabled, and does
not contact or require the runtime during startup. Leave the integration disabled
for local development:

```text
CrystalReports__RuntimeEnabled=false
CrystalReports__RuntimeBaseUrl=
CrystalReports__RuntimeApiKey=
```

Enable it only when the separately deployed service is reachable over HTTP or
HTTPS and the internal key is supplied through a secret store or environment:

```text
CrystalReports__RuntimeEnabled=true
CrystalReports__RuntimeBaseUrl=https://crystal-runtime.example.com/
CrystalReports__RuntimeApiKey=<secret>
```

When enabled, production preflight requires an HTTPS URL and a non-placeholder
runtime key. When disabled, no runtime URL, key, or readiness network check is
required.

Swagger UI and the generated OpenAPI documents are enabled automatically in the
Development environment. In another environment, set
`SwaggerSettings:Enabled=true` to enable them explicitly. When enabled, only the
documentation endpoints (`/swagger` and `/swagger/{version}/swagger.json`) and
the development root redirect are anonymous; business and operational endpoints
still require a Bearer token according to their authorization policies.
