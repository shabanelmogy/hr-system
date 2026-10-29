# Authentication configuration

Authentication and infrastructure secrets must be supplied through environment variables in hosted environments. A development-only JWT key may remain in `appsettings.Development.json`, but it must never be reused outside local development.

## Local setup

In `Development`, the API uses the local development key from `appsettings.Development.json` or the built-in development fallback when no key is configured. Production and non-development environments require `JwtOptions__Key` from secure configuration.

The git-ignored `appsettings.json` holds the hosted SQL Server connection, and the
git-ignored `appsettings.Development.json` holds the `Development` overrides; see
`api/ErpSystem.Api/CONFIGURATION.md`.

For Visual Studio local development, keep the Next.js server-side proxy pointed at
the local API (`http://localhost:5293`):

```env
BACKEND_URL=http://localhost:5293
NEXT_PUBLIC_API_URL=http://localhost:5293/api/v1
```

Token issuance is registered once as the scoped `JwtAuthenticationTokenService`
behind `IAuthenticationTokenService`; access, selection, and realtime tokens are
all issued through it.

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

Bootstrap accounts are optional. Preview bootstrap runs only when `BootstrapUsers:Enabled=true` and requires complete `SuperAdmin`, `Admin`, and `Viewer` entries (UserName, Email, FirstName, LastName, Password). No account is created when bootstrap is disabled.

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

The application intentionally uses a simple rotation model rather than token-family lineage. Each successful refresh revokes the presented token, creates a replacement with the same `SessionId` and original absolute refresh expiry, and returns the new access and refresh tokens. Refresh does not restart the 14-day lifetime.

- A retained rotated token reused within 30 seconds (inclusive), while its session still has an active successor, returns `409 Conflict` without revoking that successor. A session already signed out is rejected with `401`.
- A rotated token reused after that grace period is treated as suspicious. All active refresh tokens for the same `SessionId` are revoked.
- Invalid or expired credentials return `401 Unauthorized`. Temporary backend failures, timeouts, rate limits, and refresh conflicts must not clear browser cookies.
- Inactive token history is pruned to keep storage bounded. Active sessions are never removed by history pruning.
- Concurrent session saves use the existing Identity concurrency stamp and EF atomic save. One writer commits; the loser returns `409` (`User.RefreshTokenUpdateConflict`). Reuse inside grace uses `User.RefreshTokenAlreadyRotated`. A failed suspicious-reuse revocation surfaces its save error rather than falsely confirming that the session was revoked.
- Logout with a retained refresh hash revokes active tokens for its `SessionId`, including a rotated successor; other devices remain active. Unknown/pruned hashes or an already inactive session are idempotent success. A concurrency conflict is not confirmed logout; the caller must reconcile/retry. Bounded history means a pruned hash cannot identify its successor; this is not a token-family guarantee.
- Replacement material and company eligibility are resolved before row mutation. Revocation and insertion share one save. Disabled/locked/stamp-changed accounts cannot refresh; switch rechecks current stamp and a live source session so a revoked/expired source cannot be resurrected.

This design avoids the operational complexity of full token-family tracking while still detecting the normal stolen-token reuse case. It does not provide complete ancestry tracking across many successive rotations; use token families only if the application's risk profile later requires that stronger guarantee.

## Tenant and company selection

Tenant- and company-selection JWTs are short-lived, scope-specific, and single-use. Their `jti` values are stored in `AuthenticationSelectionChallenges`; the matching row is deleted atomically on the first selection attempt. The `AuthenticationSelectionChallenges` table is part of the Platform `InitialPlatform` baseline migration. Changing the configured selection-token lifetime does not make a consumed token reusable.

The login flow resolves the smallest safe scope automatically. A regular user with exactly one eligible tenant and one eligible company receives a session immediately. With one tenant and multiple companies, the API skips tenant selection and returns only a company-selection challenge. With multiple tenants, it returns a tenant-selection challenge; selecting a tenant with one company issues the session directly, while multiple companies return a company-selection challenge. Selection challenges remain short-lived, scope-specific, single-use, and are required whenever an explicit choice is still necessary. A `super_admin` never receives tenant or company selection: the API resolves the first/default eligible tenant that has company access and then its first/default eligible company for the execution context. The system role still governs cross-tenant administration; resolving an execution context does not weaken tenant/company authorization or filters.

Authenticated company switching rotates into a new session and revokes only the replaced session. It does not reuse a login selection token and it does not revoke the user's other devices or sessions.

Refresh/logout/switch competing from the same loaded stamp cannot all commit.
If logout commits before a switch, the switch is denied or conflicts. If switch
commits first, logout of the old session does not cancel the newly created session;
clients must serialize transitions and fence late results. No blind issuance or
switch retry is performed by the API. Actual migrated SQL/JWT adapter coverage is
`api/Tests/ErpSystem.IntegrationTests/PlatformSessionLifecycleTests.cs`; bounded
execution and acceptance belong to the Platform browser-authentication feature.
The API retains its existing JSON/bearer routes. R2 adds separate browser Cookie
routes described below; bearer clients do not need to change their wire protocol.

## Direct browser Cookie sessions

`/api/v1/browser-auth` exposes GET csrf/session/realtime-token and POST login,
select-tenant, select-company, refresh, switch-company and logout. These actions
reuse the existing Platform commands, JWT and live session validation. Successful
authenticated responses contain `{ isAuthenticated: true, user: SessionContext }`;
no access/refresh credentials are returned in JSON. Temporary selection JWTs and
the bounded dedicated realtime JWT retain their existing limited purpose.

Enable with exact HTTPS `BrowserAuthentication:AllowedOrigins`, each also present
in `CorsSettings:AllowedOrigins`. Empty browser origins disable Cookie fallback
and deny browser endpoints. Local Angular target is `https://localhost:4210` and
API `https://localhost:7037`; preserve existing Next origins and listeners. No live
local/production configuration is automatically changed. The example config uses
a placeholder production origin; deployment remains PROD-017/019.

Browser calls use credentials only for the configured API. First GET csrf and keep
requestToken in memory, then send X-ERP-XSRF on mutations. Repeat csrf after
login/select/refresh/switch. Explicit Origin and ASP.NET antiforgery are required
for anonymous browser auth mutations and Cookie-authenticated business mutations.
The browser Cookie pair is isolated from shared ASP.NET antiforgery defaults used
by Hangfire/Next. Expired signed access identity is used only for CSRF binding,
never authorization. Business permission/read-only gates still apply.

Cookies `__Host-erp-angular-access`, `__Host-erp-angular-refresh` and
`__Host-erp-angular-antiforgery` use Secure/HttpOnly/Path=/, no Domain. SameSite
defaults to Lax. Set `BrowserAuthentication:UseCrossSiteCookies=true` explicitly
when the approved HTTPS frontend and API are on different sites, such as local
Angular and the hosted test API. This uses None for session, antiforgery and
deletion Cookies; exact origin allowlists and CSRF remain mandatory. The frontend
origin must also be in host CORS with credentials enabled. Browser restrictions
on third-party Cookies may still require a same-site hosting topology. Access
Cookie survives to server refresh expiry to permit paired refresh; JWT expiry
still denies access. Access JWT <=14336 ASCII bytes, chunk size 3000, at most five
data chunks plus marker, own incoming Cookie budget <=16384 bytes. Malformed,
extra/partial/duplicate/oversized material fails closed. An issuance guard checks
capacity before session mutation/commit. No claim truncation or proxy-limit raise.

Explicit Authorization always takes the bearer path; invalid headers never fall
back to Cookies. Browser-auth endpoints reject Authorization. Existing Auth and
Google credential-returning controllers are bearer-only; Cookie authentication
cannot authorize legacy SwitchCompany and expose raw credentials. Profile/business
APIs accept guarded Cookie authentication. Hubs/Hangfire keep existing transports.
Responses use no-store/private. Logout attempts owned-Cookie deletion even on
revocation failure, returning a distinct failure instead of success; an unreachable
API cannot delete Cookies. Client transitions must serialize/fence late results.

Actual trusted Chromium/SQL proof, limitations and reproduction:
`documentation/modules/platform/features/platform-browser-authentication/verification/BROWSER_IMPLEMENTATION_REPORT.md`.
No Angular UI or Google-provider enablement is implied by this API transport.

## SignalR realtime authentication

Browser SignalR transports place the bearer token in the `access_token` query
parameter. The dedicated realtime JWT must therefore remain bounded and contains
only identity and session context: user name/identifier, session identifier,
security stamp, tenant identifier, and company identifier. It must not copy role,
permission, tenant-role, email, or tenant display-name claims from the normal
access token.

After the realtime JWT signature, audience, scope, expiry, and active session are
validated (the `RealtimeBearer` scheme checks the session through
`ISessionValidationService`), the user's current roles and permission claims are
loaded from the database, and `GeneralHub` builds its role, tenant-role,
permission, tenant, and company groups through `GeneralHubGroups`. This keeps authorization current
when role assignments change and prevents permission growth from exceeding IIS
URL/query-string limits.

Do not treat increasing IIS `maxUrl` or `maxQueryString` as the primary fix. The
token-size regression test must remain below 2,048 characters even when the
source access principal contains hundreds of permissions. No database migration
is required for this authentication flow.
