# Company user permission grants — Evidence and preflight

## 1. Phase 00 Implementation Preflight

2026-10-17: approved plan/scope and S1 P-006 Web/Mobile contract reviewed; role token/live
source, serialized role mutation/audit/session pipeline, user/company access and client role
references inspected. Initial four books and manifest registered. Repository documentation
baseline passed for 125 recipes. Planning CRLF/header and optional-backtick checks repaired
to accept the actual Windows template and documented IDs.

Existing-system relationship: extend Platform authorization and user administration. Domain,
Application/ports, persistence, endpoints, session/material/catalog/audiences and both clients
are affected. No new business module or foreign DbContext.

Business/edge/impact matrices: PLAN.md and decomposition/user-company-permissions.md.
Enforcement: server current actor/catalog/delegation/version/transaction. No provider/package
change. Source review proves current shape; runtime, migration and live journeys pending.

## 2. Verification ledger

API: Pending. Web: Queued. Mobile: Queued. Integrated: Queued. Education: Queued.
Record exact commands/results here as executed.
2026-10-17 API: 243 Platform tests passed, 12 feature tests passed in independent security review, migration 20261017030411_AddUserCompanyPermissions applied through the canonical script. MessagePack 2.5.303 direct central pin resolved an inherited vulnerable transitive build dependency; dotnet restore succeeded. Native acceptance is scheduled under PROD-026 by requester instruction.


Web: npm run check exit 0 (one inherited AuditTrail useMemo warning), 6 focused tests passed; Playwright user-company-permissions desktop Chromium passed (1 scenario, 35.6s), real rendered editor confirms inherited Accountant label, unselected inherited direct checkbox, additive create selection, exact PUT body and successful close. Cold-compilation timeout resolved with documented Playwright auto-retrying assertions; save uses existing Save Changes translation. Screenshot inspected at 1280px. Full native evidence remains PROD-026.


Live API + SQL acceptance 2026-10-17: host built with 0 errors (77 inherited analyzer warnings), scoped startup passed after registering AuthCompanyAccessService. Anonymous GET 401, viewer management GET 403, missing target 404, initial scoped catalog 214 rows/166 assignable. No-op PUT 204; add direct grant PUT 204 and read-back revision 1; stale PUT 409; old target session GET 401; finally restored original empty direct selection PUT 204 (revision 2), inherited roles unchanged. This used the existing development demo viewer/admin and preserved its final direct grants. Browser fixture E2E is separate from this real HTTP/SQL verification.


Full API Release gate: dotnet test api/ErpSystem.sln --no-restore -c Release completed all 12 suites, 1003 passed, 0 failed/skipped. NuGet audit: ErpSystem.Api has no vulnerable direct/transitive packages with current sources.

Full Mobile npm run check: typecheck passed; lint failed solely on six inherited LedgerSetupResourceScreen react-hooks/preserve-manual-memoization errors already registered in FOLLOW-006 (2026-10-11). New S1 source lint is clean. Remaining full gates and tests run individually; this is not reported as an overall full-gate pass. Native PROD-026 remains scheduled.


## Phase 06 Verification & Acceptance

Decision: Verified for the exact requester-authorized automatic implementation scope on 2026-10-17. API domain/security/session/store/model tests, full Release suite, applied SQL migration, real authenticated HTTP/SQL add/no-op/conflict/revocation/restore and rendered Web save journey passed. Web full check passed. Mobile focused runtime/editor tests, type/architecture/contracts/i18n and changed-source lint passed. Inherited full Mobile lint/test failures remain FOLLOW-006 and are not erased by this acceptance. Physical native acceptance remains PROD-026 under the explicit requester instruction; no device acceptance claim is made. Remaining full-suite results are supplemental repository evidence, not a substitute for focused results. No unresolved feature regression is known.


Supplemental full Mobile suite completed: 166 suites passed, 1 inherited OfflineOperationsPolicyScreen suite failed before test execution (native keyboard-controller binding unavailable), 506 tests passed. This matches FOLLOW-006; full Mobile gate remains failing. Architecture, contracts, i18n, foundation and release contracts were run individually; logs retained locally. Device acceptance PROD-026 remains open.

