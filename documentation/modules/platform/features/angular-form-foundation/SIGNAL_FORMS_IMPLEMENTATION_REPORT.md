# Signal Forms and Angular foundation maintenance — 2026-11-04

## Scope and authority

Requester-approved maintenance under migration D07/D35: Option B, a lightweight
shared-controls architecture over Angular 22 Signal Forms. Branch:
`codex/angular-foundation-hardening`. No full engine, JSON renderer or dependency
installation. Existing Angular foundation, auth, Countries and report consumers
are the runtime scope. API/Next/Mobile source and domain/persistence contracts
are unchanged; database migrations and cross-platform domain UI audit are N/A.

## Applied changes

- Added static resolved dependency/public-API checks, eager value cycle detection,
  alias coverage and external-template form policy. Split auth route/layout public
  entries to remove an eager barrel cycle.
- Exposed verified auth/session transition signals as readonly and retained explicit
  owner commands. Tests obtain verified sessions through the owner's transport path.
- Inverted shared localization through UI_LOCALIZATION with the existing Platform
  runtime registered using useExisting; no second translation state or catalog.
- Converted login/password request, Country editor/detail and report criteria to
  typed native Signal Forms. Features retain schemas, DTO conversion, permission,
  context/revision fences, unsaved changes and uncertain-write recovery.
- FormContainer awaits configured native actions and owns validation display/focus.
  Native field bindings retain metadata, touch/focus/reset; CVA remains for technical
  compatibility. Nested controls and root errors participate in shared summaries.
- Added native schema helpers for exact numeric/date-only values and native
  server-field error mapping with stale edited-field/array-order protection.
- Report submission waits for its own RenderSpec, not a replayed earlier result.
  Context/language changes cancel acceptance without starting a second request.
- General command/network feedback permits unchanged retry. Only real validation
  errors enter the native tree; uncertain Country writes still cannot replay.
- Numeric/date/boolean dev previews now exercise native Signal Forms in Chromium.

## Verification

Executed checks:

- `npm run check`: successful complete config/tokens/fonts/catalog/architecture,
  types, unit and production-build pipeline (77 files / 434 tests at that point).
- Final complete unit rerun after native/reference/password/country regressions:
  **78 files / 438 tests passed**.
- After the final native-summary ordering/focus refinement: **18 files / 98 tests
  passed**, covering all Shared forms plus Country/report/password compositions.
- Architecture: 16 tests plus complete static source scan passed; API configuration:
  four tests passed. Strict app/spec TypeScript checks passed.
- Production build passed after the final Shared summary change, with the unchanged
  startup-size warning detailed below. No budget threshold was raised.
- Central planning check passed with two inherited migration warnings for
  education-module and erp-platform-template feature contracts. Documentation check
  passed for 437 recipes; final regeneration/check is recorded with the evidence.

Historical S1/S2/S3 acceptance in other reports keeps its original dated scope.
Machine-readable cases are in `verification/signal-forms-summary.json`.

Current browser evidence (mocked/local harnesses; no real business writes):

- Native numeric: eight EN/AR, light/dark, 390/1440px cases; exact precision,
  validation, IME, keyboard, dynamic limits, locks and reset.
- Native date: eight corresponding cases plus ten timezone/language cases covering
  UTC, Cairo, Los Angeles, Kiritimati and Adak.
- Native boolean: eight corresponding cases covering literal values, keyboard,
  consent, readonly/disabled, control-kind swap and reset.
- Login: ten mocked scenarios passed; live API and Next comparison were not run.
- Managed reporting/PDF: eight focused lifecycle cases passed, including client and
  backend validation, context changes and stale-document removal.
- Countries action matrix: all eight EN/AR, light/dark, mobile/desktop cases passed
  on the fixed-source repeat: create/edit, field errors and focus, unchanged retry,
  unsaved close, Cards/Grid continuity, archive/restore/bulk and uncertain-write lock.
  Browser locators were migrated from legacy control names to accessible labels;
  failure capture now records a screenshot and dialog/page state. Earlier runs
  were interrupted during dev-server rebuild/error-overlay activity; they are
  not counted as passing cases.

PrimeNG MCP was consulted before shared-control changes. Final DatePicker usage
validation returned valid with no metadata issues. It does not replace behavioral
checks. Official Angular submission/custom-control documentation and installed
22.2.3 declarations/runtime were inspected for native lifecycle behavior.

## Performance and limits

Production build passes with a 608.36 kB initial-size warning against the existing
500 kB warning budget (approximately 156.7 kB estimated transfer). Build statistics
show that root registration of the existing LocalizationRuntime eagerly brings
i18next, bootstrap translations and override validation/policy into startup. Native
form code remains in lazy feature chunks. Budget values were not changed.
RISK-019 owns startup-loading/performance review before foundation release/full
Countries parity acceptance. No production speed or hosted integration claim is made.

Existing FOLLOW-012/014, RISK-016/017 and PROD-017/019 retain their actual remaining
SQL-settings, structured-business-form, parity/specialist and hosted-release scope.
Technical nested/array tests do not claim an implemented business repeater/editor.

## Reproduction and rollback

From `web-angular`, run `npm run check`, native focused specs, then existing
`verify:date-browser`, `verify:numeric-browser`, `verify:boolean-browser`,
`verify:login-browser` and `scripts/verify-country-actions-browser.mjs` against a
local dev server. Set ANGULAR_PREVIEW_ORIGIN and ANGULAR_API_ORIGIN to the local
preview and the configured API origin so fixture interception matches. Browser
checks here use fixture transport, not live writes.

Central documentation is regenerated from canonical books/manifests and checked
with Check-Planning.ps1 and Generate-Documentation.ps1 -Check. Rollback is a scoped
client/documentation diff; no database rollback or deployment is involved.

Subsequent same-day D36 structure/performance maintenance changes the localization/startup source snapshot. The verification above remains historical for D07/D35. Current startup measurements and scoped verification are in ../angular-localization-foundation/STRUCTURE_PERFORMANCE_REPORT.md; RISK-019 remains open.
