# Angular secure company context — implementation report

Exact S2-A4 is Phase 06 **Verified**, 2026-10-29. Authenticated Angular users with
multiple allowed companies can change their working company through the existing
secure Cookie API. A single available company remains readonly; global
super_admin has no tenant/company selector. The ordinary local demo currently has
one company; no production company was created to manufacture a test.

## Delivered behavior and ownership

BrowserAuthService calls the existing POST /api/v1/browser-auth/switch-company
once with credentials and X-ERP-XSRF, parsing the sanitized SessionContext.
AuthSession remains the single protocol coordinator. Before mutation it pauses
readIdentity, cancelling/masking catalog and dashboard reads, clears scoped text
and hides/inerts protected content with shared translated progress. The header
keeps its last verified identity. New identity is published after server session
projection, fresh CSRF and scope-safe localization replacement. The existing
finite localization outage policy permits baseline text, never old overrides.

A failed/uncertain mutation response triggers a session read (existing refresh on
401), without repeating the write. Confirmed target/same actor recovers as
success; another verified scope is accepted with a shared inline error. Failed
verification clears protected identity and translations and returns to login.
Current/unknown/nonpositive/fractional/global/duplicate requests are rejected
before network work. Pending auth operations exclude logout/another mutation.

SessionContextEvents owns a lifecycle-cleaned BroadcastChannel carrying only
`{kind:'session-changed'}` after login, logout and an attempted company mutation.
Receivers reject malformed/identity-bearing messages and verify the API. Focus
and visibility revalidation cover missed/unsupported channels; duplicate visible
notifications coalesce during pending work, and one external hint is queued.
Read-only verification never rebroadcasts. No role, company, token or session is
installed from a message or persisted in browser storage.

Existing Shared OptionSelect gains context appearance, description/icon,
disabled/busy and external commit using Reactive Forms. It remains actual PrimeNG
Select, retains preference defaults and inherited language color, and holds the
caller's verified selection while a transition is pending. Existing ContextBadge
and frame slots render the source grouped context and compact icons. PrimeNG
listbox/combobox semantics and its dropdown affordance are intentional adapter
differences from the source MUI Menu trigger; no pixel-identical selector claim
is made. FeedbackState gains a generic inline layout; Shell composes these public
controls and owns no transport or business data store.

## Verification

- Full Angular check: **22 files / 90 unit tests**, **6 architecture cases**,
  strict templates/types, tokens/fonts/catalog and production build pass. Initial
  **430.14 kB / 115.50 kB estimated transfer**; budgets unchanged, no build warnings.
- **14 production browser scenarios**: eight EN/AR/light/dark/390/1440 transitions,
  current-value hold, disabled/progress/inert old content, keyboard selection,
  localized scope replacement, reload, rejected mutation/restored scope and close
  feedback, lost response recovered as success, unverifiable outcome returning to
  login, delayed localization, two-tab switch/logout and single-company readonly.
- Unit coverage independently verifies pending identity masking, CSRF/localization
  commit order, invalid choices, uncertain recovery through refresh, no repeated
  write, changed actor, queued external hints, cross-tab login/logout and strict
  notification/cleanup/fallback behavior. Shared scoped-read tests cover old
  subscription cancellation and synchronous identity masking.
- Regressions: **20 language/color/keyboard cases**, **24 shell cases**, **14 home
  cases**, **14 module cases**, **10 synthetic login cases**; existing Next session
  switch **5 tests**, native authentication **2 files / 6 tests** pass.
- Existing disposable-SQL PlatformSessionLifecycleTests passes **11/11**,
  including switch/refresh/logout races, rejected membership and security stamps.
- Existing trusted Chromium + production controllers/JWT/SQL transport proof
  passes **1/1**, additionally driving the actual built Angular bundle through
  real password/tenant/company challenges, CSRF, Cookies, company switch, reload,
  second-tab convergence and logout/revocation. The optional Angular catalog and
  localization reads are explicitly synthetic: this proves auth/SQL transition,
  not saved translation persistence. Existing capacity-before-commit denial,
  origin/CSRF/bearer isolation and two business-write assertions remain intact.
- Local real API/demo verification at trusted **4210** passes actual role landing,
  SQL summary comparison, catalog/reload/logout and the current one-company
  readonly header. The **4220** artifact origin is used for intercepted fixture
  tests; its live API requests are correctly rejected by the current origin list.
- API Debug rebuild for the embedded catalog passes **0 errors / 79 inherited
  warnings**. This is not a full repository/API/mobile release-gate claim.

Run npm --prefix web-angular run check, verify:company-browser and the retained
browser scripts. For actual isolated Angular/SQL proof, build Angular first, set
ERPSYSTEM_TEST_BROWSER_AUTH_PREFLIGHT=1 and
ERPSYSTEM_TEST_ANGULAR_COMPANY_CONTEXT=1, then run the existing integration test
filter BrowserAuthenticationTransportTests in Release. The probe reuses the
harness Playwright instance; it does not require a second test runtime. Standard
transport proof remains independent of the optional Angular flag. Redacted
canonical receipt is in platform-browser-authentication/verification/results/
browser-transport.json; local screenshots/receipts are .codex-tmp/angular-company.
No Cookie, credential response or license value is logged.

## Localization, retained platforms and limits

One canonical bilingual platform-auth key angularAuth.updatingContext was added.
The normal catalog generator synchronizes Angular/Next/API resources: 21 sources,
7127 keys, schema 3, hash
a66a859b1e21ac87433b2e2c2ef81729ddb47fed57079d9b11278e0c3985f714.
No localization schema/endpoint or domain grant changed. Saved SQL translation
editing/optimistic conflict/reset acceptance remains FOLLOW-012. Fiscal year,
tenant switching, company management, profile/search/notifications and actual
business screens remain FOLLOW-015. Future editable routes cannot join context
switching without the shared dirty guard, FOLLOW-014. Current protected routes
are readonly; native dirty registry and existing bearer consumer remain intact.

Both retained platforms' creation/edit/view/list/mock audit is N/A for new domain
data: no entity or structured property was changed. Existing SQL schema was
verified by the isolated migrated fixture with no pending model change. Hosted
origin/provider checks remain PROD-002/017/019/RISK-018. Rollback is limited to this
Angular coordinator/control composition and optional proof; do not remove the
existing API endpoint or native/Next switch workflow.

## Research and diagnostic resolutions

HttpTestingController assertions run after the request starts; CSRF is minted
first in the transport test, then the exact mutation is flushed, following
[Angular HTTP testing](https://angular.dev/guide/http/testing). Two copies of
Playwright cannot initialize in one process, as enforced by its
[official source](https://github.com/microsoft/playwright/blob/main/packages/playwright/src/index.ts);
the optional probe receives the harness expect/browser. Forwarded auth requests
share the context Cookie jar under [Playwright APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext).
After logout, anonymous bootstrap may mint an antiforgery Cookie; proof asserts
access/refresh removal and actual session401, preserving the distinction from
authentication described by [ASP.NET Core antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0).
No runtime security requirement was weakened to make these tests pass.
