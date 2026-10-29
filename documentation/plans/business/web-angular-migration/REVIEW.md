# Angular Web Migration — Draft Readiness Review

Reviewed 2026-10-28 by the planning agent. This is a self-review, not an independent
audit or authorization. Classification: Draft, implementation blocked at stated gates.

| Finding | Disposition | Required evidence / trigger |
| --- | --- | --- |
| Angular cannot inherit Next server handlers or cookies automatically | DEC-025 Closed; DEC-027 Open | Direct API selected; bind actual auth and required browser outcomes without recreating a BFF |
| Retaining Next is an explicit user requirement | Addressed in scope/rollout | Independent applications; no decommission milestone |
| Shared-component-first must be enforced, not just described | ANGULAR_ARCHITECTURE; S1 gate | Shared components and AST/template-aware checker tests before broad feature migration |
| React Query is not replaced by choosing SignalStore | Explicit query policy in PLAN/architecture | Cache/scope/cancellation/invalidation tests |
| Countries full parity includes heavy optional views | S0 specialist proof; S3 full acceptance | Do not accept CRUD-only as the complete pilot |
| Specialist React adapters may have no direct replacement | RISK-017 | Angular/framework-neutral adapter and entitlement proof |
| Screen catalog reuses P-008 for unrelated meanings | DEC-026 | Resolve canonically before ambiguous feature contracts |
| Registered routes do not prove implemented business capability | INVENTORY caveat; S0 classification | Per-route/child view API/source reconciliation |
| Existing domain and native clients must remain valid | Scope/rules/vertical contract gate | API/Mobile revalidation or explicit reasoned N/A |
| Toolchain requirements differ from current Next engine floor | RESEARCH; S0 | Exact Node/TS/Angular/PrimeNG peers pinned and tested |
| Source drift can undermine parity | RISK-016; ROADMAP | Source baseline stamp and change impact ledger per child |
| Source tests do not prove hosted behavior | Separate fixture/live/release evidence | Production-only notes retained; no green-source shortcut |
| ERP recommendations could become vague checklists or hidden scope expansion | D14/D15; ERP_ACCEPTANCE | Twelve IDs have owner/timing/observable acceptance; actual business/schema gaps require owning slice review |
| API generation can conceal schema omissions or duplicate DTOs | ERP-01; FOLLOW-003 | Representative real-spec proof, selected tool/fallback, pinned repeatable CI check; feature services remain boundary |
| Keyboard/lookups can diverge across features | ERP-02..ERP-04 | Shared behaviors, off-page selection and keyboard/structured-edit acceptance on real consumers |
| Data correctness cannot be established with happy-path UI tests | ERP-05..ERP-09 | Two-client conflicts, lost response after commit, fractional/date edges and real audit/transaction evidence |
| Release backup files do not prove recoverability | ERP-12; PROD-023 | Isolated restore, integrity validation, environment/operator and recovery record before external production data |
| External Sigma examples could be mistaken for target architecture or verified ERP runtime | D16; SIGMA_ACCEPTANCE evidence/adaptation boundary | External source baseline and source-only status recorded; keep Angular 22/Strict/Zoneless, ERP security and no-BFF authority |
| Cross-cutting acceptance can miss route/query, loading, draft and attachment races | SIG-01..SIG-08; ROADMAP | Foundation harnesses plus actual first-consumer evidence; attachment proof follows the first consumer even before S8 |
| Current direct API is bearer/JSON, so Next cookie behavior is not inherited | D17 secure API Cookies approved; BROWSER_AUTHENTICATION_CONTRACT; DEC-027 proof Open | Persistence choice resolved; prove origins/CSRF/cookie limits under the selected contract |
| Auth source diverges from documented rotation/grace and available provider assumptions | RISK-018 | Actual adapter/persistence/HTTP reconciliation before auth runtime acceptance; existing policy/client tests do not prove those paths |

## Consistency review after ERP acceptance integration

- Direct Angular-to-API/no-BFF decision remains intact; no new infrastructure mandated.
- Signals/SignalStore policy and shared @app/tokens/component reuse remain intact.
- Current implementation evidence is separate from newly accepted requirements.
- PLAN and ANGULAR_ARCHITECTURE now agree on src/app versus src/theme/locales layout.
- Detailed ERP rules have one authority in ERP_ACCEPTANCE; roadmap references IDs/timing.
- API generation is a required assessment with a recorded outcome, not an unproven tool mandate.
- Pilot uses implemented workflows; no invoice/posting module is invented to demonstrate it.
- First-feature contracts/active markers and runtime gates remain required before implementation.

## Gate result

Consistency review after requester-approved Sigma integration:

- All eight recommendations have stable SIG IDs, owners, timing, source symbols
  and observable acceptance in SIGMA_ACCEPTANCE; ERP-01..ERP-12 stay unchanged.
- PLAN, architecture, specification, discovery, evidence, decisions, handoff brief,
  roadmap and navigation/registry entries reference the adopted authority.
- S1 verifies generic behavior using representative compositions; S2/S3 and later
  consumers prove actual integration. SIG-04/05 are gated at their first relevant
  feature rather than assumed implemented by a foundation test.
- External tests were read, not run; Sigma source was unchanged. No current ERP
  behavior, new API guarantee, build/runtime success or readiness gate is inferred.
- No new deferred item, unresolved decision or release exception was introduced;
  existing central note ownership is retained.

G0: source/discovery basis prepared, classification incomplete.
G1: full migration feature contracts/permission actions not frozen; the bounded
browser transport now has an explicit preflight-only contract.
G2: DEC-025 resolved by no-BFF decision; DEC-027 direct authentication and compatibility spikes remain unresolved.
G3: Angular shared references and per-screen contracts not implemented/registered.
G4: implementation/release evidence does not exist.

The Feature Decomposition Gate is passed for S0-AUTH preflight only, with one
Active API preparation owner and a version-2.0 contract. Runtime remains blocked;
no application implementation or full migration readiness is inferred. The
structural planning checker does not certify G0–G4 or runtime readiness.

## Planning verification

Baseline documentation generator check passed 189 recipes before planning edits.
Final `Check-Planning.ps1` passes with the expected warning that this Draft has no
version 2.0 feature execution contract yet; existing education/template plans have
the same warning. `Check-Planning.ExecutionState.Tests.ps1` passes. All local links
in this plan package were checked against the filesystem.

An earlier drafting round failed the full documentation check on Accounting
Ledger Setup's stale `generated/PHASE-00-implementation-preflight.md`. That was
recorded separately under the shared-workspace boundary RISK-003; its feature
books/templates/packets were not edited by this planning task.

Verification after integrating ERP acceptance on 2026-10-28:

- `Check-Planning.ps1`: passed with the expected pre-execution contract warnings.
- `Check-Planning.ExecutionState.Tests.ps1`: passed.
- `Generate-Documentation.ps1 -Check`: passed all 189 recipes in the current working tree.
- Local links and trailing-whitespace check: passed for all 13 plan-package Markdown files.
- `git diff --check` on the touched tracked planning/registry paths: passed.

The latest passing check supersedes the earlier failure for current handoff; it
does not imply this task repaired Accounting or closed unrelated central notes.

Runtime tests are not rerun for this documentation-only change. Earlier Web test
evidence remains historical. No Angular/browser/live API/database/release pass
is claimed.

Latest verification after integrating Sigma acceptance on 2026-10-28:

- `Check-Planning.ps1`: passed; existing missing-version-2.0-contract warnings
  remain for education-module, erp-platform-template and web-angular-migration.
- `Generate-Documentation.ps1 -Check`: passed all 189 recipes; no generated
  packet or canonical runtime book was edited.
- All 14 plan-package Markdown files: 121 relative local links and trailing
  whitespace checked successfully; all eight detailed SIG criteria and
  traceability rows are present.
- `git diff --check` on planning paths: passed. The scoped tracked diff and new
  SIGMA_ACCEPTANCE source were reviewed for scope/authority/timing consistency.
- External Sigma reference files were unchanged; its source/test definitions
  remain source-only evidence. Runtime tests were not run for this planning edit.

These results validate documentation integration, not G0-G4 or runtime readiness.

## S0 authentication source audit — 2026-10-28

Completed the endpoint/credential/origin and source/consumer mapping in
[AUTHENTICATION_PREFLIGHT](AUTHENTICATION_PREFLIGHT.md). Source claims are separate
from the not-yet-implemented browser-cookie adapter and from live acceptance.
D17 is now requester-approved; DEC-027 remains Open for exact slice/preflight/proof.
Central RISK-018 owns the new auth source-contract findings;
API/Web/Mobile/Cross-platform indexes reference that canonical note.

- Platform: 31 selected auth policy/helper tests passed, 0 failed; existing analyzer
  warnings remained. This was a focused test/build, not the full solution gate.
- Retained Web: 6 selected files / 50 tests passed, 0 failed; runner reported
  Vitest 4.1.11. The command and exact files are in the preflight record.
- No live SQL orchestration, browser/CORS/cookie/CSRF or Angular auth proof was run.
  The documented refresh mismatch is source evidence, not an observed failed test.
- No application source/config/schema, Sigma source or generated packet was changed.
  S0 has additional work and no runtime feature is Active.

Planning/documentation verification for this audit:

- `Check-Planning.ps1`: passed with the existing three pre-execution contract warnings.
- `Generate-Documentation.ps1 -Check`: passed all 189 recipes.
- All 15 plan-package Markdown files: 127 local relative links and whitespace passed.
- `git diff --check -- documentation/plans`: passed; scoped audit/central-note diff
  and the new preflight document reviewed. Prior Sigma-acceptance edits were retained.

The source investigation and persistence selection are complete. Live binding
proof remains pending; this does not mark S0 or DEC-027 complete.

## D17 selection and target transport — 2026-10-28

The requester explicitly selected secure Cookies inside the existing API. Updated
the current decision, discovery/evidence/specification, central DEC-027 and handoff
to distinguish approved persistence from pending implementation proof. No repeat
preference approval is required.

[BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md) specifies
the bounded target endpoints, cookie lifetime/naming, origin/antiforgery bootstrap,
legacy bearer isolation, refresh/logout reconciliation, compatibility and exit
checks. It adds no customer UI and is not a version-2.0 execution authorization;
at that selection step the roadmap had no Active marker. D17 does not close RISK-018 or the remaining
slice/preflight/live acceptance gates. No runtime/config/schema was changed.

Verification after D17 approval/target contract integration:

- `Check-Planning.ps1`: passed with the same three pre-execution contract warnings.
- `Generate-Documentation.ps1 -Check`: passed all 189 recipes.
- All 16 root plan-package Markdown files: 135 local links and whitespace passed.
- `git diff --check -- documentation/plans`: passed. API/Next/Mobile/graph files
  remain unchanged; the earlier 31+50 scoped runtime test results are historical
  baseline evidence, not tests of the new browser transport.

## S0-AUTH execution contract and Phase 00 package — 2026-10-28

Created the exact version-2.0 single-feature contract and one Active API preparation
marker. The overall plan remains Draft; runtime authorization is explicitly false.
New-FeatureDocumentation ran in the explicit PreflightOnly mode after the current
decomposition gate passed. Final manifest registers 33 existing paths, four initial
applied profiles and eight generated phase packets. No future application source
is registered and no generated packet was manually edited.

The completed request includes relationship/reuse evidence plus business-rule,
all edge-case categories and impact matrices. Phase 00 assessment is Not Ready
for runtime while DEC-027/RISK-018's Cookie/header capacity, SQL serialization and
effective HTTPS/origin/antiforgery proofs remain. New UI is Excluded on both
clients; actual browser/native transport regression remains Required.

Generic planning tooling now permits justified N/A UI rows only for wholly
Excluded visual surfaces, and exact-slice preflight scaffolding only with explicit
canonical metadata/current contracts. Draft runtime and sibling attempts remain
rejected. This change does not waive a real screen pattern or runtime gate.

Verification for this step:

- Planning UI-pattern cases: 9 passed; authorization cases: 6 passed; current
  preflight-contract guards: 4 passed; execution-state regressions: 9 passed.
- Generator integration guards reject Draft runtime/sibling preflight before
  file creation; actual exact-slice PreflightOnly scaffolding succeeded.
- UI/authorization/preflight contract and generator integration guards also pass
  Windows PowerShell 5.1; the scaffold restriction string uses ASCII so UTF-8
  without BOM does not break that parser. PowerShell 7 guard runs also pass.
- Check-Planning passed; the Angular missing-contract warning is resolved.
  Existing education-module/erp-platform-template warnings remain unrelated.
- Generate-Documentation -Check passed 197 recipes (189 baseline + 8 new).
- 31 Markdown files/139 local links and 33 registered existing evidence paths
  passed validation; diff check passed. Application/API/Next/native/graph sources
  remain unchanged; runtime tests were not rerun for this documentation/tooling step.

## S0-AUTH measured feasibility proofs — 2026-10-28

Three new integration probes passed, zero failed/skipped. The owning
[proof report](../../../modules/platform/features/platform-browser-authentication/verification/PREFLIGHT_PROOF_REPORT.md)
records reproducible evidence and remaining boundaries:

- Real claim-material builder/JWT signer: 258 compiled permissions, synthetic long
  names and 1/10/25 roles; JWT sizes 10,468/11,793/13,993 bytes. Framework chunk
  roundtrip/partial rejection verified. Selected 14-KiB JWT/five data chunks and
  16-KiB own Cookie budget require runtime precommit enforcement.
- Existing Platform migrations applied to an isolated disposable LocalDB database.
  Two real Identity/EF competing saves produced one success/one concurrency failure,
  with only one successor persisted; helper removed the database. Actual adapter
  session/lifetime/logout semantics remain RISK-018, including required 409 mapping.
- Trusted Chromium on two dynamic HTTPS origins verified credentialed CORS,
  Secure/HttpOnly/Lax antiforgery, valid/missing/invalid tokens and denied origins.
  Two synthetic Next/API Cookie sets coexisted at 29,217 Cookie-header bytes;
  excess was rejected with 431. Existing port 4200/listeners and application
  configuration were retained. Real ERP endpoint/deployment acceptance is pending.

These resolve feasibility uncertainties at the primitive level. DEC-027/RISK-018
remain open; runtime authorization is false and Phase 06 is not Verified.
Only verification code was added to the API test project; no API module behavior,
Next/native UI, schema/model or graph source changed.

Final verification for this continuation:

- Restore passed; full Release build passed with zero errors and 473 inherited
  warnings, none from the new probe source.
- First full test run: 1125 passed, two SQL integration failures, one intentional
  browser skip. Both failed tests passed individually; full diagnostic repeat:
  1127 passed, zero failed, one skip. No source correction between runs. FOLLOW-011
  owns the unproven intermittent cause; no ignored gate or guessed fix.
- Explicitly enabled browser preflight: three passed, zero failed/skipped.
- Planning check passed with the two existing unrelated plan warnings;
  documentation check passed 197 recipes. Validated 32 Markdown files, 151 local
  links and 40 current evidence paths; diff whitespace passed.

## S0-AUTH-R1 runtime repair — 2026-10-28

The user authorized continuing with the proposed existing-session repair. Exact
G0-G3 entry, bounded scope, release-only G4 remainder and concurrency/rollback rules
are in the feature's SESSION_RUNTIME_READINESS. One feature remains Active; no
blanket Angular runtime or new browser-route authority is inferred.

Implemented the existing Platform session adapter: same-session refresh/original
absolute expiry, inclusive grace conflict, truthful suspicious-reuse save failures,
retained-hash logout across same-session successors, active source/stamp/lockout
switch guard and shared atomic save/concurrency handling. Reused existing policy
helpers; no schema/model/route/DTO/client-UI change or new session owner.

S0-AUTH-R1 is **Verified**. Full Release restore/build passed (zero errors, 171
existing warnings), and all 1139 tests passed, zero failed/skipped, across 12 test
projects with Chromium explicitly enabled. This includes 11 actual adapter/JWT/SQL
scenarios and all-module migrations/idempotence. Next focused auth: 28 passed in
four files; native auth data-source: one passed. FOLLOW-011's earlier intermittent
SQL failures did not reproduce; its unknown cause remains open.

Planning/scaffold/execution/UI guard regressions passed; Check-Planning passed with
the same two unrelated warnings; generated documentation check passed 197 recipes.
Current manifest registers 46 existing paths. The [implementation report](../../../modules/platform/features/platform-browser-authentication/verification/SESSION_IMPLEMENTATION_REPORT.md)
and its machine-readable result own exact current acceptance. Browser Cookie
endpoint/login-reload/real-client acceptance remains pending under DEC-027/RISK-018;
full feature Phase 06 is Not Verified and later stages remain Queued.

## S0-AUTH-R2 browser API acceptance — 2026-10-28

R2 was authorized under BROWSER_RUNTIME_READINESS and is now **Verified for the
bounded technical transport**. Production controller routes/JWT/live session/
Identity/password/one-use selection/SQL and trusted Chromium passed the actual
login/select/reload/access-expiry/refresh/company-switch/logout journey. Denial
coverage includes Origin/CSRF/permission/read-only/header isolation, partial chunks,
capacity before commit preserving the prior session, and truthful 503 with Cookie
cleanup on revocation failure. Global Hangfire antiforgery defaults and retained
Next/native bearer wire are preserved. No new schema/UI/BFF/service/database owner.

Final restore/build passed (zero errors, 432 existing warnings; no new browser
source warnings). Full Release diagnostic repeat: **1157 passed, zero failed/skipped**,
12 projects; 187 integration/354 Platform/70 architecture tests passed. Chromium
probes explicitly enabled. Next: 7 focused files/38 tests passed; Mobile data-source:
one passed. A prior full run's HR SQL pre-login handshake timeout passed on targeted
and full recheck without source/timeout changes; FOLLOW-011 retains that environment
finding. Feature-owned namespace/public-surface failures were corrected and passed;
they were not labeled inherited failures.

17 Cookie cases and 11 existing session SQL scenarios cover bounded parsing and
actual adapter races. Current [implementation report](../../../modules/platform/features/platform-browser-authentication/verification/BROWSER_IMPLEMENTATION_REPORT.md)
and browser-runtime-verification.json own exact acceptance. DEC-027 Closed for API
binding/proof; RISK-018 remains only for provider/ancestry/actual-consumer boundaries.
Angular foundation/login/shell is next, not implemented in this API unit. Production
configuration/device/provider acceptance remains separately gated. Technical
Phase 06 Verified, customer education N/A no new screen; documentation handoff is
the sole Active stage before registering/activating the next foundation feature.

Final planning checks/guard regressions and 197 generated recipes pass; final
manifest includes 65 existing evidence paths. No nonexistent Angular path is
registered. Canonical docs, generated packets and whitespace/link checks reconciled.

### Current handoff: Angular S1-A0

The above API history is now Closed. The sole Active feature is
angular-localization-foundation; its technical runtime is Phase 06 Verified and
documentation/handoff is Active. Actual `web-angular` source exists, consumes the
unchanged schema-3 catalog and SQL-backed runtime/write/reset contracts, and passes
14 Angular tests, strict types, architecture/catalog checks and production build.
Retained Next localization tests pass (4 files / 10 tests); native/API source is
unchanged. The feature's implementation report and 76-path manifest own evidence.
Theme/shared controls/login/Settings UI are later contracts. FOLLOW-012 centrally
owns actual signed-in Angular SQL save/reload acceptance at S2/S4. No overall S1
or migration-ready claim follows from this technical bootstrap.
