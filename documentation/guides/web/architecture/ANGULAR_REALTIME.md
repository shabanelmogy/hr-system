# Angular realtime and finite reads

Platform `RealtimeEvents`, exported by `platform/realtime/public-api.ts`, supplies a
cold `watch(isCurrent)` Observable. Each subscription owns one lazy SignalR
connection. Current Countries owns one lease for its immutable authorized actor;
the service does not know business permissions or resources. A future consumer
must explicitly own and dispose its lease. This is not a global entity store.

The exact configured HTTPS API origin supplies Cookie-authenticated
`/api/v1/browser-auth/realtime-token` and `/hubs/company`. BrowserAuthService is
explicitly exported by the authenticated auth facade for Platform transport reuse.
Dedicated tokens are validated by the existing zod/mini auth-contract owner and
obtained afresh through accessTokenFactory; no token is persisted or logged.
SignalR10.0.11 loads dynamically; default negotiated transports remain supported.
No new API/domain/schema/native implementation or UI control.

The stream emits typed status, reconcile and validated entity-change events.
Envelope fields are eventId, occurredAtUtc, resource, action and nullable entityId.
Malformed/extra fields are rejected; the last512 case-insensitive GUIDs are
deduplicated per lease. No record data, mutation, permission or timestamp ordering
is inferred. Every successful start, including initial connection, reconciles the
subscription gap. Initial starts and subsequent closes share one capped
1/2/4/8/16/30second retry timer, cancelled on disposal.

The dedicated-token endpoint401 and ReceiveTokenRevoked use AuthSession's existing
context synchronization. Dedicated-token403 and hub HTTP401/403 end the lease;
hub denial does not repeatedly replace an otherwise valid Cookie session. The
DefaultHttpClient extension observes typed HTTP statuses before SignalR wraps its
negotiation failures. Browser tests cover the actual installed client, including
hub401/403, rather than relying on a fake exception shape alone. Authentication,
scope replacement and page destruction reject late import/token/start/callbacks.

Consumer example, inside an injection-owned effect:

```ts
effect(onCleanup => {
  const actor = auth.readIdentity();
  if (!actor || !allowed(actor)) return;
  const current = () => auth.readIdentity() === actor && allowed(actor);
  const lease = untracked(() => realtime.watch(current).subscribe(event => {
    if (!current()) return;
    // Reconcile or matching resource => coalesced finite read, never patch a DTO.
  }));
  onCleanup(() => lease.unsubscribe());
});
```

Countries coalesces matching hints250ms and records one trailing invalidation while
a read is pending. It revalidates the collection and open read-only detail, retaining
criteria. Editors/import drafts are separate owners and remain intact. Failed reads
produce existing shared errors; reconnect does not replay commands.

`createScopedRead.refreshInBackground()` retains a ready snapshot during a read for
the same immutable identity and exposes `pending()`. Completion replaces the data;
failure becomes error/forbidden. It does not keep stale data after a failed request.
An existing error retry uses visible loading. Initial reads, manual refresh and
criteria/scope changes retain their prior visible-loading behavior; identity changes
synchronously mask old data. `invalidate()` retains its explicit cancellation
semantics. Background refresh deduplicates while pending; Countries retains the
trailing hint outside the helper. This prevents a second full Grid loader on
initial SignalR reconciliation without dropping the correctness read.

MyDataGrid uses PrimeNG's built-in rowTrackBy with the existing typed row key. A
same-ID snapshot updates the existing row element and retains keyboard focus.
Empty/loading/error/forbidden feedback is limited to the visible table viewport
using logical sticky positioning and container width, so a wide table does not
center its message outside a compact/RTL viewport. No feature-local Grid fork.
PrimeNG MCP metadata was consulted and validate_usage accepted the installed Table
binding; that metadata check does not validate CSS, behavior or performance.

Verification owner: Platform/angular-countries-pilot-acceptance. Actual HTTPS browser
fixtures negotiate and handshake with the real client, test EN/AR at390/1440,
remote bursts/pending reads/reconnect/drafts/revocation/denials, and verify one initial
loading episode. Fixture timings are not a hosted performance benchmark. Full hosted
SignalR/CORS/jobs and final pilot acceptance remain PROD-019/023 and S3-A8.

Implementation follows the official
[SignalR client lifecycle](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client?view=aspnetcore-10.0)
and [authentication behavior](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz?view=aspnetcore-10.0).
Loading inspection also used Angular's
[performance guide](https://angular.dev/best-practices/runtime-performance) and
[deferred dependency rules](https://angular.dev/guide/templates/defer).
