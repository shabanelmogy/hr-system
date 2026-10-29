# S0-AUTH-R2 — Browser transport implementation

Date: 2026-10-28. Owner: Platform API/Security. The implementation adds direct
browser sessions to the existing API under D17. No Angular UI is delivered here.
R2 API transport is **Verified**: actual browser/SQL, Cookie unit, retained-client
focused and final full API gates passed. Section 5 records exact limits/results.

## 1. Delivered API

`/api/v1/browser-auth` exposes csrf, login, select-tenant, select-company, session,
refresh, switch-company, logout and realtime-token. The controller sends existing
commands/queries through ISender. Authenticated browser responses are typed
`BrowserAuthenticationSessionResponse { isAuthenticated, user }` with verified
SessionContext. Access/refresh credentials never appear in those JSON responses.
Selection JWTs remain restricted, one-use challenges; realtime returns only its
existing bounded dedicated JWT. Browser responses and Cookie-authenticated API
responses use `Cache-Control: no-store, private`, including authentication failures.

The existing Bearer JWT handler accepts the new access Cookie only when no explicit
Authorization header exists. It reuses signature/expiry/live session/stamp/tenant/
company validation. Explicit invalid headers cannot downgrade. Browser endpoints
reject Authorization entirely. AuthController and GoogleAuthController are marked
bearer-only so credential-emitting legacy routes cannot be authorized with Cookies.
Profile/business APIs retain normal shared policy. Hubs/Hangfire do not use the
new Cookie fallback; existing realtime/header transport remains.

## 2. Security and bounded transport

Secure/HttpOnly/host-only/SameSite=Lax/Path=/ Cookies use distinct approved __Host
names. Access Cookie expiration equals the server-issued refresh expiration so an
expired signed access token remains available for refresh; JWT expiry still denies
ordinary authorization. The existing framework ChunkingCookieManager handles
3000-character chunks, at most five data chunks plus marker. JWT bound is 14336
ASCII bytes; owned incoming Cookie material is bounded to 16384 bytes. Duplicate,
partial, extra, malformed and oversized material fails closed. Browser issuance
guard runs before the existing adapter mutates/saves session rows; excess claims
are rejected without truncation or revoking the previous valid session.

All browser mutations, including anonymous login/selection/refresh/logout, require
HTTPS, exact approved Origin and the ASP.NET antiforgery pair via X-ERP-XSRF.
Cookie-authenticated business mutations receive the same checks. Header-only
clients retain their current protocol without browser CSRF requirements. OPTIONS
stays effect-free. Empty browser origins disable browser authentication; configured
origins must be exact HTTPS origins also present in the host CORS list.

BrowserAntiforgery preserves the global ASP.NET Cookie/header settings consumed by
Next/Hangfire. It temporarily aliases only the browser Cookie/header for framework
generation/validation, then restores the original request. `GetTokens` may return
a null CookieToken when reusing the existing Cookie: only new material is written.
For expired access, a signature-validated principal is used only for CSRF identity
binding and restored before command execution; it does not authorize the request.
Re-bootstrap csrf after credential changes; never automatically replay a write.

Logout clears the owned Cookie families even if revocation fails. A simulated
revocation outage returns 503, not success; the fixture verifies one deliberately
unrevoked SQL session remains until database disposal. This distinguishes local
cleanup from confirmed server revocation. Conflicts/transient refresh failures
do not delete a newer valid session. API unreachability cannot delete HttpOnly
Cookies; the Angular owner must fence local bootstrap and reconcile when online.

## 3. Actual browser and SQL evidence

`BrowserAuthenticationTransportTests` runs production controllers, auth registration,
JWT signer/validator, live access/session sources, password Identity flow, one-use
selection storage, existing middleware and migrated Platform SQL in an isolated
two-origin HTTPS app. A real user/tenants/companies/role/permission are seeded in a
disposable database. Test control endpoints (expiry, capacity, read-only and logout
failure injection) are fixture-only; none exist in application runtime.

Trusted Chromium checks login/tenant/company selection, one-use challenge denial,
sanitized JSON, actual page reload, HttpOnly Cookie attributes, access expiry 401
then CSRF-bound refresh 200, successful company switch, bounded realtime JWT,
business write/permission denial, missing/invalid header and legacy isolation,
origin/CSRF rejection, partial chunk rejection, precommit capacity rejection with
old session still usable, read-only 423 and refresh/logout availability, Cookie
cleanup and truthful 503 revocation failure. Header-only legacy Session/read/write
continues to work without Origin/CSRF. Shared ASP.NET antiforgery Cookie names stay
unchanged. See [browser-transport.json](results/browser-transport.json).

Fixture-only composition disables ValidateOnBuild because unrelated registered
module handlers are deliberately absent; scope validation stays enabled. Actual
host/module composition is covered separately by full API tests. No TLS bypass:
Chromium uses installed trust, Node API requests use `--use-system-ca`. Report/error
output is redacted and contains no credential values. Earlier failures were test
composition/assertion/trust issues plus the corrected null reused CookieToken;
they are not hidden by relaxed production checks.

Cookie unit tests cover bounds, chunk roundtrip at 14 KiB, duplicate/partial/extra
names, Next Cookie isolation, admission before response writing, origin validation
and unchanged global antiforgery defaults. There are 17 cases. Real refresh/logout/
switch concurrency remains covered by the 11 R1 SQL adapter scenarios.

## 4. Local activation and client handoff

Development browser target is `https://localhost:4210` -> API
`https://localhost:7037`. Port 4200 was occupied and was not stopped/replaced.
4210 was checked available; recheck before starting the future Angular server.
No user-secret/local live configuration was silently edited. Configure:

```text
BrowserAuthentication:AllowedOrigins = ["https://localhost:4210"]
CorsSettings:AllowedOrigins = existing exact origins plus "https://localhost:4210"
```

Use the existing trusted localhost certificate setup. Keep existing Next origins
in the CORS list. The tracked appsettings.example.json includes a production
placeholder example, not actual deployment configuration. Origins/proxy limits
remain release checks under PROD-017/019. No CORS wildcard, Domain attribute,
SameSite widening, new gateway, BFF, Redis or session database was added.

Angular transport: only the exact API origin gets `credentials: include`; GET csrf
first, keep requestToken in memory, send X-ERP-XSRF on mutations, re-bootstrap csrf
after login/select/refresh/switch. GET session restores the verified context;
expired access can refresh using its retained paired Cookies. One refresh owner,
generation fencing, serialized transitions and no mutation replay remain mandatory
in the actual Angular consumer. No access/refresh in local/session storage or
cross-tab messages. Build the shared foundation/login/shell in their next slice.

## 5. Verification and closure boundary

Restore and Release build passed: zero errors, 432 existing warnings, no warnings
from new browser transport sources. Final full Release diagnostic repeat passed
**1157 tests, zero failures/skips**, 12 projects, Chromium probes explicitly enabled.
All 187 integration tests and 354 Platform tests passed, including real browser
transport, 17 Cookie cases, 11 session SQL scenarios and module migration/idempotence.
Retained Next: 7 files/38 tests passed (including Hangfire proxy); native: one auth
data-source test passed. See [browser-runtime-verification.json](results/browser-runtime-verification.json).

Before that final repeat, a full run hit an HR SQL pre-login handshake timeout;
its focused recheck and complete repeat passed without HR/timeout source changes.
FOLLOW-011 records that observed connection failure and the unknown underlying
cause. Earlier R2 feature failures (namespace public-surface registration/test
fixture issues) were corrected and rechecked, not classified as inherited failures.

Planning/scaffold/UI/execution guard regressions, planning checks and all 197
documentation recipes passed. Manifest contains 65 existing evidence paths;
no future Angular sources are registered. Technical Phase 06 is Verified for R1/R2
API transport; broader Angular consumer and production acceptance remain separate.
Customer education N/A: no new visual UI. Existing migrations apply to disposable test databases, and the
model has no pending change. No schema migration/backfill/user database alteration
is required by this source/transport change. No new visual Web/Mobile surface;
five-point creation/edit/view/list/mock-data UI audit is N/A on both. Existing
Next/native focused auth tests are retained regression, not full UI/device proof.

R1/R2 API transport acceptance does not claim Angular consumer behavior or Google
provider enablement. RISK-018 retains its external-provider boundary under PROD-002;
PROD-017/019 retain deployment readiness; FOLLOW-011 retains earlier intermittent
SQL gate history. No production release or full Angular migration readiness claim.

Primary references used during implementation/diagnosis:

- [ASP.NET antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0).
- [GetTokens caller-owned Cookie persistence](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.iantiforgery.gettokens?view=aspnetcore-10.0).
- [Framework antiforgery implementation](https://github.com/dotnet/aspnetcore/blob/v10.0.0/src/Antiforgery/src/Internal/DefaultAntiforgery.cs).
- [Hangfire ASP.NET antiforgery use](https://github.com/HangfireIO/Hangfire/blob/master/src/Hangfire.AspNetCore/Dashboard/AspNetCoreDashboardContext.cs).
- [Node system CA trust](https://nodejs.org/docs/latest-v24.x/api/cli.html#--use-system-ca).
- [Routing/MapControllers](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-10.0).
