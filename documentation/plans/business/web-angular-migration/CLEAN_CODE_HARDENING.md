# Angular Clean Code hardening — implementation and acceptance

Date: 2026-10-31. Owner: Angular architecture + QA. Central tracking: FOLLOW-022.
Classification: authorized technical maintenance under the existing
web-angular-migration plan. After the initial review, the requester explicitly
ordered implementation of all recorded findings and reiterated component folders,
shared-first ownership and highest code quality. Runtime implementation now exists;
current verification and the CC-01..07 closure matrix are recorded in
CLEAN_CODE_IMPLEMENTATION.md. S3-A8 remains the sole active business feature.

## 1. Scope and retained decisions

Apply to web-angular first: shared primitives, module/public boundaries, Platform,
feature services/state, templates and verification tooling. Preserve D35-D37,
external component resources/folders, PrimeNG/shared-first controls, shared color
tokens, typed Reactive Forms, signals/RxJS and direct existing .NET API access.
No BFF, required NgRx/global entity store, Nx conversion, new API/domain/schema,
Next/mobile rewrite, production deployment or paid analysis service is proposed.
Tool dependencies must be checked against installed Angular22/TypeScript6/Node
versions before adding them. Use existing checks/CI rather than a parallel gate.

## 2. Historical review baseline and limits

Read-only audit inspected195 non-generated, non-spec app TS files. Configuration
and source were read directly after graphify navigation. Existing strict TS,
strictTemplates, nineteen architecture cases, formatting and production-size
checks are present. `.github/workflows/angular-ci.yml` already runs `npm run check`;
CI introduction is not a missing capability. Prior post-D37 verification recorded
79files/464unit tests and44 bounded browser cases; those are historical evidence,
not a new full-suite run during this audit. A fresh existing architecture check
passes19cases and the source boundary scan during this review.

Portable measurements are in CLEAN_CODE_AUDIT.json. Line counts include formatting
and are triage signals, not proof of bad design or a mechanical split threshold.

| ID | Verified observation | Interpretation / next action |
| --- | --- | --- |
| CC-01 | No Angular/TypeScript ESLint configuration or lint command/dependencies found in the current app. | Add focused semantic/template linting to the existing check; formatting alone does not catch unhandled promises, unsafe values or template mistakes. |
| CC-02 | Current dependency scan returns4 strongly connected candidate groups when static exports, explicit type imports and dynamic imports are combined. | Classify edge kinds before enforcement; do not label all4 runtime cycles. LauncherTile->LauncherGrid is explicitly type-only. SpreadsheetFiles->parser is intentionally dynamic, with an error-contract import back. Auth/session and Modules barrels form a static mixed entry cycle worth narrowing. Shell/dashboard candidate includes lazy routing. |
| CC-03 | MyDataGrid942lines; CountriesReadPage439; AuthSession425. createCollectionController spans285lines including nested closures; createCollectionCriteriaCodec225. | Review responsibility concentration, public contract and change coupling. Extract coherent pure helpers/controllers when useful; retain the existing shared Grid/API and single auth authority. |
| CC-04 | App TS probe with noUncheckedIndexedAccess produces40 diagnostics. | Additional safety coverage is not yet enabled; these are migration diagnostics, not40 proven runtime failures. Guard indexed collection access and normalize boundary data rather than adding non-null assertions to silence checks. |
| CC-05 | App TS probe with exactOptionalPropertyTypes produces17 diagnostics. | Distinguish omitted properties from explicit undefined according to each contract. Preserve API null/omission semantics; do not globally widen optional types. |
| CC-06 | App TS probe with noUnusedLocals + noUnusedParameters produces11 diagnostics. | Not11 confirmed dead-code sites: navigationLifetime/GridLocale/CalendarLocale injections intentionally initialize behavior, and template-context guard parameters participate in type predicates. Classify before removing or auto-fixing. |
| CC-07 | Existing architecture checks inspect selected import strings and an inject(HttpClient) source pattern. | Extend resolved ownership enforcement for aliases, import types, constructor/alternative HTTP access and cross-owner internals; preserve reviewed Platform localization/theme adapters. |

Probe flags were applied only in an in-memory TypeScript program using app tsconfig
and noEmit. Project configuration and runtime source were not modified. Probes are
independent, not additive; diagnostics may overlap and do not include Angular
template compilation. Stored probe examples are capped at12 per option. The graph
is syntax based, includes type/dynamic edges and excludes generated/spec files;
it is not proof of emitted runtime initialization order or a full security audit.

## 3. Authorized implementation batches and acceptance contracts

### Batch A — Make quality enforceable

1. Add version-compatible angular-eslint and typescript-eslint flat configuration.
   Start with recommended TS/template rules plus reviewed type-aware unsafe-value,
   promise handling and consistent type-import rules. Check generated/spec/dev
   scopes explicitly. Prettier owns formatting; do not add conflicting style rules.
2. Require each intentionally ignored Promise to have a defined rejection/error
   outcome in its owner. A `void` prefix alone is not evidence of error handling.
   Angular event handlers and callback expectations need deliberate rule settings.
3. Configure selected Angular extended diagnostics as errors after measuring the
   current compiler baseline. Pin/review diagnostic changes on framework upgrades;
   do not silently enable every new check as a surprise release blocker.
4. Add semantic lint to existing npm check/CI. Characterize each non-trivial custom
   architecture rule with allowed/forbidden tests; never suppress an entire folder
   to obtain a green result.

Exit: current app/spec/template checks pass with zero enabled-rule violations;
CI command integration is reviewed, and no committed secret or hosted operation
is introduced. Existing CI file presence is verified; hosted CI execution/branch
protection is not established by this local audit.

### Batch B — Strengthen contracts and ownership

1. Classify all dependency candidates into type-only, static value and dynamic
   loading edges. Narrow the Auth/Modules entry points so data services/state do
   not import a facade that also eagerly exports pages and controls. Keep curated
   public APIs, lazy routes and existing injection lifetimes intact.
2. Extend the existing architecture scanner to resolved source ownership. Reject
   new cross-feature internals and unreviewed runtime cycles. A small documented
   type-contract file is preferable to a UI component owning a shared interface.
3. Address CC-04/05 in coherent slices, then enable each compiler option only when
   app/spec types and Angular compilation pass. Review null/undefined, DTO-to-view
   conversion, empty arrays and filtered selections against existing semantics.
4. Classify CC-06: retain intentional service startup, make it explicit/readable,
   and retain template context typing. Remove actual unused declarations only.

Exit: each reported edge/diagnostic has a reviewed resolution or an owned central
note; enabled gates have no blanket suppression. Verify login/restore/logout,
module/context navigation, localization, dirty-form navigation and lazy bundles.

### Batch C — Reduce concentrated responsibilities

1. Review MyDataGrid for coherent internal column/display settings, context action,
   selection/keyboard and geometry helpers. Reuse current helpers and controller
   before creating another abstraction. Feature pages continue to consume the
   same MyDataGrid public API; no feature-local grid shell or vendor bypass.
2. Review CountriesReadPage's column definitions/action composition and view
   coordination. Move pure domain presentation builders into named feature-owned
   utilities when that improves comprehension. Permissions/state remain with the
   owning policy/state; server authorization remains authoritative.
3. Review collection criteria/controller factory closures by responsibility, not
   line count. Preserve identity, selection, paging and immutable source contracts.
4. Treat AuthSession as correctness-sensitive. Review actor/context replacement,
   pending/uncertain operations and stale-response rejection before splitting any
   lifecycle orchestration. Do not introduce a second session store.

Exit: stable public API, smaller independently understandable responsibilities,
focused behavioral tests, same shared UI/keyboard/paging/error/draft behavior,
and unchanged build budgets. Consult PrimeNG MCP before actual shared-control
changes; metadata consultation cannot replace compiler/browser verification.

### Batch D — Establish ERP-specific regression discipline

1. Contract tests cover unknown API responses, server field-error mapping,
   null/omission and existing date/decimal wire conventions. Keep typed owner
   services; Angular forms retain their single Reactive Forms validator authority.
2. Async tests cover changed company/year/actor, stale responses,401/403, canceled
   reads, duplicate submissions, lost save responses, unsaved drafts and teardown.
   Use computed for derived state and effects for actual external synchronization;
   do not copy the same state into competing stores.
3. Browser tests cover shared controls in EN/AR/RTL, small/wide, keyboard/focus,
   Grid/Cards, input errors and the five required Countries views. Separate fixtures
   from explicitly authorized live-host checks; do not make CI depend on test-host
   uptime or credentials.
4. Track bundle size, lazy modules, initial/background request counts and actual
   slow computations. Optimize measured paths; avoid blanket memoization or an
   arbitrary no-functions-in-templates rule for inexpensive event callbacks.
5. Review recurring spacing/colors/scroll/empty/loading/error behavior globally in
   its shared owner. Existing PrimeNG adapters/tokens remain the single source.
6. Keep user data/tokens out of logs and diagnostics. New dependencies require a
   reason, pinned/reproducible resolution and a reviewed maintenance/upgrade path.

Exit: focused checks plus full current check pass; changed shared behaviors pass
their actual browser journeys. Record environment blockers and manual release
checks separately. Coverage targets prioritize risky behavior over a universal
100% number; tests must assert behavior rather than mirror implementation.

## 4. Review checklist and completion standard

For each maintenance PR/change, record the concrete problem, responsibility owner,
preserved contract, removed duplication, validation performed and material limits.
Review names, early returns, nesting, pure transformations, typed public interfaces,
business/UI ownership, resource disposal, error outcomes and translated accessible
feedback. Comments explain decisions; no generic wrappers, unused scaffolding,
opaque catch-all helpers or larger global stores are added solely for aesthetics.

Mark an item Verified only after its exact exit evidence exists. The initial audit
alone did not implement these changes; use CLEAN_CODE_IMPLEMENTATION.md and its
current receipts for implemented sources and final verification. Continue the existing one-active-feature rule: these
are technical hardening batches attached to the migration, not a new business
feature or an automatic replacement for S3-A8 acceptance/PROD-028.

Execution follows Batch A, then the Auth/Modules public-entry work in Batch B,
indexed/optional contracts and focused shared/feature responsibility extraction.
The single AuthSession owner is retained after reviewing its identity/generation,
context, pending and uncertain-outcome contracts; no split is justified solely by
its425line baseline. Pure criteria normalization and record-feedback decisions are
separated instead of moving business behavior into Shared.

## 5. Primary references

- [Angular style guide](https://angular.dev/style-guide): naming, focused components,
  related files, presentation and derivation guidance.
- [Angular extended diagnostics](https://angular.dev/extended-diagnostics): warning
  versus error configuration and upgrade considerations.
- [angular-eslint](https://github.com/angular-eslint/angular-eslint) and
  [typed linting](https://typescript-eslint.io/getting-started/typed-linting/): semantic
  and Angular template checks; verify installed-version compatibility at adoption.
- [TypeScript indexed access](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
  and [exact optionals](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html).
- [Angular signals](https://angular.dev/guide/signals) and
  [runtime performance](https://angular.dev/best-practices/runtime-performance).
