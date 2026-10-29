# Company context — bounded execution readiness

The existing server endpoint is verified, not proposed. The current session SQL
suite passes **11/11**, including active-source replacement, company denial,
expired/security-stamp rejection and refresh/logout/switch concurrency without
reviving another session. The existing real Chromium/SQL transport proof already
exercises `/browser-auth/switch-company`, Cookie-only session projection, retained
bearer isolation and precommit capacity denial; its current rerun is recorded in
the feature evidence before runtime authorization.

The exact client contract is fixed as follows:

1. Keep AuthSession as the single existing signal-based protocol coordinator. This
   is an extension of its session/pending/generation owner, not a new aggregate
   store. Shared `createScopedRead` receives a separate readonly `readIdentity`
   that becomes null during context verification, cancelling old reads and
   masking their results before the server mutation. Header identity stays at its
   last verified value; protected content becomes inert/hidden with a finite
   shared progress state. New identity is published only after API projection,
   CSRF renewal and scope-safe localization replacement. A localization outage
   retains only baseline text, never another company's overrides, under the
   existing finite localization policy.
2. Extend the existing PrimeNG OptionSelect generically with context appearance,
   description/icon, disabled/busy and externally committed selection. Reactive
   Forms keeps the displayed selection at the caller's verified value until the
   caller commits it. Do not let PrimeNG's immediate UI selection imply that an
   async company switch succeeded. Preference appearance/default behavior stays
   compatible and receives its existing language/color regression matrix.
3. Current/unknown/nonpositive/global/duplicate choices do no network work. An
   attempted mutation is never automatically repeated. If its response fails,
   re-read the authoritative session (and existing refresh path when appropriate)
   before re-enabling protected work. If the server confirms the selected target,
   recover as success. If it confirms another scope, accept that truth and show a
   translated failure. If verification fails, clear protected identity/text and
   return to login. An inline shared feedback variant displays a recoverable
   company error without replacing valid restored content.
4. A root-owned BroadcastChannel carries only `{kind:'session-changed'}` as an
   invalidation hint after authenticated login, logout and company mutation.
   Receivers validate the message and verify the API; they never install a company,
   role, permission or token from it. Visible/focus revalidation covers missed or
   unsupported channels. Coalesce duplicate visibility notifications; queue one
   external invalidation received during an active auth operation. Read-only
   synchronization does not rebroadcast. Lifecycle cleanup closes the channel and
   removes listeners. No browser storage, second session store or secret payload.
5. Current protected routes are read-only home/catalog/dashboard, so there is no
   current business draft to discard. This does not waive P-008: FOLLOW-014 remains
   a hard gate before an editable business route can participate without shared
   unsaved-change approval. Native current dirty guard is retained. Fiscal-year,
   company CRUD and tenant switching are not placeholders in this implementation.

One bilingual `angularAuth.updatingContext` message is added to the canonical
platform-auth scope; existing `auth.companySwitchFailed` covers recoverable
failure. The existing catalog generator/embedded API resource must be synchronized.
No API route, issuer, database schema or grant change is required.

Acceptance includes public control deferred-commit/disabled semantics; coordinator
duplicate/uncertain/recovery/logout/refresh/generation tests; two real browser tabs
sharing Cookies with synthetic contract responses; translation/catalog isolation
and old-response rejection; and the real isolated two-company Cookie/JWT/SQL
transport proof. The ordinary local demo user's real company availability is
checked separately; no production business company is created to manufacture a
test. Existing Next/native consumers receive focused regressions.

G0–G3 are fixed for this bounded client slice. Remaining G4 is hosted/provider-only
PROD-002/017/019/RISK-018; other feature work stays FOLLOW-012/014/015. Runtime entry
still requires current canonical books/manifest, generated packets and planning
checks to pass, followed by explicit exact-slice recording in the contract.

Live client recipe: the existing isolated transport harness may optionally drive the actual built Angular bundle in a separate browser context, forwarding auth traffic to its real test API. Only catalog/localization reads are explicitly synthetic in that optional client run; the password/challenges/CSRF/Cookies/switch/session/logout and SQL sessions remain real. The optional UI context logs out before the existing intentional logout-failure case, preserving the fixture cleanup assertion. Do not label its synthetic read text as a persisted SQL translation.
