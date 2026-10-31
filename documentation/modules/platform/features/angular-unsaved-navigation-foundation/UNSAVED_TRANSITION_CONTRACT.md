# Frozen S1-A6 registered-draft navigation/context contract

Bounded Web Shared registry, reusable confirmation host, authenticated router guard,
and pre-request user company/year/logout barriers. No new business editor/API/schema,
native runtime, saved drafts, HTTP cache/cancellation engine or NgRx/BFF. Actual
future editors must register their semantic draft state; unregistered editors cannot
be claimed protected. Current business editors are not ported by this kit.

## Registry and decisions

Each mounted editor registers a live getter for identity, monotonic revision, active,
semantic unsaved, pending and a synchronous invalidate callback (hide/reset old-scope
editor without saving). Registration uses a unique lifetime token and cleanup; no
shared string-key removal can release a newer registration. Owner retains baseline.
Shared snapshot/fingerprint includes every active registration and its state.
Recheck getters at request and confirmation, not only deferred Angular effects.
Pending participants deny user departure without confirmation or network mutation.
Clean participants permit. Dirty participants open existing ConfirmationDialog with
Cancel initial focus. Captured fingerprint/token fences consent. New/changed/removed
participants, draft revision, becoming busy or explicit authority invalidation cancel
pending decision false. Same destination request may join; competing destination
is denied until the first decision settles. Navigation supersession cancels only its
own navigation decision, not unrelated context work. Destroy/teardown settles false.
Acceptance does not reset draft or unregister before actual successful transition.

## Router integration

Use actual Angular CanDeactivateFn on AuthenticatedApplication with
runGuardsAndResolvers=always. The installed router executes deactivation checks on
reused components when this policy runs. This parent covers current authenticated
children and public departure. Do not patch Router methods or intercept document
clicks/history manually. The technical routed harness uses the same guard.
Canonical identity compares serialized UrlTree without queryParams/fragment,
preserving path/record ID/matrix parameters/outlets. Same identity query/fragment
changes are permitted and do not discard or cancel retained reads. Actual departure
including record/path/matrix/outlet change asks registry. Back/forward uses Router
canceledNavigationResolution=computed; rejected navigation restores committed URL.
Guard result does not grant permissions; later denied target leaves original draft
and existing reads intact. No read cancellation before accepted actual departure;
normal feature destruction handles source teardown. No API write replay.

## Trusted context and session integration

AuthSession switchCompany/runScopedContextUpdate and user logout must ask registry
before pending/contextChanging/localization disconnect/API calls. Keep existing
fast path timing for no active dirty/pending participants. After await recheck the
exact session reference, pending/restoring and available company/grants; fiscal
owner rechecks original selected context/allowed year immediately before its write.
Duplicate/superseded requests cannot write twice. Cancel/busy has zero network
mutation and no read identity invalidation. Accepted mutation preserves existing
CSRF/Cookies/recovery/readback. Clear or invalidate registered old drafts only after
verified actual scope change/successful fiscal context change, or forced authority
replacement/logout. Failed same-scope change retains draft. No confirmation can
veto external trusted identity/expiry. External synchronization cancels outstanding
consent before asynchronous readback; same-scope response need not clear draft.
If actual authority is absent/changed, invalidate old editor callbacks and registry
before new authority is exposed. Busy writes are not falsely called rolled back.

User logout asks once; forced auth loss cannot be blocked by dirty registry. Shell
must not navigate to login when user logout was canceled. API logout failure keeps
existing cleanup contract. Module selector uses real Router guard; rejected selection
keeps committed module. Intentional rejected-navigation feedback remains existing.

## UI, portability and limits

One global UnsavedConfirmationHost at app root reuses existing ConfirmationDialog,
translated core captions/bootstrap, modal/focus semantics and current tokens. No
new translation keys/resource fingerprint, native alert/confirm/beforeunload,
persisted sensitive drafts or custom confirmation shell. Hard reload/tab close/
external-document departure are explicitly Excluded from this runtime: browser
cannot await our shared modal; owner-managed save remains required. This limitation
stays FOLLOW-014 before claiming full dirty/recovery parity. Offline recovery and
attachments are independent scope. New native UI Excluded; source retained.

Dev-only routed neutral form harness with registered identity/revision/dirty/pending,
two destinations, query/fragment and record/matrix changes, browser history and
state/read lifetime counters. Use actual interceptor-free HTTP test backend for
AuthSession barriers; fixture requests are not live hosted/SQL mutation proof.
Web technical shared form/confirmation P-001 C-01 Required; production business
views/CRUD/Chart/Report/Import/Export/Tree and all new native views Excluded.

## Required verification

Registry tests: clean/busy/dirty/keep/discard, stale getter before render, revision,
owner registration replacement, overlapping destination, external invalidation,
cleanup, no premature draft reset. Actual RouterTestingHarness: query/fragment,
record/matrix departure, reject/accept, target-denial, superseded navigation and
retained-source lifetime. AuthSession tests: canceled/busy company/year/logout
zero write/disconnect, accepted exact request, changed authority during consent,
verified/failed context readback and forced external cleanup. Browser EN/AR/light/
dark/390/1440 plus keyboard/focus/history and current context/login/form regressions.
Full Angular check, canonical docs/planning and portable evidence before Verified.
No domain/schema change: EF/live DB/five business UI journeys N/A.
