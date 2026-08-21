# Authentication configuration

Authentication and infrastructure secrets must be supplied through environment variables in hosted environments. A development-only JWT key may remain in `appsettings.Development.json`, but it must never be reused outside local development.

## Local setup

In `Development`, the API uses the local development key from `appsettings.Development.json` or the built-in development fallback when no key is configured. Production and non-development environments require `JwtOptions__Key` from secure configuration.

`appsettings.Development.json` points to SQL LocalDB by default. If LocalDB is not available on your machine, override the connection strings with user secrets.

Run these commands from the `api/HrManagementSystem.Api` directory when local overrides are needed, replacing each placeholder with a development value:

```powershell
dotnet user-secrets set "JwtOptions:Key" "<at-least-32-random-characters>"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<sql-connection-string>"
dotnet user-secrets set "ConnectionStrings:HangfireConnection" "<hangfire-connection-string>"
dotnet user-secrets set "MailSettings:Mail" "<smtp-account>"
dotnet user-secrets set "MailSettings:Password" "<smtp-password>"
dotnet user-secrets set "ExternalLogin:Google:ClientId" "<google-client-id>"
dotnet user-secrets set "Syncfusion:LicenseKey" "<syncfusion-license>"
```

The Hangfire dashboard uses application permissions rather than a separate
username and password. Assign `Hangfire:View` to a role from the role
permissions page. Configure `HangfireSettings:AllowedHosts` for every backend
host that is allowed to serve the dashboard; local development defaults to
`localhost`.

Bootstrap accounts are optional. To create an initial administrator on an empty database, configure `BootstrapUsers:Admin:UserName`, `Email`, `FirstName`, `LastName`, and `Password` through user secrets or environment variables. No default account or password is created when those values are absent.

Hosted environment variable names use double underscores, for example `JwtOptions__Key` and `ConnectionStrings__DefaultConnection`.

All secrets that previously existed in repository history must be rotated. Removing them from the current files does not invalidate exposed historical values.

## Refresh-token rotation

The application intentionally uses a simple rotation model rather than token-family lineage. Each successful refresh revokes the presented token, creates a replacement with the same `SessionId`, and returns the new access and refresh tokens.

- A rotated token reused within 30 seconds is treated as a concurrent request and returns `409 Conflict` without clearing the session.
- A rotated token reused after that grace period is treated as suspicious. All active refresh tokens for the same `SessionId` are revoked.
- Invalid or expired credentials return `401 Unauthorized`. Temporary backend failures, timeouts, rate limits, and refresh conflicts must not clear browser cookies.
- Inactive token history is pruned to keep storage bounded. Active sessions are never removed by history pruning.

This design avoids the operational complexity of full token-family tracking while still detecting the normal stolen-token reuse case. It does not provide complete ancestry tracking across many successive rotations; use token families only if the application's risk profile later requires that stronger guarantee.
