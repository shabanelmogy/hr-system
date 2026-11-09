# Platform Browser Authentication — Applied web Profile

## 1. Ownership
Next server auth helpers currently own Cookies/credential forwarding; Angular is a later consumer.
## 2. Approved scope
D17 API-owned HttpOnly Cookie routes implemented in R2; Next UI/wire unchanged, Angular remains the next consumer.
## 3. Domain
Browser never owns identity/permission/company membership truth.
## 4. Rules
Preserve temporary-outage distinction, request generation and no implicit write replay.
## 5. Client decisions
New visual UI Excluded; actual browser HTTP harness and retained Next regression Required.
## 6. Contracts
New browser API returns typed sanitized SessionContext; csrf bootstrap/in-memory X-ERP-XSRF and exact-origin credentials. Next backend-session/cookies remain their existing owner.
## 7. UI composition
No screen created; reuse current shared UI unchanged. S2 preserves current design.
## 8. States
Current dirty/context/error handling retained; new Cookie/cross-tab behavior unverified.
## 9. Scope and security
Current Next Cookies retained; API owns distinct HttpOnly/Secure names and server CSRF/origin enforcement. Session SameSite defaults Lax; explicit API UseCrossSiteCookies=true enables None for the local Angular/hosted API topology without changing Next's own Cookies. The 2026-11-06 correction also permits native Hangfire antiforgery Cookies in explicitly enabled cross-site mode, preserving names/header/validation. Angular embeds the actual protected dashboard after a credentialed access check; Next keeps its Bearer proxy. See [embedding repair](verification/HANGFIRE_EMBEDDING_REPAIR.md) and verification/HOSTED_CONFIGURATION_REPAIR.md for source/host acceptance limits.
## 10. Persistence and side effects
No web token storage/business-data migration/service-worker cache introduced.
## 11. Verification
Current R2: seven retained auth/Hangfire files/38 tests passed. Real Chromium/SQL production-route login/select/reload/expiry/refresh/switch/logout and retained header coexistence passed; see verification/BROWSER_IMPLEMENTATION_REPORT.md. Actual Angular cross-tab/dirty/context UI is still pending.
## 12. Reuse
Existing token/UI ownership retained; no feature-local visual shell.
## 13. Localization/accessibility
Existing EN/AR/themes/RTL/focus unchanged; HTTP harness not visual proof.
## 14. Delivery
Web stage Queued until API/browser transport Verified; retained auth regression for the current API increment passed. No client implementation/UI change.
## 15. Evidence and closure
Current Next evidence and isolated browser probe/results registered; no nonexistent Angular paths. See verification/PREFLIGHT_PROOF_REPORT.md.

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
