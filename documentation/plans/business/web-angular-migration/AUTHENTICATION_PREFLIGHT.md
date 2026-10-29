# S0 — Direct API Authentication Preflight

| Field | Value |
| --- | --- |
| Plan / scope | web-angular-migration / S0 authentication contract review |
| Date / source baseline | 2026-10-28; ERP HEAD `63b383061b6ca5311adf3a287b8a0238dc0dcad3` plus the current planning-only working-tree edits |
| Owner | Platform API/Security + Web Architecture |
| Status | Source audit complete; requester selected secure API Cookies (D17); DEC-027 remains Open for slice contract/proof |
| Runtime authority | No runtime source/schema/config change in this review; this is not S0 completion or S1/S2 execution authorization |
| Relationship | Reuse/extend existing Platform authentication and session orchestration; no new bounded context, BFF, identity provider, gateway or session-store service |

## 1. Outcome

The existing API can issue and validate bearer sessions for a direct client.
The inspected routes return access/refresh credentials in JSON; the normal API
bearer scheme does not consume Next authentication cookies. Next currently owns
HttpOnly cookie storage and proxies those credentials to the API. Angular cannot
inherit that server behavior by porting the login component.

Requester-approved target (D17, 2026-10-28): preserve reload/session continuity and keep access/refresh
credentials out of browser JavaScript through a bounded browser-cookie binding
inside the existing Platform API. The architecture choice is approved; the API
extension is not implemented. Keep the current bearer wire contracts for
Next/Mobile. [BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md)
defines the target transport; freeze the exact execution slice and Phase 00
before runtime, then prove the binding under DEC-027 at acceptance.

Source findings also show a refresh-contract mismatch that must be reconciled
before claiming reliable auth integration (RISK-018). Green helper/client tests
do not erase that gap. No known refresh failure is silently ported to Angular.

## 2. Verified current endpoint and credential map

Routes use `ApiRoutes.BaseRoute = api/v{version:apiVersion}/[controller]/[action]`.
Below, API version is v1 and casing follows existing client routes.

| Operation | Current route / input | Current result / boundary |
| --- | --- | --- |
| Password login | POST `/api/v1/auth/login`; userName, password | Full AuthenticationSessionResponse, tenant selection challenge, or company selection challenge; anonymous + authentication rate limit |
| Select tenant | POST `/api/v1/auth/selectTenant`; tenantSelectionToken, tenantId | Session or company selection challenge; anonymous, single-use challenge verification |
| Select company | POST `/api/v1/auth/selectCompany`; companySelectionToken, companyId | Session credentials; anonymous, single-use challenge verification |
| Switch company | POST `/api/v1/auth/switchCompany`; companyId + bearer | Server access check; new session credentials and revocation of the replaced session only |
| Verify session | GET `/api/v1/auth/session`; bearer | Server-verified user, tenant/company, available companies, roles/permissions, subscription/read-only and expiry; no access/refresh credential in this response |
| Refresh | POST `/api/v1/auth/refreshToken`; token, refreshToken | New credentials; both inputs are required by the current adapter even though token is nullable in the request record |
| Logout | POST `/api/v1/auth/logOut`; refreshToken | 204 on success; anonymous; finds/revokes the presented token, unknown/empty token is idempotent success |
| Revoke another user's sessions | PUT `/api/v1/auth/revokeRefreshTokenByUserId?userId=...`; bearer | Exact Users:Edit policy via PlatformPermissions.EditUsers; self-revocation through this admin action rejected |
| Realtime credential | GET `/api/v1/auth/realtimeToken`; bearer | Separate limited realtime JWT; `/hubs` consumes query credentials through RealtimeBearer |
| Account journeys | POST register/confirmEmail/resendConfirmationEmail/forgetPassword/resetPassword under `/api/v1/auth/` | Existing feature policy, challenges/rate limits and ProblemDetails remain authoritative |
| Change password / profile | PUT `/AccountInfo/ChangePassword`, other `/AccountInfo/[action]` routes; bearer | Existing Platform account commands; historical non-versioned URLs remain part of the inventory |
| Google | POST `/api/account/google-auth`; credential | Route/handler exist, but the inspected ExternalLoginAsync adapter returns ExternalLoginDisabled / 503; route/UI presence is not usable provider proof |

AuthenticationSessionResponse contains token, tokenExpiration, refreshToken and
refreshTokenExpiration alongside user/tenant/company identity. Selection challenges
are restricted selection credentials, not authenticated business sessions. Preserve
auto-resolution for one eligible tenant/company and super-admin execution context;
do not invent a mandatory selection step. Error mapping uses ProblemDetails with
Title = error code, Detail = description, and status from AuthenticationErrorType.

## 3. Source evidence and compatibility

Paths are relative to the repository root. Reinspect at implementation preflight.

| Concern | Reviewed source / symbol |
| --- | --- |
| Routes/actions/errors | `api/Modules/Platform/ErpSystem.Modules.Platform.Presentation/Features/Security/Authentication/V1/AuthController.cs`; adjacent AccountController.cs / GoogleAuthController.cs; `api/BuildingBlocks/ErpSystem.BuildingBlocks.Presentation/Common/Routes/ApiRoutes.cs`; Platform Presentation `Authentication/AuthenticationResultExtensions.cs` |
| Wire shapes / CQRS | Platform Application `Authentication/Orchestration/AuthenticationOrchestrationContracts.cs`, `AuthenticationRequests.cs`; handlers call existing module-owned adapters |
| Login/selection/session writes | `api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Identity/PlatformIdentityAuthenticationAdapters.cs`: PasswordLoginAsync, SelectTenantAsync, SelectCompanyAsync, IssueAsync, RefreshAsync, SwitchCompanyAsync, LogOutAsync, ExternalLoginAsync |
| Auth schemes / live checks | Adjacent `PlatformIdentityServiceCollectionExtensions.cs`: default Bearer + RealtimeBearer, ValidateSessionAsync; Platform Application `SessionValidation/SessionValidationService.cs` |
| Refresh entity / helper tests | Adjacent `PlatformIdentityEntities.cs`: PlatformRefreshToken; Platform Tests `PlatformRefreshTokenTests.cs`, `RefreshTokenSessionPolicyTests.cs` |
| Current browser storage | `web-next/src/lib/auth/cookies.ts`: HttpOnly/Secure/SameSite=Lax, bounded access-token chunking; no raw credentials returned by normal sanitized browser session |
| Current Next refresh/logout | `web-next/src/lib/auth/backend-session.ts`; `web-next/src/app/api/auth/session/route.ts`; adjacent logout/route.ts; `web-next/src/lib/api/proxy-security.ts` |
| Current context verification | `web-next/src/lib/auth/company-switch-verification.ts`; `SessionContext.tsx` and `SessionContext.switch.test.tsx`; Platform live session validation checks membership/company/session/stamp |
| Native bearer consumer | `mobile-react/src/platform/auth/data/remote/auth/auth-remote-data-source.ts`, auth-endpoints.ts; native secure storage is not a browser persistence implementation |
| Host browser transport | `api/ErpSystem.Api/Hosting/HostCorsSettings.cs`, HostInfrastructureServiceCollectionExtensions.AddHostCors; Program.cs middleware; OperationalFoundationTests CorsService cases |

Configured-file evidence only: API launch profiles advertise HTTPS localhost:7037
and HTTP localhost:5293. appsettings.json lists localhost origins for ports
3000/4000/5173/5174/5175 in the recorded schemes; Angular's usual 4200 is absent.
Environment/secret/host overrides were not read, and no effective running origin
was verified. Use a deliberate HTTPS dev pair, provisionally app
`https://localhost:4200` -> API `https://localhost:7037`, and add only the exact app
origin if that pair is selected. These addresses are proposals, not applied config.
Production origins must be explicitly configured/verified before deployment.

## 4. Persistence alternatives and recommendation

| Option | Reuses current JSON/bearer routes | Reload continuity | Consequence / disposition |
| --- | --- | --- | --- |
| Tokens only in scoped browser memory | Yes | No session recovery after full reload/tab loss | Smallest API footprint, but changes current persistent browser behavior; use only after explicit acceptance of that difference |
| Tokens in localStorage/sessionStorage/IndexedDB or JS-readable cookies | Yes | Varies by store | Exposes credentials to same-origin scripts; not recommended as a shortcut around the missing API browser binding |
| Existing API issues host-only HttpOnly browser cookies | Requires bounded Platform browser transport extension | Yes, subject to expiry/revocation and browser proof | Selected by requester under D17; preserves credential isolation and continuity without another server; requires CSRF, size, refresh and coexistence proof |

HttpOnly prevents direct JavaScript access to cookie values, not XSS-driven
authenticated actions. Preserve Angular sanitization, CSP and redacted diagnostics.
An encrypted credential in web storage is not a replacement for this boundary if
the same script can access/use its key.

### Proposed browser-cookie binding (not frozen wire routes)

The following records the original source-audit recommendation. D17 now selects
Cookies; the target route/cookie/request contract is owned by
BROWSER_AUTHENTICATION_CONTRACT rather than inferred from this earlier outline.

- Add only a browser-facing adapter in the owning Platform API, reusing ISender,
  current commands/adapters/session validation. Define browser login/select/refresh/
  switch/logout endpoints whose responses contain sanitized session/challenge
  metadata, never access/refresh secrets. Existing token endpoints keep their wire
  contracts for retained clients. No new users/session tables or EF migration is
  assumed; verify against actual implementation impact before stating N/A.
- Store API-issued access and refresh values in application-specific host-only
  HttpOnly/Secure cookies with explicit path/expiry/SameSite. Cookie names must not
  collide with Next, especially on localhost where ports do not isolate cookies.
  Preserve both values needed for refresh even after the access JWT expires.
- Reuse the current bearer signature/audience/session/scope validation for cookie
  credentials. Explicit Authorization requests retain bearer behavior, with no
  fallback from a supplied invalid header to cookies and no mixed-identity scope.
  Review cookie auth on historical routes, binary/files and session endpoints.
- Protect all cookie-authenticated state changes, including login/selection/
  refresh/logout, through server antiforgery and allowed-Origin checks appropriate
  to those endpoints. CORS and SameSite are additional controls, not the CSRF
  verifier. Keep bearer consumers compatible; no global antiforgery requirement
  for native header-only calls.
- For the proposed cross-origin HTTPS pair, initialize a server-generated
  antiforgery request token via an explicit allowed-origin response. Keep its
  secret paired cookie host-only; store the request token in Angular memory and
  send the reviewed header only to the API origin. Angular's default cookie
  reader cannot read a host-only cookie on a different API host, and its standard
  XSRF header behavior does not cover arbitrary cross-origin requests.
- Send credentials only to the configured API origin; exact CORS allowlist,
  credentialed preflight, correlation exposure and no wildcard origin. Prefer
  same-site HTTPS app/API deployment when using Lax cookies. Cross-site hosting
  changes cookie/browser-policy constraints and reopens this proof; do not silently
  widen Domain/SameSite or assume third-party cookies always work.
- Bound cookie/header sizes for a realistic maximum-permission account. Reuse
  framework chunking if suitable; validate missing/partial chunks, stale-chunk
  deletion, proxy limits and fail-closed behavior. Do not copy Next's numbers as
  untested deployment limits or expand claims to avoid the test.
- No new distributed lock/Redis/session service. Coordinate refresh/switch/logout
  in the client and verify concurrent tabs; server correctness remains authoritative
  when a client lock is absent. Do not broadcast credentials between tabs.
- Realtime uses the existing short-lived limited token and renewed context, not
  an access/refresh credential in a query string. Private session/auth responses
  remain no-store and outside service-worker data caching.

## 5. Source findings requiring reconciliation

Canonical status, owner and trigger: RISK-018 in KNOWN_RISKS. These are observed
source/contract differences, not measured exploitation or a failed runtime test.

| Finding | Observed current source | Required disposition before auth integration acceptance |
| --- | --- | --- |
| F1 Refresh session identity and lifetime | RefreshAsync revokes the old token and calls IssueAsync; IssueAsync creates a new SessionId and now+14-day expiry. Authentication_Configuration describes same-session rotation; entity tests construct that shape manually and preserve expiry. | Reconcile the canonical policy and actual adapter with orchestration/persistence tests. Do not claim helper tests exercise RefreshAsync. No new full token-family engine is required by this finding. |
| F2 Grace conflict and reuse reach | Inactive rotated-token handling returns Unauthorized even inside the documented 30-second grace; later revocation searches the old SessionId while the current refresh path issues a different SessionId. | Prove concurrent refresh outcomes and subsequent-reuse revocation at the actual adapter/HTTP boundary; resolve 409 versus 401 before choosing client recovery. RISK-004's accepted lineage limit does not waive this mismatch. |
| F3 Logout with stale credentials | LogOutAsync revokes the token matched by hash only. A stale rotated token does not by itself identify/revoke its replacement through this path. | Verify latest-session logout, refresh/logout races and lost responses; clear local auth without falsely claiming server revocation. Define recovery for uncertain outcomes. |
| F4 External login availability | Google handler reaches ExternalLoginAsync, which returns ExternalLoginDisabled. | Classify the existing journey accurately and resolve the actual provider path before claiming Google parity. PROD-002 hosted proof remains separate; route/UI presence is insufficient. |

No corrective source change is bundled into this audit. These findings affect
existing Next/Mobile too, so any fix requires the owning API workflow, current
consumer regression evidence, and source/profile reconciliation in the same slice.

## 6. Proposed session and context contract

States: unauthenticated -> credential attempt -> optional tenant/company selection
-> session verification -> authenticated. Pending/temporary failure is distinct
from definitive rejection; don't clear a valid session on timeout, 429 or 5xx.
Do not grant permissions from decoded unverified claims or cached browser identity.

Refresh has one active attempt per client owner; serialize it against company
switch and logout, reject stale completion by generation, and limit auth retries.
Do not automatically replay material writes after an uncertain result. A failed
company switch retains the verified old context only when still valid; success
clears old-context queries/selection, verifies the target company from Session,
then resumes reads/realtime. A late old response cannot populate the new context.

On logout, clear local context/queries/connections and browser credentials through
the API's deletion endpoint even if session revocation encounters a service error.
Report server revocation separately. Without contacting the API, Angular cannot
delete host-only HttpOnly cookies; offline/network failure must block protected
bootstrap locally and reconcile on return, not promise cookie deletion occurred.
Define explicit cross-tab logout/context invalidation without sharing secrets.

Preserve current login/selection/layout as closely as possible through shared
Angular forms/dialogs/theme; compare Next at the same data/viewports/EN/AR/themes.
No redesigned login, new mandatory selector or registration policy is implied.

## 7. Verification and exit evidence

Executed 2026-10-28 against the recorded source baseline:

- Platform `dotnet test ...ErpSystem.Modules.Platform.Tests.csproj --no-restore`
  filtered to AuthControllerAuthorizationTests, PlatformRefreshTokenTests,
  RefreshTokenSessionPolicyTests, AuthenticationSelectionChallengeStoreTests,
  PlatformSessionValidationOwnershipTests and PlatformAuthenticationTokenWireCompatibilityTests:
  31 passed, 0 failed. Existing analyzer warnings remain; no source was modified.
- Web `npm test -- src/lib/auth/backend-session.test.ts src/lib/auth/cookies.test.ts
  src/lib/auth/SessionContext.switch.test.tsx src/lib/api/proxy-security.test.ts
  src/app/api/auth/logout/route.test.ts src/lib/auth/company-switch-verification.test.ts`:
  6 files / 50 tests passed, 0 failed (runner reported Vitest 4.1.11).

These prove scoped helper/policy/client behavior. They do not prove SQL refresh
orchestration, new browser cookies, effective CORS, live auth, CSRF or Angular UI.

Before DEC-027 can close, implement the selected persistence binding under its
authorized exact execution contract, record the effective
origin/config contract, reconcile RISK-018 where applicable, and run:

1. Real API/database login -> selection if required -> Session -> refresh -> Session
   -> logout; reject revoked/expired/disabled/no-company/membership states.
2. Concurrent refresh across tabs; grace and late reuse; refresh/switch/logout
   races; old-context rejection and no uncertain-write replay.
3. Browser reload/direct-link continuity; absence of secrets in JSON/web storage/
   URLs/telemetry; maximum claim/cookie sizes and failed/partial-cookie cleanup.
4. Credentialed allowed-origin and disallowed-origin calls; preflight; missing,
   invalid and stale antiforgery request tokens; reject cross-origin attacks and
   mixed header/cookie identities without breaking bearer-only clients.
5. Temporary service failure/retry versus definitive logout; network loss during
   switch/refresh/logout; multi-tab coordination; realtime reconnect with the new
   context; retained Next and native auth regression.

No live environment/database/browser mutation was performed. This audit completes
the source/contract investigation deliverable only. S0 still includes toolchain,
route inventory, translations/forms/vendor and contract-generation proofs.

## 8. Next bounded execution unit

The binding decision is approved under D17 and the version-2.0
[execution contract](decomposition/platform-browser-authentication.md) is registered
for preflight only. Phase 00 evidence, profiles and recipes live in the Platform
browser-authentication feature package. Its gate report identifies non-release
proof still needed before application coding. Existing API/Next/native sources
remain intact; a preparation Active marker is not runtime readiness.

Subsequent state: the user authorized the proposed session repair. The same
feature now owns S0-AUTH-R1 runtime under SESSION_RUNTIME_READINESS.md; the original
source-drift findings above are historical baseline. Actual adapter changes and
SQL/retained-client evidence are in
[SESSION_IMPLEMENTATION_REPORT](../../../modules/platform/features/platform-browser-authentication/verification/SESSION_IMPLEMENTATION_REPORT.md).
Cookie endpoints and browser binding remain pending; D17/no-BFF unchanged.

## 9. Primary documentation reviewed

- [Angular security / HttpClient XSRF](https://angular.dev/best-practices/security):
  client helpers require server verification and standard header attachment is
  relative/same-origin; cross-origin transport needs explicit reviewed integration.
- [ASP.NET Core CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0):
  explicit origins and credentials policy; CORS is not authorization/CSRF protection.
- [ASP.NET Core antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0):
  cookie-backed browser workflows need a coordinated request-verification contract.
- [OWASP HTML5 security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html):
  JavaScript-accessible web storage is unsuitable for session identifiers/secrets.
- [ASP.NET Core ChunkingCookieManager](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.cookies.chunkingcookiemanager?view=aspnetcore-10.0):
  framework capability to assess, not proof of maximum account/proxy compatibility.
