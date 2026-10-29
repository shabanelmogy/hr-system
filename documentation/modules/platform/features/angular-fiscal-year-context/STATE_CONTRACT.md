# Working-year transition — frozen bounded state contract

1. AuthSession.runScopedContextUpdate owns a single pending/contextChanging
   barrier. It accepts a finite async operation returning whether the requested
   domain outcome is confirmed; the caller cannot supply Session/roles/grants.
   Reject pending/restoring/anonymous/global before invoking the callback.
2. Pause readIdentity, clear old localization and retain verified header first.
   Accounting sends one PUT and, only after a failed/invalid response, GETs current
   context. A parsed confirmed old choice returns false; unavailable verification
   throws. No automatic PUT retry. Platform then independently verifies session,
   renews CSRF/localization and resumes identity. Success requires same actor,
   tenant and company; changed server truth is accepted without claiming success.
   Callback/session verification failure clears protected identity and returns
   login. Finally release pending, publish invalidation-only hint and drain one
   queued external hint. Disposal/generation prevents late identity publication.
3. Accounting state wraps createScopedRead using trusted readIdentity and exact
   FiscalYears:View plus normal tenant role. Header snapshot survives a pause only
   for the same scope, and commits confirmed context after the coordinator returns.
   New authenticated scope masks/discards old header and response synchronously.
   Always refetch after resume, including same-company working-year change.
4. Root lazy authenticated composition provides Accounting control and a generic
   feedback signal to Shell tokens. Accounting DTO/permission/HTTP remain inside
   modules/accounting. Shell renders only generic outlet and Shared feedback.
   Existing Shared selector gains only generic empty-label/invalid presentation.
5. No future year-dependent business editor/read is declared verified by this
   header work. Such consumers must use the trusted barrier and FOLLOW-014 dirty
   approval first. Current routes are readonly. Test callback/barrier ordering,
   uncertain/denied/unavailable, changed actor/company, duplicates, tab/focus,
   disposal and existing company/logout exclusion.

G0–G3 are fixed for exact S2-A5: current API/SQL roundtrip with original preference
restored, API17/Next7/native10, complete R/D/E and reviewed source. Current269
generated recipes and planning pass. Remaining G4 is hosted/provider release-only
PROD-002/017/019/RISK-018. The exact contract may now authorize bounded runtime;
overall plan remains Draft and Phase06 still requires actual Angular acceptance.

Execution update: this exact bounded entry was authorized before code. Actual
Angular acceptance now passes and Phase06 is Verified; see IMPLEMENTATION_REPORT.md.
