# S3-A8 frozen pilot contract — 2026-10-31

## Exact authority and readiness

Existing approved migration, single feature angular-countries-pilot-acceptance; no new business capability. G0 passes: ReferenceData owns global Countries; Platform owns generic browser realtime, existing five views/actions retained. G1 passes: existing API permission/action/atomicity/validation contracts remain authoritative. G2 passes: lazy official SignalR client, existing HTTPS origin, Cookie-minted dedicated realtime token held in memory, owner-scoped subscription and immutable actor lifetime; no BFF/NgRx/persisted token/new API/schema. G3 passes: existing P-001 shared collection/form/dialog/feedback and PrimeNG controls, EN/AR/RTL and all five palettes. D35 removes mandatory Next review. Phase00 current books/manifests and generation/check/planning are required before runtime. Remaining G4 host/engine/release checks PROD-019/023 and RISK-016/017 cannot alter this contract; overall plan remains Draft.

## Current increment and full exit

Implement generic Platform realtime service and Countries consumer first. No production business route until complete five-view/action/permission/layout/keyboard/host/size acceptance. This increment does not close S3-A8, enable a route, complete Table FOLLOW-016 or claim hosted acceptance. FOLLOW-017 receives actual Countries watcher evidence; FOLLOW-019 remains production-size work. These are existing central owners, not silent deferrals.

## Current acceptance — 2026-11-01

Non-report exits above are Verified by verification/FINAL_ACCEPTANCE.md:
253fresh fixture browser cases,7actual hosted cases, current full technical gate,
configured controls/actions/keyboard and complete palette matrices. Real hosted
post-commit delivery and offline reconnect are now evidenced; current size budget
passes. Remaining current pilot blocker is PROD-028 actual managed report catalog/
AR-EN render. Complete Phase06/07 and business-route activation remain held.
Unrelated optional Table powers and production release gates retain their owners.

## Existing API, verified source

GET /api/v1/browser-auth/realtime-token returns {token}; existing Cookie session and timeout10s. Hub /hubs/company uses Realtime JWT scheme with dedicated audience/scope and tenant/company/user claims. ReceiveEntityChanged payload: eventId GUID, occurredAtUtc timestamp, resource lowercase kebab plural (Country -> countries), action nonempty string, entityId nullable string. CountryChangedJob targets Countries:View permission groups after commit. Treat every valid countries action as an invalidation hint, including unknown future actions; never trust event data as a record or authorization. ReceiveTokenRevoked stops the old connection and invokes existing AuthSession context synchronization. No new notification inbox/deep-link feature in this increment.

## Connection lifecycle and failures

One cold subscription owns one lazy connection; current Countries workspace creates one subscription only with exact countryReadAllowed immutable actor. Check actor before and after async import/token/start/callback. Stop/unsubscribe on actor replacement, permission denial, page destruction and context change; late callbacks cannot emit. Dedicated token is obtained via exact origin with credentials, validated, never persisted/logged. Official SignalR default transport negotiation; credentialed cross-origin, accessTokenFactory obtains a fresh token when requested, logging disabled. Initial/reconnect retry owned by one timer, capped exponential delay1/2/4/8/16/30seconds, indefinite only while current lease; no concurrent starts or write retries.401/403 terminates lease. Token-endpoint401 and explicit revocation synchronize auth; hub401/403 do not repeatedly replace an otherwise valid Cookie session. Denial remains until actor replacement. Each successful start, including first connect, emits reconciliation to cover snapshot/subscription gaps. Connection failure does not erase an otherwise valid finite HTTP snapshot. Document server deployment support separately.

## Read reconciliation

Validate event envelope, reject malformed payload and other resources. Bounded512-event dedup per lease; no ordered timestamp assumption. Burst-coalesce Countries invalidations250ms. Refresh page and open read-only detail; retain one trailing invalidation arriving while a read is loading, do not cancel/restart repeatedly. Each read gets at most one trailing refresh per observed burst; no automatic retry loop after a failed refresh without another hint. Preserve query/filter/sort/page, existing clamp and current actor masks. Never mutate or close edit/import drafts, replay a command or patch rows from event values. Live arrival may make a read stale; it does not supply optimistic concurrency absent in the API.

## Verification and release boundaries

Meaningful service/lifetime tests: connection ready/retry/burst/duplicate/malformed/revoked/401/403, stale token/import/start and actor disposal. Countries tests: reconnect snapshot+detail reconciliation, in-flight trailing refresh, criteria/auth changes, no forbidden requests. Angular full checks and actual HTTPS browser journeys for remote change/reconnect/dirty-editor survival/permission loss. Existing five-view suites remain independently Required for final pilot acceptance. Native client unchanged/Excluded from new implementation; browser compact is Web. No domain modification or EF migration. Phase06 remains Not Verified for complete S3-A8 until all required exits; Phase07 not started.

## Recorded implementation precision and requester correction

Installed SignalR wraps negotiation HTTP errors, discarding statusCode. Its public
DefaultHttpClient extension inspects typed denial before wrapping; verified actual
hub401/403 stop. This preserves the frozen deny/no-loop intent, not a new permission.
Requester loading observation authorized the corrective shared background-read path,
built-in typed rowTrackBy and visible viewport feedback. Same-actor background reads
retain ready data/pending, never retry a mutation, mask actor changes immediately and
show final errors. Initial/manual/criteria reads preserve visible loading. Phase00
had passed before runtime; these are compatible precision fixes within S3-A8.
