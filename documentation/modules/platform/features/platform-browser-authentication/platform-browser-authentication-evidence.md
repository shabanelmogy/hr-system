# Platform Browser Authentication — Phase 00 Evidence

| Field | Value |
| --- | --- |
| Date | 2026-10-28 |
| Plan/slice | web-angular-migration / S0-AUTH-R2 — Browser transport |
| Execution | R1/R2 API transport Verified; documentation handoff Active; Angular consumer next |
| Documentation state | Final current-evidence manifest, not final runtime acceptance |
| Manifest | documentation/modules/platform/features/platform-browser-authentication/required-files.json |
| Request | platform-browser-authentication-request.md |
| Phase 00 result | Three feasibility probes passed; S0-AUTH-R1 runtime entry passed under SESSION_RUNTIME_READINESS.md |

## Evidence register

| ID | Claim or target | Actual evidence | Status |
| --- | --- | --- | --- |
| E01 | D17 secure API Cookies/no-BFF | Plan DECISIONS/BROWSER_AUTHENTICATION_CONTRACT | Approved target |
| E02 | Current auth returns JSON credentials | AuthController; AuthenticationOrchestrationContracts | Source verified |
| E03 | Platform owns JWT/live session/scope | PlatformIdentityServiceCollectionExtensions; SessionValidationService | Source verified |
| E04 | Next owns browser Cookies/proxy refresh | cookies.ts; backend-session.ts | Source verified; retained |
| E05 | Native consumes existing bearer | auth-remote-data-source.ts; auth-endpoints.ts | Source verified; regression Required |
| E06 | Refresh/grace/logout contract mismatch | Actual adapter repair; PlatformSessionLifecycleTests; RISK-018 | Session findings implemented/focused tests passed; provider/browser acceptance remains open |
| E07 | Current baseline focused tests | AUTHENTICATION_PREFLIGHT section 7 | Earlier 31 Platform + 50 Web passed |
| E08 | Browser endpoints/Cookies/CSRF | BrowserAuthController/security middleware/Cookie adapter; browser-transport.json | Implemented; actual Chromium/JWT/Identity/SQL journey passed |
| E09 | JWT/chunk capacity | verification/results/token-capacity.json; actual builder/signer, 258 permissions | Measured; admission bounds selected |
| E10 | Real SQL atomic save/concurrency | verification/results/sql-concurrency.json; disposable migrated Platform database | One winner/one conflict; adapter lifecycle not yet proven |
| E11 | Trusted browser HTTPS/CORS/antiforgery/overflow | verification/results/https-antiforgery.json; real Chromium | Passed isolated transport proof |
| E12 | Actual session lifecycle/SQL races | verification/SESSION_IMPLEMENTATION_REPORT.md; PlatformSessionLifecycleTests | 11 focused scenarios passed; full feature/browser acceptance pending |
| E13 | Current full API and retained-client checks | verification/results/session-runtime-verification.json | Release 1139 passed/0 failed/0 skipped; Next 28/Mobile 1 focused passed; R1 Verified |
| E14 | Current browser transport | verification/BROWSER_IMPLEMENTATION_REPORT.md; browser-transport.json | Actual password/select/reload/expiry/refresh/switch/logout and denial/cleanup/failure proof passed |
| E15 | Final R2 API acceptance | verification/results/browser-runtime-verification.json | Release 1157 passed/0 failed/0 skipped; Next 38/Mobile 1 focused passed |

## Platform and scope reconciliation

Every new visual Web/Mobile Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart
view is Excluded: technical transport only. Browser HTTP and existing client
regression are Required. Native offline lease unchanged; no new offline feature.
Education N/A for this technical unit, Required later for the S2 UI consumer.
Existing-system relationship/reuse and all business/edge/impact categories are
completed in the request. No fake CRUD pattern or foreign feature scope is used.

## Readiness findings

| Gate | Disposition | Owner / closure |
| --- | --- | --- |
| G0 scope/ownership | Prepared for this exact unit | Platform boundary/one feature recorded; overall migration remains Draft |
| G1 session/race semantics | Frozen and implemented for R1 | Same-session/absolute expiry, grace, logout/switch order; RISK-018 remains scoped open |
| G2 Cookie/header capacity | Implemented and tested | 14-KiB JWT/five data chunks/16-KiB own Cookie budget; precommit rejection retains valid old session; deployment proxy limits remain release-only |
| G2 persistence serialization | Actual adapter SQL lifecycle/races passed | Existing UserManager/EF save keeps one winner; loser returns 409; eleven adapter scenarios |
| G2 HTTPS/origin/antiforgery proof | Actual transport proof passed | Trusted certificate/Chromium/CORS/CSRF, expired access CSRF identity, retained header and global Hangfire antiforgery defaults verified |
| G3 visual UI | N/A on both clients | Explicit technical exclusion; no new screen, S2 UI separately gated |
| G4 runtime/live | Verified for bounded API transport | Actual controllers/SQL/browser + full Release 1157 passed; Angular consumer/device/production acceptance separate |

Findings remain under DEC-027/RISK-018. The subsequent requester instruction to
implement the proposed session repair activates the exact bounded increment in
[SESSION_RUNTIME_READINESS](SESSION_RUNTIME_READINESS.md). G0-G3 passed for that
increment; only production G4 checks remain release-only. Actual adapter tests
are implementation exit criteria; no test pass or browser binding is inferred.

## Verification

189 registered recipes passed the initial baseline. New tooling regressions,
feature generation/check and link/diff results are recorded in the canonical
plan REVIEW after running. No application source/config/model was changed.
The subsequent [preflight proof report](verification/PREFLIGHT_PROOF_REPORT.md)
records three passing integration tests, selected limits and remaining boundaries.
Existing migrations ran only against a disposable test database, then removed it.
No application runtime source/config/model changed; one test source and its browser
probe were added. No Phase 06/07 success is claimed.

Subsequent S0-AUTH-R1 runtime outcome: **Verified for this bounded increment**.
The actual session adapter now changes, with 11 SQL scenarios included in a full
1139-pass Release run (zero failed/skipped), plus Next 28/native 1 focused passes.
See [implementation report](verification/SESSION_IMPLEMENTATION_REPORT.md).
Browser Cookie endpoints remain unimplemented; whole-feature Phase 06 is Not
Verified and Phase 07 is not started. Historical no-runtime statements above
describe preflight only. No model/schema/config/client UI change was introduced.

## R2 final technical acceptance

R2 API/browser transport is Verified. Actual production controller/JWT/live scope/
password/selection/SQL/Chromium proof passed, final Release 1157 passed with zero
failures/skips; Next 38/native 1 focused regressions passed. Current report:
[Browser implementation](verification/BROWSER_IMPLEMENTATION_REPORT.md). DEC-027
is Closed for API binding/proof; RISK-018 provider limitation and production gates
remain separate. Historical pending-browser statements above describe earlier
phases. Technical Phase 06 Verified; no new customer UI, education N/A.
Documentation handoff remains Active until next foundation registration. Actual
Angular consumer UI/cross-tab/context and physical-device parity are not delivered
or claimed by this transport unit. Manifest has 65 existing evidence paths.
