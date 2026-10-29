# Hosted browser login configuration repair — 2026-10-29

Corrective maintenance of the existing browser transport, not a new feature or
activation of a second migration child. The requester needs local Angular to use
either the local API or the existing hosted test API through the tracked `.env`.

## Evidence before implementation

- Hosted `/health/live`:200. Hosted `/api/v1/browser-auth/csrf` with exact
  Origin `https://localhost:4210`:403 Authentication.BrowserOriginDenied, without
  Access-Control-Allow-Origin/Allow-Credentials. Failure occurs before passwords.
- Local API7037 refused the connection; frontend4210 was available.
- The local publish-owned ignored appsettings has CORS localhost3000 only and no
  BrowserAuthentication section. This is source configuration evidence, not a
  read of effective remote settings. The remote error combines HTTPS and origin
  rejection; it does not by itself identify which remote condition failed.
- All three browser transport Cookies currently hardcode Lax. Cross-site fetch
  from localhost to runasp needs Secure SameSite=None where explicitly enabled;
  browser third-party-Cookie restrictions still apply independently.
- Documentation baseline passed269 recipes. Existing unrelated worktree changes,
  including package-lock.json, are preserved. No remote settings were changed.

## Existing-system relationship / rules matrix

| Concern | Existing owner and change | Enforcement / acceptance |
| --- | --- | --- |
| Public client endpoint | Existing Angular `.env`/ERP_API_ORIGIN; reuse | No token persistence, proxy or BFF |
| Browser origins | Platform BrowserAuthentication + host CORS; configure exact4210 | Both lists agree; HTTPS/CSRF checks stay mandatory |
| Cross-site transport | Extend existing Platform Cookie writer with explicit opt-in | Default Lax; opt-in None on write/CSRF/delete, Secure/HttpOnly/host-only retained |
| Trusted request scheme | Existing host/IIS forwarding; reuse | No fabricated proxy address, wildcard trust or bypass of IsHttps |
| Sessions/permissions | Existing Platform adapters; unchanged | No DTO, authorization, database or bearer/native change |

## Edge cases and impact

| Case | Decision / verification |
| --- | --- |
| Option absent/false | Preserve existing Lax Cookies and existing tests |
| Option true | All owned auth/antiforgery/deletion Cookies use None with Secure |
| Unknown origin / missing CSRF | Retain rejection; no AllowAnyOrigin or CSRF bypass |
| Frontend is HTTP or wrong port | Not approved browser origin; use trusted HTTPS4210 |
| Proxy reports HTTP internally | Remains rejected until deployment topology is verified |
| Browser blocks third-party Cookies | Host browser acceptance remains separate; no JavaScript credential workaround |
| Persistence/migrations / domain / native / retained Next | N/A; no runtime change to these owners |

Required verification: Cookie option unit tests, existing origin/antiforgery
regressions, full API Release restore/build/test; production artifact preparation.
Hosted success requires publishing the reviewed API/configuration and real browser
CSRF/login/session/reload/refresh/logout. PROD-017/019 retain this gate; a local
pass does not close it. No deployment authorization is inferred from a build.

## Verified correction and limits

- Final full solution gate: restore and Release build passed; full Release test
  run passed **1160/0 failed/0 skipped**, including188 Integration tests, using
  the verified local SQL test instance and installed Chrome. Build reported313
  existing analyzer warnings and zero errors. Logs are local under
  `.codex-tmp/hosted-auth-repair/` (restore.log, build-final.log, test-verified.log).
  This final run supersedes the earlier environment failures for the current
  source gate; it does not establish a hosted release pass.
- Cookie tests:19 passed/0 failed/0 skipped, including Lax default and explicit
  None for session/antiforgery/deletion with unchanged security flags.
- Five BrowserAuthentication integration cases passed on existing local SQL
  Server2022 with integrated authentication and disposable fixture databases.
  Browser transport now exercises both same-site Lax and actual split-site None
  (localhost frontend versus127.0.0.1 API, both covered by the trusted certificate).
  Actual password/tenant/company, JWT/SQL, reload, expiry/refresh, CSRF/origin
  rejection, bearer compatibility, permission checks and logout are verified.
  [Cross-site receipt](results/browser-transport-cross-site.json) records None,
  crossSite=true, HTTPS validation and denied origin/missing antiforgery outcomes.
- The actual local API with publish-owned settings returned CSRF200 plus exact
  origin/credentials CORS and Secure/HttpOnly/None; unknown Origin returned403.
  This HTTP probe used local certificate bypass, separately from the trusted
  browser/SQL fixtures above. The temporary local API was stopped after probing.
- API folder publish prepared at `.codex-tmp/hosted-auth-repair/publish`; its
  settings were checked for exact4210 and explicit cross-site mode without
  printing credentials. This contains local publish settings; keep it outside Git.
- Initial full tests could not use absent LocalDB; process-only override selected
  the verified local SQL2022 instance. Initial browser attempts lacked Playwright's
  bundled Chromium. Download hit system-drive capacity and was stopped; subsequent
  runs used installed Chrome via ERPSYSTEM_TEST_BROWSER_CHANNEL=chrome and a
  workspace temporary directory, following official Playwright channel support.
  No security check or failing test was skipped to obtain the browser result.
- The pre-publication baseline was hosted health200 / CSRF403. The subsequent
  hosted smoke below supersedes that connectivity finding. This agent did not
  deploy or change remote settings.
- Planning check passed with the two inherited education/template migration
  warnings; full documentation check passed269 recipes. Repair guide links and
  scoped diff whitespace checks passed. S2-A6 remains the sole migration child;
  this corrective auth configuration does not implement its application selector.

Reproduction prerequisites: configure ERPSYSTEM_TEST_SQLSERVER_CONNECTION to an
approved SQL test server with isolated database create/drop privileges;
ERPSYSTEM_TEST_BROWSER_AUTH_PREFLIGHT=1 enables the real probes. Optional
ERPSYSTEM_TEST_BROWSER_CHANNEL=chrome uses installed Chrome, otherwise Playwright's
bundled Chromium is used. Local fixtures need the existing trusted localhost/IP
certificate; do not disable browser TLS validation to count this proof.

Official basis: [Microsoft CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0),
[SameSite Cookies](https://learn.microsoft.com/en-us/aspnet/core/security/samesite?view=aspnetcore-10.0),
[trusted forwarded headers](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0).

## Subsequent hosted smoke — 2026-10-29

After the requester reported publishing and a browser HTTP401 page, fresh
unauthenticated HTTP probes found hosted health200, csrf200 with exact
HTTPS4210 CORS/credentials and Secure/HttpOnly/None antiforgery Cookie. Root `/`
and `/swagger/index.html` returned401. Anonymous session returned401 as expected.

Installed Chrome with normal TLS validation opened local Angular HTTPS4210 and
used the existing demo administrator action against the hosted API. Login200,
navigation to `/apps`, six owned Secure/HttpOnly/None Cookies, and cleanup
logout204 passed in an isolated browser context. No account/credential/token or
raw Cookie was recorded; no remote deployment was performed by this agent.
This is a hosted login/logout smoke, not full refresh/reload/scope/release proof.

Current Program.cs enables Swagger for Development or SwaggerSettings:Enabled,
and maps the anonymous root redirect only in that case. Local publish-owned
SwaggerSettings:Enabled is false. A missing route then encounters the configured
authenticated fallback policy. The observed root/swagger401 is consistent with
Swagger disabled on the host; effective remote configuration was not read.
The requester was asked which exact URL showed401 before choosing a change.
Do not disable the authorization fallback or infer that an anonymous session401
means the login controller is broken. PROD-019 remains open for broader hosted
acceptance. No Swagger exposure/configuration change was made in this audit.

### Explicit test-host Swagger request

The requester then explicitly requested Swagger on the hosted test site. The
publish-owned ignored appsettings now has SwaggerSettings:Enabled=true; the
WebDeploy profile launches the HTTPS Swagger URL. Production example defaults
and authorization fallback remain unchanged. A refreshed folder publish was
started locally with DOTNET_ENVIRONMENT/ASPNETCORE_ENVIRONMENT=Production on7047:
root302 to Swagger, Swagger HTML200, v1 OpenAPI JSON200 (3.0.4,381 paths), and
anonymous accessible-modules401. Source and published settings both contained
true. This local HTTP probe bypassed certificate validation; it is not a new
hosted/browser proof. Temporary process stopped after verification. Current
site needs republishing/restarting to consume the change; remote environment
SwaggerSettings__Enabled overrides JSON. No remote publish was performed here.
