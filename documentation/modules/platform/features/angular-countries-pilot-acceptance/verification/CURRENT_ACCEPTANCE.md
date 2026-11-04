# Current S3-A8 acceptance — 2026-11-01

Non-report acceptance Verified. Complete Phase06 remains Not Verified for the
hosted report catalog/render only (PROD-028). See FINAL_ACCEPTANCE.md and
final/SUMMARY.json:253fresh fixture browser cases,7actual hosted cases,472unit
tests and complete current format/lint/types/architecture/build gates pass.
Report UI fixtures are verified; actual catalog503 is still blocked. Phase07
has not started and the business route remains development-only.

## Historical bounded increment — 2026-10-31

The following entry is retained as historical evidence. Its size, selector and
hosted-delivery gaps are superseded by the current final acceptance above;
other release boundaries remain attributed to their owning notes.


2026-10-31: bounded realtime/loading increment passes full Angular check79files/464tests,4configuration and12architecture tests, types/templates/catalog/tokens/fonts and production build. Real installed SignalR client passes9 HTTPS browser cases: EN/AR at390/1440, remote bursts, malformed/other-resource/duplicate hints, one trailing pending read, reconnect, editor/import drafts, revocation, no-view, token403, initial503retry and hub401/403. The four presentation cases verify exactly one initial loading episode, ready rows during background reconciliation, same row DOM and keyboard focus, and visible forbidden feedback. Import smoke1 and import journeys5 including keyboard page-size/next paging pass. Initial502.19kB/132.13kB transfer warns2.19kB above unchanged500kB threshold (FOLLOW-019); no hosted speed or full-pilot pass is claimed.

## Requested loading correction

The requester observed additional loading when opening Countries. Code inspection
confirmed initial SignalR reconciliation used a foreground refresh, replacing ready
rows with a second loading state. Shared createScopedRead now has explicit optional
refreshInBackground/pending; only Countries live hints use it. Existing initial,
manual and criteria-loading semantics remain. One correctness reconciliation read
still follows first connection to cover the subscription gap. This is not a claim
that the HTTP request count was reduced to one or that hosted latency was measured.
Burst requests are coalesced, pending reads are not repeatedly cancelled, and failures
still show shared error/forbidden states. Scope changes immediately mask old data.

PrimeNG's built-in rowTrackBy now consumes the existing typed key. Same-ID fresh
snapshots preserve row elements and keyboard focus instead of rebuilding every row.
Shared Grid feedback previously centered across1678/1788px table content, outside a
390px viewport. Container-width/logical-sticky placement fixes visibility in EN/AR,
including after realtime revocation. PrimeNG MCP was consulted before this shared
change and validate_usage accepted the final Table binding. Metadata cannot prove
CSS, layout or runtime correctness; actual browser viewport assertions supply that.

## Evidence classification

- Current bounded tests/browser: Passed, exact receipts above.
- Legacy Angular read browser harness: Not passed; it targets removed cards-view and
  other historical selectors. Failure receipt retained; FOLLOW-021 owns refresh of
  this broader harness before complete S3-A8 acceptance. It is not relabeled a pass.
- API/native/Next source: retained existing contracts; no runtime change or new pass.
- Hosted SignalR/CORS/jobs, final five-view/lifecycle matrix, Table capabilities and
  production-size acceptance: still Required by S3-A8/central notes.
- Phase06 for complete pilot: Not Verified. Phase07 not started. Development route
  retained; no production business route enabled, hosted writes, publication/commit.

## Implementation sources

Generic Platform realtime public API owns cold lease/validation/dedup/retry/lifetime.
Countries owns permission/resource selection,250ms coalescing/page-detail hints.
BrowserAuthService mints dedicated tokens from the existing Cookie endpoint.
Typed HTTP status inspection catches denial before SignalR wraps negotiation errors.
Token-endpoint401/revocation resynchronize context; hub401/403 terminate the lease
without looping valid Cookie-session replacement. See ANGULAR_REALTIME.md for the
public contract, authentication limits, references and future consumer example.
