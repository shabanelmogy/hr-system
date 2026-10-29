# S0-AUTH-R2 — Browser transport runtime entry

Date: 2026-10-28. User explicitly authorized continuing after R1 verification.
Same active feature, Platform owner; overall migration Draft. R1 is Verified.
R2 implements the browser routes/Cookies/security already approved under D17.

| Gate | Exact R2 result / evidence |
| --- | --- |
| G0 | Passed: reuse existing Platform commands/JWT/live sessions; distinct browser transport, no new identity owner/schema |
| G1 | Passed: R1 semantics verified; browser contract freezes login/select/session/refresh/switch/logout/realtime; sanitized SessionContext response |
| G2 | Passed: existing JWT event path distinguishes explicit headers/Cookies, bearer-only metadata prevents legacy credential leakage; measured bounded Cookies, precommit issuance guard, ASP.NET antiforgery/explicit origin |
| G3 | Passed: no new client UI; current Next/native bearer unchanged, browser HTTP verification Required; actual Angular screens later |
| G4 execution | Ready: bounded HTTP/JWT/SQL/browser scenarios, current migration verification, safe rollback below; acceptance is implementation exit, not unknown product scope |
| G4 release | Release-only PROD-016/017/019: hosting exact origins/proxy limits/restore; cannot change R2 frozen semantics; no deployment authorized |

## Exact implementation choices

- Reuse default Bearer JWT validation/live session checks. OnMessageReceived uses
  bounded browser access Cookies only when no Authorization header exists and the
  endpoint is not marked bearer-only. Explicit invalid headers never downgrade.
  Browser endpoints reject any Authorization header/ambiguous identity. Mark the
  credential-emitting legacy auth/provider controllers bearer-only; profile APIs
  remain ordinary guarded business APIs. Hangfire/hubs retain their existing
  transport; the shared antiforgery Cookie/header defaults used by Next/Hangfire
  are preserved via a request-local browser transport alias. Their JSON contracts
  and current header clients remain. No new identity/session service.
- Browser endpoints use versioned `browser-auth` routes, no-store/private,
  credentialed HTTPS requests with exact `BrowserAuthentication:AllowedOrigins`.
  Configured origins must be HTTPS and a subset of existing CorsSettings origins;
  empty list disables browser access fail-closed. Development will use a free
  explicit port (4210 was available); no occupied listener/config silently replaced.
- Cookies use approved __Host names, HttpOnly/Secure/Lax/Path=/ and server refresh
  expiration. ChunkSize 3000, max five data chunks, max access JWT 14336 ASCII
  bytes, own incoming Cookie header <=16384 bytes. Reject partial/extra/duplicate
  material before assembly. Bounded cleanup clears only this transport's names.
  A module-local issuance guard checks capacity before the existing adapter mutates
  or saves session rows; nonbrowser bearer issuance stays unchanged.
- Server antiforgery pair with X-ERP-XSRF and explicit Origin protects all browser
  mutations (including anonymous login/select/refresh/logout) and any business
  mutation authenticated using Cookies. OPTIONS remains effect-free. Never assume
  CORS/SameSite alone protects mutations. GET csrf requires an approved Origin too.
- Antiforgery uses the signed Cookie principal even when access JWT has expired,
  only during antiforgery generation/validation; the original HttpContext.User is
  restored before commands run. This preserves identity-bound CSRF across access
  expiry without granting expired tokens authorization. Refresh still validates
  the actual access/refresh pair/live state. Re-bootstrap CSRF after credential
  issuance/identity changes; no automatic mutation replay.
- Browser responses use verified SessionContext query; raw access/refresh values
  never enter JSON. No database/contract-domain change; no new permissions/UI.
  Cookie removal is attempted even if logout revocation fails, and failure is
  reported separately. Conflicts/transient failures do not delete a newer session.

## Verification / rollback

Exercise actual controller routes, security middleware, JWT callbacks, bounded
parser/issuance guard and real session adapter/migrated SQL in an isolated HTTPS
test app. Verify sanitized login/select/session/refresh/switch/logout, CSRF across
access expiry/identity transition, permission/read-only and legacy header isolation,
oversize before commit, stale/partial/extra chunks, denied/missing origins/CSRF,
no-write negative cases and browser Cookie attributes/reload. Retained-client
regression/full API gates are Required. No feature-complete claim before results.

Rollback is code/config rollback, no schema/backfill. Clear this transport's
Cookies as needed; never un-revoke sessions. Existing bearer clients remain on
their current route/wire. Production origins remain deployment-owned; no wildcard
or cross-site/SameSite widening. No new customer UI, Phase 07 education N/A here.
