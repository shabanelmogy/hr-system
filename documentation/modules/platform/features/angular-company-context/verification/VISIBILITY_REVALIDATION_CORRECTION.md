# Non-disruptive visibility revalidation — 2026-10-30

The requester observed loading/update on the first click anywhere in Countries.
SessionContextEvents forwards window focus and document visibility hints. The old
AuthSession handler treated each hint as an explicit context invalidation: it set
contextChanging/pending, cleared localization, masked readIdentity, and installed
a fresh Session object even when the server returned identical data. Scoped read
owners correctly invalidated on that object replacement; the resulting reload was
unnecessary for an unchanged focus hint.

## Current correction and safety boundary

Visibility/focus hints now enter one coalesced verified-session read. During that
read, the last verified Session object remains stable; there is no UI pending,
localization disconnect, draft-consent cancellation or collection refetch. The
comparison covers the complete validated Session, normalizing role/permission
and company order without mutating either object. It includes expiration and
read-only state; no field is silently omitted.

If verification differs, is absent or fails, the existing synchronizeContext
coordinator owns synchronous masking and full authoritative recovery/clearance,
including CSRF and localization before publishing identity. External tab hints
still mask immediately. Generation/user/pending/destroy guards discard late
visibility replies after another transition. No hint installs claims or grants.
The background verification does not write business data or replay a mutation.

## Evidence

Five new auth-owner tests cover coalesced unchanged checks, stable identity,
retained dirty consent, permission loss with masking before CSRF completion,
late focus response after external scope replacement, and fail-closed recovery.
The focused auth/Grid/Select gate passed3files/41tests before the full gate.
Current full and browser results are registered in the Countries correction
evidence, whose driver exercises an actual protected collection through MainShell.
Its focus probe observes data-kind mutations, API reads and row-node lifetime,
then dispatches focus and performs first blank/row clicks. An unchanged session
must produce no loading, no data refetch and no row replacement.

Manual hosted focus/cross-tab acceptance remains part of PROD-019. No API, schema,
CSRF contract, permission grant, retained Next or native implementation changed.
This corrective change does not reopen the product scope of closed S2-A4.

## Primary references

- [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
  distinguishes window focus from a visibility transition.
- [Angular Signals](https://angular.dev/guide/signals)
  documents referential equality as the default signal comparison.

Final current verification: full Angular61files/362tests/build passed. The actual
Countries route passed8/8 EN/AR light/dark390/1440 cases, including explicit
window-focus and first blank/row clicks with zero loading, collection refetch or
row replacement. Existing company-context browser regression passed14/14 cases,
including switch outcomes, cross-tab switch/logout and single-company behavior.
Those browser routes use intercepted fixture responses and make no live-host
authentication/deployment claim. Current machine results are registered in
VISIBILITY_COMPANY_BROWSER_RESULTS.json and the Countries correction manifest.
