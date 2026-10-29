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
## 7. UI composition
N/A — no API-owned screen/metadata form engine.
## 8. States
Current ProblemDetails reused; explicit origin/antiforgery errors, truthful logout 503 and precommit capacity 400 tested in real Chromium/SQL fixture.
## 9. Scope and security
Default Bearer callback accepts bounded Cookies only without Authorization and outside bearer-only Auth/Google/hubs/Hangfire paths. Existing JWT/live validation reused; guarded business mutations require CSRF/Origin. Global antiforgery settings preserved.
## 10. Persistence and side effects
PlatformDbContext owns state. Real adapter SQL tests prove one winner/one rollback for competing refresh/logout/switch/reuse saves. Current migrations apply to disposable databases; no new model/migration.
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
