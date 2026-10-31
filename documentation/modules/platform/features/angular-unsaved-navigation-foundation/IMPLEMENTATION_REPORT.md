# S1-A6 — Registered draft navigation and context protection

Phase06: **Verified** on2026-10-29 for the exact registered-draft technical kit.
Only editors that register live semantic state are protected. No business editor
CRUD, API/schema/native UI or hard-reload recovery is implemented by this slice.
Source main a2c56412 plus prior migration and this working-tree increment.

## Delivered behavior and ownership

UnsavedChanges is the Shared domain-neutral registry. Each editor supplies a live
getter for identity, revision, active, semantic unsaved and pending, plus an owner
invalidation callback to quarantine an old-scope editor. Unique registration tokens
and idempotent cleanup prevent old unmount from releasing a newer editor. Actual
getter values are read at request/confirmation, not only through cached computed
state. Busy work blocks departure; clean state permits it. Dirty state asks the
existing ConfirmationDialog through one root UnsavedConfirmationHost. Same-key
requests join; competing destinations deny. Revision/owner/registration/busy/active
changes fence old consent, and old queued answers cannot confirm a later request.
Consent itself never resets or removes a draft. Failed/denied transitions retain it.

UnsavedNavigation uses actual Angular CanDeactivateFn on AuthenticatedApplication,
runGuardsAndResolvers=always and canceledNavigationResolution=computed. UrlTree
identity excludes query/fragment while preserving record segments/matrix/outlets.
Query/fragment updates retain editor/read lifetime. Record/matrix/departure and
browser back/forward ask consent; denial restores committed URL. Target denial
after consent retains draft. Superseded navigation cancels its own pending prompt.
No Router monkey-patch, document click interceptor or custom browser history engine.

AuthSession checks registered drafts before user switchCompany, scoped fiscal-year
updates and logout. Cancel/busy sends no mutation and does not disconnect locale
or read identity. After asynchronous consent, it rechecks current session/pending
and draft fingerprint; fiscal owner rechecks selected context and allowed target.
Verified changed authority/successful scoped update invalidates old owners. Failed
same-scope change retains data. Forced logout/identity/permission/readonly/role/year
change cannot be vetoed by old dirty state. External notifications cancel stale
consent first; same-scope verified readback preserves edits. No client action grants
API authority or treats request cancellation as server rollback.

Shell no longer navigates to login if user logout was canceled. Current module
selector goes through real Router guard and retains committed selection on denial.
Existing context-specific recovery/CSRF/Cookie/readback remain authoritative.

The root confirmation is loaded with Angular @defer on first prompt, preserving
the initial budget. Existing translated core captions/SQL localization and token
themes are reused. No new catalog key, fingerprint or API resource changed.
Local FormCloseGuard remains independent; no parallel UI shell was added.

## Verification actually executed

| Gate | Result |
| --- | --- |
| Entry |317 recipes/current planning, source audit/frozen contract/four books/current manifest before bounded runtime |
| Complete Angular |33 files/160 tests;10 architecture/4 configuration; strict app/spec types, tokens/fonts/catalog/build pass |
| Production build |465.01kB initial/122.64kB estimated transfer; unchanged500kB warning budget, no budget warning |
| New meaningful coverage |22 tests added over138:10 registry,3 actual Router,7 auth,1 fiscal external truth,1 vendor selection retry |
| Route browser |40 palette/mode/language/390-1440 cases plus8 final complete flows including back AND forward cancel/accept |
| Actual context owner browser |8 EN/AR/light-dark/390-1440 cases with actual AuthSession/FiscalContextState and intercepted API; cancel/busy zero writes, accepted company/year/logout exactly once, same-scope external preserves draft |
| Existing context regression |Company14, Fiscal15, module-context24, login10, language20 and local-close8 pass |
| Neutral fixture behavior |Zero /api/ requests/native dialogs; retained source lifetime survives denied navigation and is disposed on accepted departure |
| Source/transport boundary |No real hosted/SQL write/deployment; context HTTP is intercepted. No API/Next/native runtime/domain/schema change |
| Canonical |Four books/current manifest/recipes and portable JSON/PNG reconciled; final planning/check at closure |

New cases include plain-getter stale changes before render, changing registration,
busy clean participants, joining/competing requests, forced external authority,
same-scope preserved edits, failed context readback, scoped update and permission
loss. Actual Router tests exercise reused parent/record/matrix, query/fragment,
denied targets and supersession, without mocked Router.navigateByUrl behavior.

## Findings and prevention

- Existing context methods invalidated reads/localization before any draft barrier.
  The new barrier precedes those side effects; tests assert zero mutation/disconnect
  on canceled and busy attempts. Never fence only the visible button callback.
- A Next-style cached registry snapshot would miss plain getter changes. The
  registry calls current getters at each authority check; Signals drive automatic
  prompt cancellation, and nonreactive getters are still rechecked before accept.
- PrimeNG22 Select updateModel calls onModelChange and then writeModelValue. Resetting
  an external-commit selector synchronously inside the CVA callback was overwritten,
  leaving an uncommitted selection and preventing retry. OptionSelect now silently
  reconciles the current externally committed value in a guarded microtask. A test
  invokes the actual vendor option path twice; browser company denial/busy/retry
  proves it. Immediate preference behavior remains covered by language20.
- Eager root modal import initially produced997.77kB with a budget warning. Actual
  Angular @defer moved the host to lazy loading; final initial465.01kB meets the
  original budget. This is a measured improvement; lazy bytes still load as needed.
- Company/fiscal fixture drivers had a hardcoded local API origin. They now consume
  ANGULAR_API_ORIGIN for the chosen hosted-target build, retaining local defaults.
  Fiscal delayed fixtures release waiters on failure so browser teardown cannot
  hang. No live target response is counted as fixture acceptance.
- The first company run timed out during parallel browser activity; the stable
  rerun passed14 scenarios without reducing assertions. The final fiscal run passes15
  including denial/lost-response/unverifiable/malformed/empty/permission/cross-tab.
  Earlier interrupted runs are not acceptance evidence. Do not edit served modules
  during final browser collection; rerun a scoped affected check after actual edits.

Development AuthenticatedApplication/ModuleWorkspace NG0912 and Node fixture
MODULE_TYPELESS warnings are inherited (FOLLOW-015 owns wrapper identity). New
neutral frame uses an explicit unique selector. RISK-012 retains installed Next
dependency drift; focused Angular passes do not erase its separate release gate.

## Explicit limits and consumer contract

Every future editor registers its semantic draft/busy state and lifecycle cleanup,
increments revision on any meaningful draft change, and owns baseline comparison.
Its invalidate callback must hide/quarantine old authorized data and fence writes;
it must not save/replay a draft. No automatic registration of unported CRUD screens.
An accepted navigation does not guarantee a later target permission check succeeds.

Hard reload/tab close/external document navigation are Excluded from this runtime;
no native beforeunload/alert/confirm or sensitive draft persistence was added.
FOLLOW-014 retains the explicit save/recovery policy before full unsaved parity.
SIG-02 broader request metadata/POST-read/cache lifetime and ERP-02 actual business
reference consumers remain later evidence; this Router guard is not a cache engine.
PROD-002/017/019/RISK-018 and FOLLOW-012/015/016 retain their existing boundaries.
EF migrations/live-schema/five business UI journeys N/A: no domain/schema change.

## Reproduce

Run npm --prefix web-angular run check. In a development preview open
/dev/unsaved/1; edit a value and use query/record/matrix/leave/denied links. Busy
blocks departure; Cancel/Escape preserves data. Back/forward is checked by the
driver. /dev/unsaved-context uses actual session/year owners; acceptance driver
intercepts API and requires no credentials. Both routes are excluded from production.
Set ANGULAR_PREVIEW_ORIGIN for your preview, run verify:unsaved-browser (and
-- --focused), and node web-angular/scripts/verify-unsaved-context-browser.mjs.
Retained company/fiscal drivers also accept ANGULAR_API_ORIGIN. Portable files in
verification/ are sufficient to review outcomes on another device; ignored caches
are not canonical. No commit/push/deployment occurred; local license stays private.

Primary references: [Angular guards](https://angular.dev/guide/routing/route-guards),
[CanDeactivateFn](https://angular.dev/api/router/CanDeactivateFn),
[Router](https://angular.dev/api/router/Router),
[deferred loading](https://angular.dev/guide/templates/defer),
[PrimeNG Select](https://primeng.dev/select) and
[Angular CVA](https://angular.dev/api/forms/ControlValueAccessor).
Installed vendor/router source and actual executable tests establish behavior.
