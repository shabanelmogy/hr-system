# Platform Browser Authentication — Target Transport Contract

| Field | Value |
| --- | --- |
| Plan / owner | web-angular-migration / Platform API-Security + Web Architecture |
| Decision | D17: requester approved secure Cookies inside the existing API on 2026-10-28 |
| Scope | Persistent direct-API browser sessions; current bearer consumers retained |
| Document status | R1 session correctness Verified; R2 transport implemented with actual Chromium/SQL focused proof; current final evidence in BROWSER_IMPLEMENTATION_REPORT |
| Execution boundary | Input to the first version-2.0 feature execution contract and Phase 00; this file is not that execution contract or an Active roadmap marker |
| Evidence | AUTHENTICATION_PREFLIGHT; DEC-027 remains Open for binding proof; RISK-018 gates affected session guarantees |

## 1. Selected behavior and ownership

Angular calls the existing ERP API directly. The API issues host-only Secure,
HttpOnly cookies; browser JavaScript receives verified session metadata and short
selection challenges only, never access/refresh session credentials. Reload and
direct-link entry recover the server-verified session or offer sign-in when it
expires. No BFF, extra identity service, Redis, gateway or new session table is
introduced by this choice. Existing Platform CQRS/session/access owners remain.

The requester selected the persistence architecture. Concrete transport choices
below are the bounded implementation design, not claims of completed validation.
Before runtime, freeze them in the exact feature execution contract after the
remaining slice gates/preflight. Do not re-open persistence preference merely
because implementation/testing is still outstanding.

## 2. Browser route and response contract

New browser routes are distinct from existing JSON/bearer endpoints. Proposed
controller route is `/api/v1/browser-auth`; all responses use no-store/private.
All mutations require the browser origin and antiforgery checks in section 4,
including anonymous login/selection/refresh/logout. Apply the existing
authentication rate-limit policy to credential/challenge/refresh operations.

| Method / suffix | Typed input | Output / credential behavior |
| --- | --- | --- |
| GET `/csrf` | No credentials required; credentialed browser fetch | `{ requestToken: string }`; server sets host-only antiforgery cookie; request token is not an auth credential |
| POST `/login` | Existing AuthenticationPasswordLoginRequest | Existing tenant/company challenge shape when choice is needed; otherwise set access/refresh cookies and return `{ isAuthenticated: true, user: AuthenticationSessionContextResponse }` |
| POST `/select-tenant` | Existing AuthenticationTenantSelectionRequest | Company challenge or sanitized authenticated response/cookies; existing one-use challenge checks |
| POST `/select-company` | Existing AuthenticationCompanySelectionRequest | Sanitized authenticated response/cookies; no raw access/refresh fields |
| GET `/session` | Browser access cookie | Sanitized authenticated response from current Session query; expired/missing/revoked access yields 401, temporary unavailability remains distinguishable |
| POST `/refresh` | No access/refresh body; read paired HttpOnly cookies | Rotate through the current Platform session command after RISK-018 reconciliation; replace cookie pair and return verified sanitized session |
| POST `/switch-company` | Existing AuthenticationSwitchCompanyRequest | Check current authenticated session/company access, replace browser cookies on success and return verified target-company session |
| POST `/logout` | No refresh-token body; read browser cookie | Revoke the owned session according to reconciled logout policy; delete access/refresh chunks and antiforgery cookie; 204 only for completed/idempotent outcome, report revocation service failure separately |
| GET `/realtime-token` | Browser access cookie | Existing bounded realtime JWT only; use dedicated realtime scheme and re-acquire after context change |

Reuse ISender and existing command/query contracts; add browser presentation DTOs
only where sanitation/transport differs. Reuse AuthenticationResultExtensions for
stable ProblemDetails; do not invent a generic success envelope. Selection JWTs
are short-lived restricted challenges stored in memory, not persisted session
credentials. Keep existing automatic tenant/company resolution and public account
policy. Register/confirm/reset/invitation journeys keep their current owner paths;
no provider implementation is added here.

## 3. Cookie and authentication isolation

- Application-specific names: `__Host-erp-angular-access`,
  `__Host-erp-angular-refresh`, and `__Host-erp-angular-antiforgery`. All are Secure,
  host-only, Path=/, HttpOnly; no Domain attribute. Use SameSite=Lax for the
  reviewed same-site HTTPS topology. Antiforgery request token comes from JSON,
  not from a JavaScript-readable auth cookie.
- Access JWT expiry still governs authorization. Retain the access cookie value
  until the paired refresh expiry because the current refresh contract needs the
  expired signed access token too; retaining the cookie does not extend JWT validity.
  Bound cookie lifetime to actual server-issued refresh expiration, never a client
  constant. Re-login/switch/logout removes stale chunks with the same attributes.
- Phase 00 measured the actual claim builder/signer with 258 permissions and
  synthetic long role names. Selected API access JWT bound is 14 KiB (14,336
  ASCII bytes), ChunkSize=3000, at most five data chunks plus marker, own complete
  Cookie header budget <=16 KiB. Validate capacity before committing issuance or
  rotation; do not strand an old revoked session on overflow or truncate claims.
  Incomplete/extra/malformed chunks fail closed. Framework roundtrip/partial-chunk
  rejection and two simultaneous synthetic client Cookies were proven; actual
  client/deployment limits still require acceptance. See the measured report below.
- Add an explicit browser-cookie authentication path that reuses the current JWT
  validation and live session/stamp/tenant/company checks. A supplied Authorization
  header always follows the existing bearer path; invalid header never falls back
  to a cookie. Browser-auth endpoints reject ambiguous bearer-plus-cookie identity.
- Existing credential-emitting `/api/v1/auth` actions remain bearer/JSON contracts.
  In particular, cookie authentication must not authorize the legacy SwitchCompany
  endpoint and return raw credentials to a browser. Restrict legacy auth actions
  to their current schemes; test this boundary explicitly.
- Business APIs may accept the new cookie scheme through reviewed shared auth
  policy; all existing named permissions/read-only/entitlement/record scopes still
  apply. Cookie-authenticated mutations additionally require antiforgery. Header-only
  Next/native callers retain existing contracts without a browser token requirement.
- Never read Next cookie names or forward browser cookies to arbitrary URLs. Do
  not log tokens/cookie headers or persist them in local/session storage, IndexedDB,
  URLs, service-worker caches, Signals snapshots or cross-tab messages.

## 4. Origin and request-verification contract

Development target: HTTPS app `https://localhost:4210`, API
`https://localhost:7037`. These are the selected design defaults, not applied or
running configuration. Phase 00 verifies certificates, port availability and
effective config. Production origins remain deployment-owned under PROD-017/019;
use explicit same-site HTTPS origins, no wildcard/subdomain allowance by default.
Cross-site hosting reopens cookie compatibility proof without silently widening
Domain/SameSite or depending on unrestricted third-party cookies.

Corrective revision2026-10-29 for the requester-selected hosted test API:
local Angular remains `https://localhost:4210`; hosted API is
`https://shabanhrms.runasp.net`. Exact4210 must be approved in both API browser
and CORS allowlists. An explicit `BrowserAuthentication:UseCrossSiteCookies=true`
uses Secure/HttpOnly/host-only SameSite=None for the three owned transport Cookies
and their deletion; the default remains Lax for the reviewed same-site topology.
Origin/CSRF/HTTPS enforcement is unchanged. This split-site topology reopens
actual hosted Cookie compatibility proof under PROD-017/019, including browser
third-party-Cookie policy; it is not a claim that changing `.env` alone enables it.
See [repair evidence](../../../modules/platform/features/platform-browser-authentication/verification/HOSTED_CONFIGURATION_REPAIR.md).

Phase 00 trusted Chromium HTTPS/antiforgery/CORS proof passed on dynamic ports.
Port 4200 was already occupied: keep that listener and select/apply an available
exact Angular origin during runtime setup. Checked-in ERP configuration was not
changed. Tested Kestrel aggregate header limit is 32 KiB; simultaneous synthetic
Next/API Cookies consumed 29,217 bytes. Verify complete client headers and deployed
proxy limits before release rather than silently increasing server limits.

Browser requests use credentials only for the exact configured API origin. Host
CORS must explicitly permit that app origin and required headers/credentials.
API cookies require server antiforgery checks; CORS/SameSite are not substitutes.
Angular's standard XSRF reader/header behavior is not assumed to cover a different
API host/origin.

Bootstrap `/csrf`, retain its request token in memory, and send header
`X-ERP-XSRF` for browser mutations. Enforce a configured allowed Origin on those
mutations, including login/selection/refresh/logout. Validate the ASP.NET Core
antiforgery cookie/request-token pair before commands run; malformed/missing
tokens yield 400/403 with no state change. Renew the request token after identity
changes and recover from stale tokens without automatically replaying a material
write. Reject request-token minting to an unapproved browser Origin. Keep OPTIONS
preflight unauthenticated and effect-free.

## 5. Session correctness and race contract

RISK-018 F1-F3 session drift was repaired and SQL-verified in R1. The transport
uses same-session refresh rotation with bounded absolute
refresh lifetime; company switching creates a replacement session and revokes
the old session only. Concurrent reuse inside the existing grace yields conflict
without clearing a valid replacement; later suspicious reuse follows the owning
session-revocation policy. No full multi-generation token-family system is added.

The adapter/persistence tests must exercise actual issuance/refresh/logout, not
only manually construct entity rows. Verify the intended effect of logout using
the latest token and its race with refresh; define truthful failure/revocation
results when the request carries stale material. RISK-018 remains Open until the
relevant guarantees are proven. Its Google-disabled finding is outside this
transport slice and still gates eventual provider parity under PROD-002.

The Phase 00 SQL probe proved that existing Identity UserManager/EF optimistic
concurrency atomically keeps one replacement and rolls back the competing insert.
R1 now reuses that boundary and maps ConcurrencyFailure to 409. Its eleven actual
adapter SQL scenarios prove refresh/switch/logout/reuse races; primitive preflight
evidence stays separate from this implementation proof.

Client coordination uses one refresh attempt per owner, serializes refresh with
switch/logout, and fences stale completions with context generation. Validate
multi-tab behavior without transmitting credentials. On switch, guard dirty forms,
pause new writes, cancel/fence reads, verify the server-selected company and clear
old data/realtime before showing the new scope. Never blindly replay a write.

On 429/5xx/timeout keep temporary unavailability distinct from definitive expiry.
On logout response, local state/connections are cleared; Set-Cookie deletion is
sent even if revocation fails, with that failure reported distinctly. If the API
is unreachable, Angular cannot delete host-only HttpOnly cookies: keep protected
bootstrap blocked locally and reconcile before resuming, without claiming server
revocation or cookie deletion occurred.

## 6. Scope, compatibility and next execution contract

The coherent initial unit is Platform browser authentication transport plus the
required refresh/logout reconciliation. Existing bearer wire DTOs/URLs and native
secure storage remain. No new permissions, user model, domain table or migration
is planned; verify schema N/A during implementation preflight. Existing permission
checks remain independent of authentication. Login/selection/session/refresh/
switch/logout require authentication/challenge/CSRF policies, not invented
business claims. Users:Edit remains the independent existing administrative revoke
permission; no new admin revoke UI/action is included.

This API/transport unit adds no customer screen. Web proof uses a focused browser
HTTP harness; native work is regression verification. The actual Angular login,
selectors, shell and context UI remain S2 consumers after shared S1 foundations,
with the same Next design/layout and shared components. The new cookie contract
must be usable without making S1 depend on unfinished S2 UI.

The version-2.0 contract now exists at
[platform-browser-authentication](decomposition/platform-browser-authentication.md).
One Active API owner completed S0-AUTH preflight and R1 session correctness, and
now implements authorized R2 browser transport under BROWSER_RUNTIME_READINESS.md. The initial
Phase 00 applied books/current-evidence manifest and recipes are registered under
documentation/modules/platform/features/platform-browser-authentication.
Current browser implementation and acceptance are recorded in
[BROWSER_IMPLEMENTATION_REPORT](../../../modules/platform/features/platform-browser-authentication/verification/BROWSER_IMPLEMENTATION_REPORT.md).
The API transport adds no Angular UI and does not assert overall migration readiness.

Measured evidence and selected implementation limits:
[Phase 00 proof report](../../../modules/platform/features/platform-browser-authentication/verification/PREFLIGHT_PROOF_REPORT.md).
Three tests passed with zero failures/skips; framework feasibility is distinct
from actual API endpoint/session acceptance and does not close DEC-027/RISK-018.

## 7. Acceptance checklist

- [ ] Actual browser login/selection/session/reload/refresh/switch/logout against
  the real API/test database; maximum-permission user and all supported roles.
- [x] No raw access/refresh credentials in tested browser JSON/storage/URLs/logs;
  chunk overflow/partial/stale cookies fail safely and logout clears all chunks.
- [x] Existing credential-returning routes cannot authenticate through cookies;
  bearer-only clients work, invalid header cannot downgrade to cookie auth, mixed
  identities are denied, exact business permission/read-only denial still works.
- [ ] Allowed/disallowed Origin, preflight, missing/invalid/stale antiforgery token,
  login CSRF and cookie-authenticated business mutations are verified.
- [ ] Actual refresh adapter proves same-session/lifetime/grace/reuse policy;
  concurrent refresh, logout and company-switch races include lost responses.
- [ ] Next and native bearer regression; context isolation and realtime reconnection;
  no mutation replay, silent credential broadcast or false revocation success.
- [ ] Narrow tests and required API gates; browser harness plus live evidence;
  canonical auth API/Web/Mobile evidence and note dispositions reconciled.
- [ ] DEV origins/certificates/config proof; production origin/deployment/restore
  gates remain referenced by central notes with their existing ownership.

Primary security documentation and current source/test baseline are recorded in
[AUTHENTICATION_PREFLIGHT](AUTHENTICATION_PREFLIGHT.md). No new runtime success
is claimed by the requester's architectural selection.
