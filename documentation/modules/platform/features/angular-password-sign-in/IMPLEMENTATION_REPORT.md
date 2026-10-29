# Angular password sign-in — implementation and acceptance

Date: 2026-10-28. Exact authorized slice: **S2-A0 — Password sign-in and session entry**.
Phase 06: **Verified** for the bounded runtime. Documentation/handoff is Closed; requester continued to separately contracted S2-A1. Full migration is not declared complete.

## Delivered behavior and ownership

The default URL and unknown routes open the actual `/login`, in development and
the production artifact. The previous empty router outlet/default placeholder is
removed. Password and demo actions use the existing Cookie API. Tenant/company
selection, cancellation/expiry, verified session restore/refresh, identity entry
and logout are implemented. `/forgetPassword` calls the existing public request
contract; automated acceptance intercepts it and sends no real email.

The source of design truth is current `web-next` Login, LeftPanel, LoginForm,
AuthLayout/AuthTopBar and selection dialogs. The Angular shell retains the header,
40/60 branding/form card, fonts, colors, floating labels, counter, password reveal,
demo badges and social row. Responsive and RTL behavior follow the current source.
The Next-only developer monitor/Next development badge are development tools and
are not product controls to port. Google retains its source visual row but shows
localized unavailability feedback because the existing API provider is disabled
(RISK-018/PROD-002). It does not fabricate an external login or expose bearer tokens.

Runtime ownership is `platform/auth/{types,services,state,validation,pages}`;
`shell/auth-layout` owns public branding/header composition. Shared UI owns form,
floating text field, icon/action/description, preference select and modal behavior.
Features consume Shared's public API. The generic choice dialog includes icon,
title/subtitle, selectable scope rows, localized close and explicit actions;
PrimeNG owns the modal/focus trap. Theme semantic mask uses shared overlay tokens.

## Security, lifecycle and translation

BrowserAuthService is the only authentication HTTP owner. It validates unknown
responses, accepts only the sanitized session, uses the exact configured HTTPS
origin, credentials and in-memory CSRF request token. A bearer response is rejected.
Tokens, credentials and challenge state are not persisted in browser storage/URLs.
CSRF is renewed after identity changes. AuthSession serializes local operations,
deduplicates restore and fences async identity acceptance by generation. HTTP and
localization startup have finite timeouts. This bounded owner does not claim the
whole future context/shell or cross-tab operation coordination stage.

Localization clears the previous scope before accepting an identity, then connects
the actual user/tenant/company/roles/permissions to the existing SQL runtime. It
reads the company or authorized system endpoint as appropriate. The canonical web
catalog remains schema 3: **21 sources / 7118 keys**, fingerprint
`2b00c453af5b0e715bb930b7c67396734ccda3b855d0d50a3aee25f4c6ce085c`.
Eleven necessary bilingual auth feedback keys were added through the existing
Next/API/Angular export pipeline. No catalog identity fork or missing-key write.
FOLLOW-012 remains open for the later Settings save/reload/revision/reset journey;
login's verified live runtime wiring does not claim that editor is implemented.

Only ignored API development configuration adds exact `https://localhost:4210`
to BrowserAuthentication and CORS allowed origins, preserving existing origins.
No authentication API runtime source, entity, permission or schema changes in this
client increment. API rebuilt to embed the current generated catalog. Existing live
Identity/SQL/session storage is exercised; no new EF migration is required.

## Verification receipts

| Gate | Result / boundary |
| --- | --- |
| Angular full `npm run check` | 11 files / 55 unit tests; 6 architecture tests; strict types/templates, tokens/fonts/catalog and production build pass |
| Production initial bundle | 417.81 kB raw / approximately 110.4 kB estimated transfer; no budget increase or warning |
| Shared form browser regression | 40 palette/mode/language/viewport combinations pass validation, focus, clear/reveal/reset, async/server errors and duplicate submit |
| Login visual comparison | 8 equal-viewport pairs: EN/AR × light/dark × 390/1440 widths, height 1000; card and submit x/y/width/height within 1 CSS pixel of actual running Next |
| Login fixture workflows | Both languages: default/unknown/protected entry, field errors/focus, invalid/outage/malformed API, tenant then company, Escape/cancel, reload/logout, scoped text removed on logout, CSRF and no storage, intercepted password request |
| Actual browser/API/SQL | Demo superadmin login, system localization runtime 200, refresh-page session restore and logout pass; access/refresh Cookies Secure + HttpOnly, absent from document.cookie and removed on logout |
| Production artifact | Same login fixture journeys against HTTPS static artifact on 4220; root/login/unknown/protected routes verified independently of ng serve |
| Retained Next | Login validation/result: 2 files / 9 tests pass |
| Retained Mobile | Existing auth application boundary: 1 suite / 2 tests pass; native UI/source unchanged |
| API compile | Debug host build succeeds, zero errors; 326 inherited analyzer warnings retained. No new full-API test claim; prior R2 full gate remains its own evidence |
| Canonical catalog | `node scripts/export-company-ui-catalog.mjs --check` passes 21 sources / 7118 keys |

Reproduce with `npm --prefix web-angular run check`, `verify:form-browser`, and
`verify:login-browser`. The latter uses mocked APIs by default; `--compare-next`
requires the actual Next preview and `--live` explicitly exercises the real API
with the existing public demo action. No password-reset email is sent by the script.
`ANGULAR_PREVIEW_ORIGIN` can point at the production artifact for the same journeys.
Local screenshots, redacted status receipts and logs are under
`.codex-tmp/login-parity/`; no response body, Cookie value, license or secret is logged.

## Findings resolved and research

The first reload acceptance exposed untranslated session-page captions: that lazy
route depended on login loading its namespace first. Session entry now loads its
own namespaces independently; a focused unit and the reload/browser journey pass.
This follows [Angular route loading](https://angular.dev/best-practices/performance/lazy-loaded-routes)
and [i18next resource loading](https://www.i18next.com/how-to/add-or-load-translations).
Dialog header/footer composition and keyboard semantics follow
[PrimeNG Dialog](https://primeng.dev/dialog), with the installed 22.1.4 API used to
verify `closeAriaLabel` and header template context. The adopted partial theme now
defines mask semantics from the shared overlay token; modal acceptance checks that
the backdrop is visible. These are resolved feature findings, not deferred polish.

The visual harness initially selected a Next autocomplete attribute that the source
does not render; it now waits for the actual password input. Repeated anonymous
live visual probes also reached the existing API rate limit. Deterministic visual
comparisons now intercept authentication; the explicitly separate live scenario
checks actual Identity/SQL once. No rate limit, timeout, authentication rule or
assertion tolerance was increased to hide a product failure.

## Scope and handoff

This is login/session entry, not the migrated ERP dashboard/menu or all S2. No
fake module navigation is shown after sign-in. Google/provider/hosted acceptance
remains RISK-018 and PROD-002/017/019. FOLLOW-014 retains remaining shared controls,
repeaters/dirty/business editor acceptance; only the preference select and choice
dialog actually adopted here are verified. No new domain structures are introduced,
so the create/edit/view/list/mock domain audit is N/A on both retained platforms.
All inherited/environment/release limits above remain separate from feature passes.
Rollback changes only this Angular client, generated catalog messages and the exact
ignored local origin entry; no data rollback or production operation is involved.

## Requester follow-up: shared validation badges

The requester explicitly requested attractive error badges and a shared component.
ValidationSummary is a separate public Shared component, composed automatically by
FormContainer. It takes readonly typed issues and emits a selected target ID; the
form retains validation/focus ownership. Count, field badges, inline errors, empty
state, escaped text, keyboard focus, RTL/wrapping and both modes are verified.
Floating invalid fields retain their error border/label even while focused.
Existing core summary keys are included by the canonical Angular bootstrap exporter
so a standalone consumer does not render untranslated keys before lazy resources.
No new visible translation key or API/catalog identity change was needed for this
follow-up. Main login geometry remains equal to the source; the badge summary is
the requester's explicit visual enhancement to the invalid state.

A strict-template failure exposed nullable field messages at the new component
boundary; explicit control-flow narrowing follows
[TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing),
without a type assertion or empty fake error. A new Arabic test also exposed leaked
language-cookie state between tests. The new suites restore preferences and the
HTTP-contract suite explicitly owns its English fixture, following
[Vitest setup/teardown](https://vitest.dev/guide/learn/setup-teardown). These were
corrected in tests rather than changing production language precedence.
