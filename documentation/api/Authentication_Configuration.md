# Authentication configuration

Authentication and infrastructure secrets must be supplied through environment variables in hosted environments. A development-only JWT key may remain in `appsettings.Development.json`, but it must never be reused outside local development.

## Local setup

In `Development`, the API uses the local development key from `appsettings.Development.json` or the built-in development fallback when no key is configured. Production and non-development environments require `JwtOptions__Key` from secure configuration.

`appsettings.Development.json` contains development behavior overrides but no
database credentials. Configure LocalDB or another SQL Server through user
secrets or environment variables before starting the API.

For Visual Studio local development, keep the Next.js server-side proxy pointed at
the local API (`http://localhost:5293`):

```env
BACKEND_URL=http://localhost:5293
NEXT_PUBLIC_API_URL=http://localhost:5293/api/v1
```

The JWT implementation is registered once as a scoped `JwtProvider`. Both
`IJwtProvider` and `IRealtimeTokenProvider` resolve that same scoped instance;
the concrete registration must remain present because the realtime contract
resolves it directly.

Run these commands from the `api/ErpSystem.Api` directory when local overrides are needed, replacing each placeholder with a development value:

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

The tracked `ErpSystem.Api/appsettings.example.json` contains placeholders only;
live `appsettings*.json` files are local and ignored. Keep database, JWT, SMTP,
Hangfire, bootstrap-user, and external-provider values in user secrets for local
work and in the deployment secret store for hosted environments. The migration operator uses the same
`ConnectionStrings__*` convention, so a module can be extracted by setting its
own connection variable without changing source or committing a second config
file. Rotate any credential that was ever committed before the sanitized
configuration was introduced.

All secrets that previously existed in repository history must be rotated. Removing them from the current files does not invalidate exposed historical values.

## Refresh-token rotation

The application intentionally uses a simple rotation model rather than token-family lineage. Each successful refresh revokes the presented token, creates a replacement with the same `SessionId`, and returns the new access and refresh tokens.

- A rotated token reused within 30 seconds is treated as a concurrent request and returns `409 Conflict` without clearing the session.
- A rotated token reused after that grace period is treated as suspicious. All active refresh tokens for the same `SessionId` are revoked.
- Invalid or expired credentials return `401 Unauthorized`. Temporary backend failures, timeouts, rate limits, and refresh conflicts must not clear browser cookies.
- Inactive token history is pruned to keep storage bounded. Active sessions are never removed by history pruning.

This design avoids the operational complexity of full token-family tracking while still detecting the normal stolen-token reuse case. It does not provide complete ancestry tracking across many successive rotations; use token families only if the application's risk profile later requires that stronger guarantee.

## Tenant and company selection

Tenant- and company-selection JWTs are short-lived, scope-specific, and single-use. Their `jti` values are stored in `AuthenticationSelectionChallenges`; the matching row is deleted atomically on the first selection attempt. Deploy the `AddAuthenticationSelectionChallenges` migration before enabling this flow. Changing the configured selection-token lifetime does not make a consumed token reusable.

The login sequence is always `credentials -> explicit tenant -> explicit company -> session`: a successful credentials or external-login check returns a tenant-selection challenge whenever at least one tenant is available, even when the list contains one tenant. After `SelectTenant`, the API returns a company-selection challenge whenever at least one active company is available, even when the list contains one company. The API never preselects the first option and never issues an authenticated session from either shortcut. Access and refresh session issuance occurs only after `SelectCompany` validates and consumes the company-selection token.

Authenticated company switching rotates into a new session and revokes only the replaced session. It does not reuse a login selection token and it does not revoke the user's other devices or sessions.

## SignalR realtime authentication

Browser SignalR transports place the bearer token in the `access_token` query
parameter. The dedicated realtime JWT must therefore remain bounded and contains
only identity and session context: user name/identifier, session identifier,
security stamp, tenant identifier, and company identifier. It must not copy role,
permission, tenant-role, email, or tenant display-name claims from the normal
access token.

After the realtime JWT signature, audience, scope, expiry, and active session are
validated, `RealtimePrincipalClaimsLoader` reads the user's current system roles,
active roles for the selected tenant, and known permission claims from the
database. `GeneralHub` then builds its role, tenant-role, permission, tenant, and
company groups from that hydrated principal. This keeps authorization current
when role assignments change and prevents permission growth from exceeding IIS
URL/query-string limits.

Do not treat increasing IIS `maxUrl` or `maxQueryString` as the primary fix. The
token-size regression test must remain below 2,048 characters even when the
source access principal contains hundreds of permissions. No database migration
is required for this authentication flow.
