# Platform Browser Authentication — Applied api Profile

## 1. Ownership
AuthController -> ISender -> Application handlers -> Platform identity/session adapters.
## 2. Approved scope
R1 Verified. S0-AUTH-R2 browser transport authorized by BROWSER_RUNTIME_READINESS.md and central BROWSER_AUTHENTICATION_CONTRACT; existing bearer unchanged, no new UI/schema.
## 3. Domain
PlatformRefreshToken stores hashes/session/expiry. No new aggregate implemented.
## 4. Rules
Session adapter now preserves refresh SessionId/absolute expiry, maps grace/save conflicts to 409 and revokes retained same-session successors on logout. RISK-018 external provider/browser acceptance remains open.
## 5. Client decisions
Existing bearer clients retained; no new UI/native Cookies.
## 6. Contracts
BrowserAuthController exposes the nine versioned browser routes; typed sanitized SessionContext response and CSRF request token. Existing bearer DTOs/routes retained.

2026-11-09 corrective system-session increment (FOLLOW-032): eligible Super Admin authenticates without any Tenant or company. Canonical current contract and verification boundary: [system-session execution](SUPER_ADMIN_SYSTEM_SESSION_2026-11-09.md). This supersedes earlier company-only descriptions for this actor. Hosted rollout remains PROD-034; repository documentation baseline remains FOLLOW-033.

## 7. UI composition
N/A — no API-owned screen/metadata form engine.
## 8. States
Current ProblemDetails reused; explicit origin/antiforgery errors, truthful logout 503 and precommit capacity 400 tested in real Chromium/SQL fixture.
## 9. Scope and security
Default Bearer callback accepts bounded Cookies only without Authorization and outside bearer-only Auth/Google/hubs paths. Existing JWT/live validation is reused. The 2026-11-06 Hangfire correction permits the existing browser session on the dashboard, retains its permission/host filter, and validates its native antiforgery pair for Cookie mutations. Other guarded business mutations retain Angular CSRF/Origin checks. Native antiforgery names/header remain unchanged; its Cookie becomes Secure/None only with explicit cross-site mode. The dashboard alone receives a restricted frame-ancestors policy. See [corrective evidence](verification/HANGFIRE_EMBEDDING_REPAIR.md).

Corrective local/host testing support2026-10-29: BrowserAuthentication options now
include UseCrossSiteCookies (default false/Lax). Explicit true applies None to
all owned session, antiforgery and deletion Cookies while keeping Secure,
HttpOnly, host-only Path=/ and existing origin/CSRF checks. Publish-owned test
settings include exact HTTPS4210 in both browser/CORS allowlists. Effective
remote HTTPS/origins and browser acceptance remain PROD-017/019; see
[repair record](verification/HOSTED_CONFIGURATION_REPAIR.md).

Origin regression2026-11-06: hosted CSRF again returns403
Authentication.BrowserOriginDenied without CORS allow headers. Corrected the ignored
publish-owned base settings for exact HTTPS4210 and explicit cross-site Cookies;
Development settings are excluded from publish.19 existing Cookie tests and local
configuration/publish-selection checks pass. This is configuration maintenance;
no runtime/source/schema migration. Effective remote settings were not read or
changed; PROD-019 remains open until hosted configuration/restart/browser proof.

System JWTs carry session_scope=system and omit tenant/company claims. Live validation requires a non-deleted system Super Admin role and active confirmed account, owned refresh session, matching stamp and expiry. Company scope and legacy positive coordinates retain existing isolation. Accessible modules resolve live system authority before requiring a Tenant; TenantMember and company-owned endpoints remain scoped.

## 10. Persistence and side effects
PlatformDbContext owns state. Real adapter SQL tests prove one winner/one rollback for competing refresh/logout/switch/reuse saves. Current migrations apply to disposable databases; no new model/migration.

Existing refresh CompanyId=0 exclusively represents absent system scope. No model, schema, dummy Tenant/company or migration is added. Actual SQL tests migrate disposable databases on the configured local SQL Server and clean them up.

## 11. Verification
R1 eleven SQL scenarios and R2 actual password/selection/transport Chromium+SQL scenario passed; 17 Cookie unit cases passed. See verification/BROWSER_IMPLEMENTATION_REPORT.md and current final gate result.
## 12. Reuse
ASP.NET antiforgery/chunking and existing Identity concurrency proved feasible. Use 14-KiB JWT/five data chunks/16-KiB own Cookie budget and precommit admission; map concurrency to 409. Integration stays Platform-local.
## 13. Localization/accessibility
Existing localized errors; no credentials in descriptions/logs.
## 14. Delivery
R1/R2 API Verified: final full Release 1157 tests passed, zero failed/skipped; actual Cookie controller/JWT/SQL/Chromium route proof and 17 Cookie cases. Angular consumer/provider/deployment acceptance remains separate; see verification/BROWSER_IMPLEMENTATION_REPORT.md.
## 15. Evidence and closure
Manifest contains current sources only; extend with actual paths as implementation creates them.

System-session source, regression tests and current portable verification are registered in required-files.json. Historical R1/R2 receipts do not prove this correction; see SUPER_ADMIN_SYSTEM_SESSION_2026-11-09.md for its actual gate results.

## Current hosted runtime/key and Hub query correction — 2026-11-07

The supplied render503 is reproduced as CrystalReport.RuntimeUnavailable. The
downstream Crystal service itself returns crystal_runtime_api_key_not_configured.
The existing Publish preparation/configuration scripts restore matching private
transforms locally; actual WPP and SDK publish staging confirm both keys, enabled
integration and the correct HTTPS target. No remote deployment or native PDF is
claimed. The same investigation reproduces IIS's2048/2049query boundary with
synthetic tokens. ERP web.config now provides a finite24576envelope only for
hubs/company; other filtering/auth/CORS remains intact. Full API1342tests pass
with3existing opt-in skips, local IIS4cases pass and final script format passes.
Next/native APIs and permission semantics are unchanged; no new native screen or
database/migration is introduced. This supersedes the unsupported expiry diagnosis.

Canonical reproduction, repair, rollout and portable evidence:
documentation/modules/reporting/features/global-crystal-template-manager/RUNTIME_KEY_REPAIR_2026-11-07.md.
Publish Crystal site38634-WebDeploy (Release/x64) then ERP site84639-WebDeploy.
PROD-028/029 and PROD-003 retain real deployed/runtime acceptance requirements.
