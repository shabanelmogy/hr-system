# Browser authentication — measured Phase 00 proofs

Date: 2026-10-28. Owner: Platform API/Security and Web Architecture.
Scope: S0-AUTH preflight. Three integration probes passed, zero failed/skipped.
These are framework/persistence feasibility proofs; deployed ERP browser endpoints
and actual session lifecycle acceptance remain pending under DEC-027/RISK-018.

## 1. Token and Cookie capacity

The actual Platform claim-material builder and JWT signer processed all 258
permissions found in the compiled permission catalogs. Synthetic long tenant/role
names exercise large payloads; these are examples, not a maximum-role guarantee.
No real account, credential, Cookie value or signing key is recorded.

| Roles | JWT bytes | Access Cookie parts including marker | Own Cookie header bytes |
| --- | --- | --- | --- |
| 1 | 10,468 | 5 | 11,026 |
| 10 | 11,793 | 6 | 12,381 |
| 25 | 13,993 | 6 | 14,581 |

See [token-capacity.json](results/token-capacity.json). Framework chunking uses
ChunkSize=3000 and rejects a missing chunk. Chromium also sent two separate
14-KiB access Cookies, representing simultaneous Next/API ownership on one host:
the combined Cookie header was 29,217 bytes and received 200. An additional
16-KiB Cookie caused Kestrel to reject the next request with 431 before middleware.
Ports do not isolate Cookies. This does not measure every deployed proxy or the
combined full real-client Cookie sets.

Implementation bounds selected from this proof: API access JWT <=14 KiB (14,336
ASCII bytes), at most five data chunks plus marker at ChunkSize=3000, own complete
Cookie header budget <=16 KiB. Reject excess/malformed material without truncating
claims. Check issuance capacity before committing session replacement/rotation;
an oversized response must not strand an already-revoked previous session. The
client must distinguish this failure from expired authentication.

The tested Kestrel default aggregate request-header budget is 32 KiB. Preserve
headroom for other headers and both clients; lower limits in IIS/proxies require
deployment proof under PROD-017/019 before release. Do not silently increase a
production limit or promise arbitrary role counts. Actual client coexistence,
all Cookie families and stale/extra chunk rejection remain runtime acceptance.

## 2. Real SQL optimistic concurrency

The existing integration helper created an isolated GUID-named SQL Server LocalDB
database, applied the existing Platform migrations and removed the database after
the probe. No production/user database or schema was changed, and no new migration
was created. Two independent EF/Identity scopes loaded the same user concurrency
stamp, revoked the old refresh row and attempted a replacement concurrently.

Exactly one writer succeeded; the other returned Identity ConcurrencyFailure.
The database contained two rows: the revoked old token and one active successor.
The losing insert did not persist. See [sql-concurrency.json](results/sql-concurrency.json).

Reuse this existing UserManager/EF atomic save and optimistic concurrency boundary;
no separate lock service is justified by this probe. Runtime work must use that
boundary for rotation/switch/logout and explicitly map ConcurrencyFailure to 409.
The current adapter maps generic Identity failures to validation errors and still
has RISK-018's session/lifetime/grace/logout discrepancies. This probe does not
prove that unmodified RefreshAsync or its competing business operations are correct.

## 3. Trusted HTTPS, CORS and antiforgery

Real Chromium used two dynamic localhost HTTPS origins and the existing development
certificate, with HTTPS validation enabled. Certificate expiry is 2028-11-21 UTC.
The harness reused host CORS configuration and ASP.NET antiforgery, with explicit
Origin checking, Secure/HttpOnly/host-only/Lax Cookies and an in-memory request token.

| Request | HTTP result |
| --- | --- |
| Approved origin, valid token | 204; exactly one test write |
| Missing/invalid request token | 400; no write |
| Unapproved write origin | 403; no write |
| Unapproved credentialed CORS read | Browser denied response |
| Oversized Cookie header | 431 |

The antiforgery Cookie was absent from document.cookie. See
[https-antiforgery.json](results/https-antiforgery.json) and
[browser-probe.mjs](browser-probe.mjs). Header overflow is read from a same-origin
page because rejection before CORS has no allow-origin response header; a
cross-origin fetch exposes a network error instead of a readable 431.

On Windows the PEM certificate needed an in-memory PKCS#12 re-import before
Kestrel could use its private key, following the official certificate loader.
No certificate file, machine trust store or running listener was modified.
The proposed port 4200 was already occupied; this proof deliberately used dynamic
ports. Current ERP CORS/launch settings remain unchanged. Freeze an available
Angular development port and apply the exact origin during runtime setup; occupied
4200 must not be stopped or silently replaced. Deployment origins remain centrally
owned under PROD-017/019, not a newly invented production configuration.

## 4. Reproduction and remaining boundary

Run from the repository root with .NET 10, Windows SQL LocalDB (or the existing
ERPSYSTEM_TEST_SQLSERVER_CONNECTION isolated-test override), Node, installed
web-next Playwright/Chromium and the trusted development certificate:

```powershell
dotnet test api/Tests/ErpSystem.IntegrationTests/ErpSystem.IntegrationTests.csproj --filter FullyQualifiedName~BrowserAuthenticationPreflightTests
```

Test owner: [BrowserAuthenticationPreflightTests.cs](../../../../../../api/Tests/ErpSystem.IntegrationTests/BrowserAuthenticationPreflightTests.cs).
Reports contain measurements only. Tests create/drop a disposable database and
short-lived HTTPS listeners; ERP application behavior/configuration is unchanged.
The three feasibility uncertainties are resolved at this level. Phase 00 still
must reconcile the exact runtime gate and session policy before implementation;
Phase 06 needs actual browser-auth routes, real adapter races, retained Next/native
regression and business permission/credential-isolation tests. No live acceptance,
Angular UI or RISK-018 closure is claimed here.

Set `$env:ERPSYSTEM_TEST_BROWSER_AUTH_PREFLIGHT='1'` before the command to enable
the browser probe explicitly. Without that switch it reports Skipped, so ordinary
API test gates do not require a local Web install/private development certificate.
The recorded full preflight run enabled it and had zero skipped tests. An enabled
probe fails when prerequisites or trust are broken; it never bypasses TLS validation.

## 5. Full API gate and documentation verification

`dotnet restore ErpSystem.sln` passed; Release build passed with zero errors and
473 inherited warnings (none from the new probe source). The first full Release
test run had 1125 passes, two SQL integration failures and one intentional browser
skip. Both failures passed when targeted, then a full diagnostic repeat passed
1127 tests, zero failures and one skip. No corrective source edit separated the
runs. The opted-in browser preflight separately passed all three tests with zero
skips. Keep the non-reproduced SQL failures under canonical
[FOLLOW-011](../../../../../plans/notes/FOLLOW_UPS.md); their cause is unproven.

Planning check passed with the existing education-module/erp-platform-template
warnings. Documentation check passed all 197 recipes. The feature/plan package
contains 32 Markdown files, 151 valid local links and 40 existing manifest paths;
diff whitespace checks passed. These repository checks do not replace actual
new browser-auth endpoint/adapter/client acceptance.

Primary sources used to interpret/fix the probes:

- [ASP.NET Core Cookie chunking](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.cookies.chunkingcookiemanager?view=aspnetcore-10.0).
- [EF Core concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency).
- [Kestrel header-size limit](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserverlimits.maxrequestheaderstotalsize?view=aspnetcore-10.0).
- [ASP.NET Core CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0) and [antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0).
- [Fetch credentials/CORS response behavior](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
- [Kestrel Windows certificate loader, .NET 10](https://github.com/dotnet/aspnetcore/blob/v10.0.0/src/Servers/Kestrel/Core/src/Internal/Certificates/CertificateConfigLoader.cs).
