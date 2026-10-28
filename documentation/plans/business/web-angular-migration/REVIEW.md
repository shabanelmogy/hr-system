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

G0: source/discovery basis prepared, classification incomplete.
G1: feature contracts/permission actions not frozen.
G2: DEC-025 resolved by no-BFF decision; DEC-027 direct authentication and compatibility spikes remain unresolved.
G3: Angular shared references and per-screen contracts not implemented/registered.
G4: implementation/release evidence does not exist.

No Feature Decomposition Gate is passed and no runtime feature is Active. Before
scaffolding, create the first completed version 2.0 contract, bind its exact slice,
and publish one active execution marker. The structural planning checker does
not certify G0–G4 or runtime readiness.

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

Latest verification after integrating ERP acceptance on 2026-10-28:

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
