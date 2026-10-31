# S1-A12 existing scoped read lifecycle — implementation and acceptance

Phase06: **Verified**2026-10-30. Bounded existing Shared data/SIG-01/02/03 slice;
365recipe/planning Phase00 passed before runtime. Overall migration Draft.
Source main a2c56412 plus preserved local changes; no commit/push/deploy/live writes.

## Delivered behavior and ownership

Extended existing createScopedRead. Its public ready/loading/error/forbidden states
and manual retry/refresh remain compatible, no global cache or replacement query
framework. Loader now receives the captured immutable identity; existing zero-arg
callbacks remain valid. defer contains factory exceptions, take1 closes the inner
source after one complete DTO/body, throwIfEmpty maps missing data to retryable
error. HTTP403 retains forbidden authority. Retry after sync failure/empty works
without terminating identity observation. False/0/null/empty first values are not
truthy-filtered; each service owns actual DTO validation/allowable data/timeout.

Manual refresh stays coalesced while loading, retry error-only. New invalidate is
an explicit owner live-hint operation: cancels pending current allowed snapshot,
loads once afresh; cannot bypass forbidden/null/stale identity. If identity changes
before the effect dispatches, old subscription is not refreshed; next bootstrap
handles the latest identity once. Synchronous old-identity masking retained, actual
subscriptions switch/cancel, internal retry Subject completes on DestroyRef. No
future load after owner destruction. No queue/debounce/watch in the helper.

Owner separately subscribes to authorized hints, filters current scope and uses
takeUntilDestroyed. A hint does not become data or permission. Actual reconnect,
missed-event reconciliation/selected labels/coalescing/loading policy remains
FOLLOW-017 for the real S3 consumer. No business SignalR/API event schema added.

## Source and service boundaries

Graphify/helper and3existing tests/AuthSession.readIdentity/current module catalog,
dashboard and fiscal owners reviewed. Services use validated unknown HTTP bodies,
secure cookies and10000ms timeout; retained unchanged. readIdentity is null during
contextChanging, current immutable user otherwise. Allowed predicate is pure from
identity, not hidden mutable authorization. Callback identity argument is available
to future typed services; no new API/body/permission/schema/native/resource change.
Next/native React Query/offline/cache ownership retained.

Shared FeedbackState/actions/PageHeader/SurfaceCard/StatusBadge/OptionSelect compose
neutral dev/reads and navigation-away proof. No feature-local shell/global spinner.
Probe Subject/timer/counters are dev fixtures excluded from production, not another
query engine. Ready snapshot completes its source (active0), optional watcher stays
separate (watchers1), route destruction closes both (0/0), late hint cannot load.

Existing SQL-backed core keys and current7200-entry catalog/hash unchanged:
cba7ae1870dceb9a239811ecd0f9a4be1126577a32dfa1c748c94eb639fa0dc6.
Role-home mocked scoped text/reload proof retained in fresh14-case driver; this is
not a new live database persistence test. API43/catalog7 S1-A9 evidence retained,
not rerun because no resource/API code changed.

## Verification corrections

Existing role-home driver still intercepted a hardcoded localhost API. Hosted
configuration therefore reached an unmocked session and displayed sign-in. Added
the same ANGULAR_API_ORIGIN override used by peer drivers, default unchanged;
fresh14 cases pass with hosted-origin interception. No runtime connection workaround
or weakened assertions. Other source/core/helper tests passed first implementation.
Node fixture module-type warning remains a test-driver environment warning; all
assertions pass. Source-stability guard rejects HMR during browser acceptance.

## Acceptance

| Check | Actual result |
| --- | --- |
| Angular full check |42files/264unit; helper3→15 tests (+12) |
| Architecture/config |10architecture/4configuration passed |
| Types/catalog/tokens/fonts | Strict app/spec, catalog, tokens,14fonts pass |
| Production build |474.00kB initial/124.37kB estimated transfer;500kB unchanged, no warning |
| Read lifecycle browser |40palette/mode/language/width plus focused8 complete flows |
| Current owner browser |Application context24/home14/company14/fiscal15/login10/language20 pass |
| API/catalog baseline |S1-A9 API43/catalog7 retained; no resource/code change, not rerun |
| Phase00 |365recipes/planning passed before runtime |

JSON/four PNG captures portable under verification/. Actual Observable/Subject/
timer teardown plus real Router owner destruction, not mocked helper callbacks.
Probe makes no API request; platform regressions intercept hosted API. No live SQL
write/host publication or actual business watcher acceptance claimed. No business
CRUD/Grid/Cards/Chart/Report/Import/Export/files/offline store/native rewrite added.
Domain five-point/EF audit N/A technical helper.

Feature regressions none at final acceptance. FOLLOW-017 actual lookup/live owner
contract and SIG-01/02/03 consumer acceptance remain Required; no full S1 exit from
this harness alone. PROD-002/017/019/RISK-018 and inherited RISK-012/date vendor
NG0956 retained. Full API/Next/native suites not repeated for this Web-only change.

## Reproduction and primary references

```powershell
npm --prefix web-angular run check
# Finish source/config writes before stable browser acceptance.
$env:ANGULAR_PREVIEW_ORIGIN='https://localhost:4220'
$env:ANGULAR_API_ORIGIN='https://shabanhrms.runasp.net'
npm --prefix web-angular run verify:read-browser
npm --prefix web-angular run verify:read-browser -- --focused
node web-angular/scripts/verify-home-browser.mjs
./documentation/system/Generate-Documentation.ps1 -Check
./documentation/plans/Check-Planning.ps1
```

- https://rxjs.dev/api/index/function/defer — factory errors become stream errors.
- https://rxjs.dev/api/operators/take — first snapshot completion/unsubscription.
- https://rxjs.dev/api/operators/throwIfEmpty — empty completion becomes error.
- Installed RxJS7.8 source comments/implementation verify exact operator behavior.
- https://angular.dev/ecosystem/rxjs-interop — injector-scoped subscription lifetime.
- https://angular.dev/guide/http/making-requests — finite HTTP body/abort behavior.
- https://playwright.dev/docs/network#handle-requests — configured-origin interception.
