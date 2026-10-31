# Frozen existing scoped read lifecycle contract

S1-A12 SIG-01/02/03 within existing Shared data helper, no new query/global cache
engine. G0-G3 frozen;365 recipes/planning and current-only Phase00 before runtime.
Remaining G4 PROD-002/017/019/RISK-018 release-only, overall migration Draft.
No API/domain/schema/native/resource/security/permission/business watcher changes.

## Existing-System Relationship Review and source findings

Graphify/current createScopedRead and three existing tests, AuthSession.readIdentity,
ModuleCatalogState/DashboardState/FiscalContextState/services reviewed. readIdentity
is null while contextChanging; immutable current user otherwise. Services already
use finite HttpClient body observables, unknown parsers, HTTPS cookies and10000ms
timeout; preserve their transport/schema/timeout ownership. Next/native React Query
country hooks retained; no new framework or copied cache/offline policy.

Existing helper switchMap/toSignal already deduplicates consumers, masks identity
replacement synchronously, cancels subscriptions and maps403/error. It calls load()
outside deferred inner error handling; synchronous factory throw can terminate the
outer identity stream. EMPTY can leave loading forever, multi-emission source can
behave like an accidental watcher. refresh intentionally ignores loading, so it is
not a reliable owner live-invalidation mechanism. Extend this helper generically.

## Exact helper contract

load:(identity:I)=>Observable<T>, passing captured immutable identity to the source.
Existing zero-arg callbacks remain assignable/backward compatible. Loader emits a
complete validated DTO/body, never HTTP progress events or partial business state.
Use defer around factory, take(1), throwIfEmpty and existing inner error mapping.
First snapshot completes/unsubscribes inner source; no bootstrap watch stream. Empty
or synchronous factory failure yields retryable error, not a stuck loading/terminal
identity stream. HTTP403 yields forbidden; no retry/refresh/invalidate bypass until
new allowed identity. Other errors remain generic error; DTO/timeout policy service-
owned. NEVER without a timeout remains service responsibility, not a new global
timer/default. Existing ready/error/forbidden/loading public states preserved.

retry(error only) and refresh(ready/error only) retain loading deduplication. Add
invalidate for an explicit owner-owned live hint, including during loading: cancel
the pending snapshot and start one fresh read. Dispatch only for current non-null
allowed identity when snapshot identity matches, and never forbidden. If identity
has changed before the toObservable effect runs, skip old dispatch; next identity
bootstrap sees current source once. No queue/debounce/watch subscription in Shared;
owner chooses hint coalescing/reconnect/missed-notification reconciliation.

toObservable/toSignal remain component/injector-scoped. Complete internal retry
subject on DestroyRef; no future load/emission after owner destruction. Replace
identity on actual scope/session/authorization change, never mutate it in place.
Allowed predicate pure from identity; no hidden independent permission signal.
Current AuthSession nullable readIdentity prevents transitional loads; no changes
to that session protocol or business authority. Old identity result is synchronously
masked even before cancellation effect settles. No stale data in forbidden/error/
loading state. API still authoritative; Shared never grants permission.

## Separate owner watch and loading ownership

Owner finite snapshot/service and optional separate live hint subscription are
distinct. A live hint calls invalidate; a signal is not new data or authority.
Owner uses takeUntilDestroyed for watcher, rejects wrong-scope hints and decides
reconnect/missed hint policy before actual business acceptance. No actual SignalR
business registration or API notification schema from this technical kit.
FeedbackState/page/local action busy belongs to existing read owner. No global
overlay/spinner or success notification on every background read. Refresh is busy-
coalesced, retry only error, forbidden stays forbidden. Real consumers' loading
scope/timeout/permissions/selected lookup labels must be verified under FOLLOW-017.

## UI Pattern / Rules / Edges / Impact

Web P-001/C-01 neutral dev/reads snapshot + navigation-away lifetime proof Required.
Reuse PageHeader/ActionButton/OptionSelect/FeedbackState/SurfaceCard/StatusBadge,
existing SQL-backed captions, no new UI shell/key/resource/hash. Dev-only probe
counters/Subject/timers are fixtures, not product query/cache architecture.
Business CRUD/Grid/Cards/Chart/Report/Import/Export/files/offline/new native views
Excluded independently. No EF/domain five-point audit for technical helper.

Rules: Shared finite snapshot/error/lifetime/dispatch; service unknown parsing/
HTTP10000ms timeout; owner immutable identity/allowed/watch/coalescing/UI loading/
reconnect/permission. Edges:first value/unsubscribe/empty/sync throw/403/error/retry/
refresh while loading/live hint during load/new identity before effect/null/auth
loss/rapid scope/late callback/route destroy/watch teardown. Existing three tests
retained and extended; no business write/transaction/race policy inferred.
Impact:Extend createScopedRead only and tests; Reuse public API/states/current
owners/UI/service contracts; Add neutral proof/browser; Retain API/Next/native/
locale resource; N/A mutations/schema/new query framework/business watcher.

## Verification and limits

Existing helper tests plus captured identity/finite snapshot/empty/sync-error/403/
retry/refresh/invalidate pending/race/destroy and separate watcher teardown. Full
Angular252 baseline + new tests/types/architecture/catalog/tokens/fonts/build500kB.
Browser40palette/mode/EN-AR390/1440 plus focused8 complete snapshot/live hint/
pending/403/retry/scope/session/null/route-destroy/probe teardown flows. Existing
module context/role home/company/fiscal/login/language owner browser regressions
as affected. API43/catalog7 S1-A9 retained, unchanged resource, not rerun/live SQL.
365recipes/planning/diff before Verified/technical guide/closure. Actual S3 live
lookup/watch/reconnect/labels/HTTP transport acceptance remains FOLLOW-017.

## Primary references

- https://rxjs.dev/api/index/function/defer — factory errors become stream errors.
- https://rxjs.dev/api/operators/take — first snapshot completion/unsubscription.
- https://rxjs.dev/api/operators/throwIfEmpty — empty completion is an error.
- Installed RxJS7.8 source comments/implementation verify exact operator behavior.
- https://angular.dev/ecosystem/rxjs-interop — injector-scoped toSignal/toObservable.
- https://angular.dev/guide/http/making-requests — HttpClient observable lifetime.
