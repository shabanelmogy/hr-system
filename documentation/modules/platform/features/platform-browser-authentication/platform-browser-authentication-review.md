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
## 10. Persistence and side effects
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
