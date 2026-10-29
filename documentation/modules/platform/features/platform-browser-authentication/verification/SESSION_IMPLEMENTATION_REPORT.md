# S0-AUTH-R1 — Session correctness implementation

Date: 2026-10-28. Owner: Platform. Current outcome: **Verified for S0-AUTH-R1**;
actual SQL adapter, retained-client focused checks and full API gates passed.
The browser-authentication feature remains Active, not fully Verified/Closed.

## Delivered behavior

PlatformIdentitySessionAdapter now rotates refresh credentials within the same
SessionId and original absolute expiry. The presented token and successor share
one Identity/EF save. Company eligibility and replacement material are resolved
before mutation, and source expiry is rechecked after asynchronous token creation.
Existing RefreshTokenSessionPolicy is reused for revocation, grace and bounded
history rather than maintaining a parallel pruning implementation.

Retained rotated credentials inside the inclusive 30-second grace return 409
while a successor is active. Beyond grace, active tokens in the same session are
revoked; persistence failure/conflict is surfaced rather than silently returning
401 as though revocation succeeded. Disabled, locked and stamp-changed accounts
cannot refresh or switch. Company switching requires an active source session and
current stamp, creates a new session and preserves unrelated sessions.

Logout with a retained hash revokes its active same-session successors. Unknown
hashes/inactive sessions are idempotent. Optimistic-concurrency losers return 409
through the existing AuthenticationResultExtensions/ProblemDetails mapping.
Logout conflict is not confirmed revocation; a fresh request can reconcile/retry.
Switch/new-session and logout ordering is explicitly frozen in
[SESSION_RUNTIME_READINESS](../SESSION_RUNTIME_READINESS.md).

## Executable evidence

[PlatformSessionLifecycleTests.cs](../../../../../../api/Tests/ErpSystem.IntegrationTests/PlatformSessionLifecycleTests.cs)
executes the real adapter, JWT signer/validator, Identity UserManager and EF SQL
store. Claim metadata/company access are controlled fixtures; this is not a full
live tenant-membership/provider/browser journey. Each test uses a disposable
migrated Platform SQL database, cleaned up afterwards. Deterministic save barriers
ensure competing writers have loaded state before either saves.

Eleven scenarios cover same-session/absolute expiry, grace at exactly 30 seconds,
late reuse, latest/stale/unknown logout, wrong pair/expiry/company denial,
disabled/lockout/stamp changes, expiry during issuance, active-source switching,
refresh/refresh, refresh/logout, refresh/switch and late-reuse/refresh races.
Assertions inspect persisted rows, unrelated sessions and loser error semantics.

Focused run: 11 passed, zero failed/skipped. Retained Next: four files, 28 tests
passed. Native auth data-source test: one passed, proving switch waits for an
in-flight refresh. No UI/type/DTO/storage implementation changed on either client;
these are focused regressions, not device/browser lifecycle acceptance.

Reproduction from the repository root:

```powershell
dotnet test api/Tests/ErpSystem.IntegrationTests/ErpSystem.IntegrationTests.csproj --filter FullyQualifiedName~PlatformSessionLifecycleTests
```

## Scope, schema and remaining acceptance

Only the existing session adapter changed in application code. No new controller,
Cookie scheme, permission, EF model, migration, route, JSON response field, client
screen or provider was added. Existing migrations were applied on isolated test
databases; application/user databases were untouched. Full API migration gate is
part of the final Release verification below.

RISK-018 session findings F1-F3 have implementation/focused proof here. The central
note remains Open for its excluded disabled external-provider finding and the
remaining browser/real-client acceptance. DEC-027 remains Open for browser binding.
No full token-family guarantee: pruned hashes cannot identify successors. No
automatic retry of issuance/switch, token logging or cross-tab credentials.

All new visual journeys are Excluded in this technical increment on both clients:
create/edit/view/list/mock-data UI audits are N/A; existing UI is unchanged. Browser
Cookie routes and actual Angular login/shell are pending in the owning roadmap.

## Final gates

Restore passed. Full Release build passed with zero errors and 171 warnings from
existing code (the existing account reset parameter-name warning is in the same
source file; no new warning in the changed session code/test). Full Release tests
passed: **1139 passed, zero failed/skipped**, 12 test projects. Chromium preflight
was explicitly enabled, and all 186 integration tests passed, including the 11
current session scenarios and the all-module migration/idempotence test. Existing
SQL history FOLLOW-011 did not reproduce and remains Open, not silently closed.

Next focused auth regression: 28 passed across four files. Mobile data-source
regression: one passed. These do not claim full frontend/device verification.
Planning/execution/UI/scaffold guard tests passed. Planning check passed with the
two inherited education-module/erp-platform-template warnings. Generated check:
197 recipes passed; final current-evidence manifest contains 46 existing paths.
Whitespace/local-link checks passed. See machine-readable
[session-runtime-verification.json](results/session-runtime-verification.json).

Historical preflight results remain in
[PREFLIGHT_PROOF_REPORT](PREFLIGHT_PROOF_REPORT.md) and are not new runtime proof.
S0-AUTH-R1 is Verified. The broader API stage and whole browser-authentication
feature remain Active/Not Verified while Cookie routes/HTTP acceptance are pending.
Phase 07 customer education is N/A for this technical increment; no new screen.

Primary behavior reference: [EF Core concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency).
The test assertion caught by the analyzer follows the official
[xUnit2012 collection assertion rule](https://xunit.net/xunit.analyzers/rules/xUnit2012).
