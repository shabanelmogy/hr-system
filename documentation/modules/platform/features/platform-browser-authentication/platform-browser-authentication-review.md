# Platform Browser Authentication — Applied review Profile

## 1. Ownership
Platform owns identity/session truth. S0-AUTH-R1 session correctness runtime is authorized; implementation evidence added as verified.
## 2. Approved scope
D17 secure API Cookies/no-BFF; current runtime increment is existing session correctness under SESSION_RUNTIME_READINESS.md. Browser endpoints remain gated.
## 3. Domain
Existing PlatformRefreshToken/session scope. No new business entity/schema planned.
## 4. Rules
Existing login/selection/access policy; refresh/logout/switch correctness implemented with real SQL adapter tests. RISK-018 retains provider/browser acceptance boundary.
## 5. Client decisions
Browser HTTP and retained Next/native regression Required; all new visual Web/Mobile views Excluded.
## 6. Contracts
Current bearer wire retained; R2 typed sanitized browser Cookie routes implemented, no raw session credentials in JSON.

2026-11-09 corrective system-session increment (FOLLOW-032): eligible Super Admin authenticates without any Tenant or company. Canonical current contract and verification boundary: [system-session execution](SUPER_ADMIN_SYSTEM_SESSION_2026-11-09.md). This supersedes earlier company-only descriptions for this actor. Hosted rollout remains PROD-034; repository documentation baseline remains FOLLOW-033.

## 7. UI composition
N/A — technical unit. Existing Next/native shared UI unchanged; S2 owns Angular screens.
## 8. States
Cookie expiry/rejection/outage tested via production-route Chromium/SQL fixture; R1 SQL races verified. Actual Angular client transition UI remains pending.
## 9. Scope and security
Existing live user/session/stamp/tenant/company authority; no client scope grants.

Maintenance2026-10-29 extends only existing Cookie transport configuration for
the requester-selected local Angular/hosted API topology. Default Lax is retained;
explicit cross-site mode uses Secure None consistently for auth/CSRF/deletion.
HTTPS, origin, permissions and antiforgery authority are unchanged. The
[repair record](verification/HOSTED_CONFIGURATION_REPAIR.md) owns current
source-versus-host findings, rule/edge/impact matrices and verification limits.

Maintenance2026-11-06 revalidates that boundary: hosted exact4210 CSRF is403 again;
publish-owned local configuration was missing both the approved origin and browser
section while Development had the origin. Local configuration is repaired and19
Cookie regressions pass. No Angular/Next/native/domain behavior changed. PROD-019
retains remote deployment and actual browser acceptance; see the repair record's
dated regression section and portable receipt.
## 10. Persistence and side effects
The 2026-11-06 [Hangfire corrective evidence](verification/HANGFIRE_EMBEDDING_REPAIR.md)
supersedes the earlier exclusion of Hangfire from browser Cookie authentication.
The real dashboard remains permission/host protected, gets a restricted ancestor
policy, and retains native CSRF; Angular uses an iframe rather than a counters
replacement. Hosted acceptance remains open under existing production note IDs.

Existing PlatformDbContext. Three isolated feasibility proofs passed; selected limits and remaining runtime boundaries are in verification/PREFLIGHT_PROOF_REPORT.md.
## 11. Verification
R1 eleven actual session SQL scenarios, R2 browser route/SQL scenario and 17 Cookie unit cases passed; retained Next 38/native 1 passed. Final gate and consumer limitations: verification/BROWSER_IMPLEMENTATION_REPORT.md.
## 12. Reuse
Reuse ISender, current commands/JWT/session/errors; no parallel identity owner.
## 13. Localization/accessibility
No new visual text/layout. Current client EN/AR/RTL/accessibility retained.
## 14. Delivery
API session/browser increments R1/R2 Verified; technical acceptance documented, next handoff is Angular foundation/UI. No UI delivered; provider/production remains outside this unit.
## 15. Evidence and closure
Evidence ledger/required-files.json own current evidence; Phase 06 not Verified; technical education N/A.

Optional S2-A4 consumer proof (2026-10-29): verification/browser-transport.mjs accepts ERPSYSTEM_TEST_ANGULAR_COMPANY_CONTEXT=1 to drive the built Angular UI with its existing trusted Chromium/SQL harness. Auth/challenges/CSRF/Cookies/company-switch/reload/two-tab/logout are real; catalog/localization reads are explicitly synthetic. The existing normal proof remains independent of Angular. Current redacted receipt and angular-company-context/IMPLEMENTATION_REPORT.md record 1/1 pass with SQL cleanup assertions unchanged.

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
