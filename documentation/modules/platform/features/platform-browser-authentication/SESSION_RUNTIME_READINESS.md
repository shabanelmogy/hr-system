# Session correctness — bounded runtime entry

Date: 2026-10-28. User authorized continuing with the proposed session repair,
then browser transport. This record authorizes the first bounded API increment,
S0-AUTH-R1 — Session correctness, inside the existing active feature. The overall
Angular migration stays Draft. Browser Cookie endpoints and Angular UI remain
later work in this same feature/dependency chain.

Exit result: S0-AUTH-R1 **Verified** on 2026-10-28. See
[SESSION_IMPLEMENTATION_REPORT](verification/SESSION_IMPLEMENTATION_REPORT.md)
for actual SQL scenarios, 1139 passing Release tests and retained-client focused
regressions. This closes only the session increment, not the broader feature.

## Exact scope and gate review

| Gate | Result for S0-AUTH-R1 | Evidence / fixed decision |
| --- | --- | --- |
| G0 | Passed | Platform extends its existing Identity session adapter, same tables/contracts, one active feature; no new identity owner |
| G1 | Passed | Same-session refresh, original absolute expiry, 30-second inclusive grace; stale logout revokes active tokens of its retained SessionId; switch replaces only a currently active source session |
| G2 | Passed | Existing UserManager/EF concurrency stamp and atomic save proved on migrated SQL in PREFLIGHT_PROOF_REPORT; conflicting saves return 409, no blind server retry; actual adapter tests required before acceptance |
| G3 | Passed | No new Web/native visual surface or storage change; existing bearer wire remains; retained auth consumers must regress, no new permissions or UI pattern |
| G4 execution inputs | Passed for implementation | Named scenarios/tests below, disposable SQL migration verification, same schema, no backfill; one active API stage, later stages queued |
| G4 release | Pending release only | PROD-016/017/019 deployment/production configuration; cannot change this increment's frozen session semantics; no deployment authorized |

The remaining G4 production checks are release-only for this increment under
PLAN_QUALITY_GATE.md's bounded slice rule. Actual adapter test results are exit
criteria, not an unresolved product decision. RISK-018 records unimplemented
defects to repair, not accepted behavior. DEC-027 remains open for later browser
binding, so this increment adds no Cookie authentication or HTTP browser routes.

## Frozen lifecycle and concurrency contract

- Refresh validates the signed access/refresh pair, user stamp, disabled/lockout
  state and available company. Generate replacement material before mutating the
  loaded refresh rows. Revoke presented token and insert replacement in one
  UserManager save, keeping SessionId and ExpiresOn. No partial save before issue.
- A retained rotated token within 30 seconds returns 409 without changing the
  active successor. Beyond grace revoke active rows for that SessionId and return
  401 only after successful persistence; conflict/failure must be surfaced.
- Logout with any retained refresh hash revokes all active tokens in that same
  session, preserving other sessions. Unknown/pruned hashes and sessions with no
  active token are idempotent success. This is bounded history, not token-family
  ancestry: a pruned token cannot identify/revoke its successor.
- Refresh/logout/switch competing saves use existing optimistic concurrency;
  one commits, the loser reports 409. Logout conflict means revocation was not
  confirmed; caller may retry/reconcile, never claim it completed. No automatic
  retry of an issuance or switch. If logout commits first, later refresh/switch
  cannot resurrect that source session. If switch commits first, old-session
  logout does not revoke the new session, because switching intentionally creates
  a different session; clients serialize these operations and fence late results.
- Switch must recheck an active source SessionId and current company in the loaded
  user, current stamp and disabled/lockout state. New session creation and old
  revocation share one save. Other devices remain active. Concurrent refresh and
  switch cannot both commit from the same loaded concurrency stamp.
- Existing bounded inactive-history policy applies. Never log raw credentials.
  Credential wire shape/URLs remain unchanged. Shared conflict error codes use
  the existing User.RefreshTokenAlreadyRotated/User.RefreshTokenUpdateConflict.

## Required verification and rollback

Exercise actual adapter issuance, refresh, stale/latest/unknown logout, grace
boundary/late reuse, wrong pair, expiry, unavailable company, locked/disabled or
stamp-changed account, source-session denial and unrelated-session preservation.
Deterministic barriers must coordinate real SQL writers for refresh/refresh,
refresh/logout and refresh/switch, asserting database state and loser result.
Verify second-request behavior after the winning revocation/replacement. Use real
JWT generation/validation with test-only keys and real EF/Identity saves; no
hand-constructed replacement rows as a substitute for adapter execution.

No EF model change is planned. Apply current Platform migrations to a disposable
database and compare model drift. Before release use existing module migration
operator/checks; no user database migration is needed for this source-only fix.
Rollback is code rollback with existing schema retained; do not un-revoke sessions
or recreate tokens. Existing issued credentials remain bounded by their original
expiry, and users can reauthenticate. Run focused tests, retained-client regression,
full API gates and documentation checks. Actual browser transport remains pending.
