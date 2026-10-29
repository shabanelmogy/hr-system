# Angular Accounting working fiscal-year context — implementation report

Exact S2-A5 is Phase 06 **Verified**, 2026-10-29. The authenticated header now shows
and changes the permitted user's personal working fiscal year through the
existing Accounting API. The selected year survives reload and converges in
other tabs. Company Current, fiscal-year CRUD/lifecycle and periods are outside
this header slice.

## Result and ownership

Accounting owns typed FiscalContext, strict response validation, service, scoped
state and public context control under modules/accounting/fiscal-year-context.
Only the authenticated app composition imports that public contract. It supplies
the component and a generic feedback signal to Shell InjectionTokens; Shell
renders NgComponentOutlet and shared feedback without Accounting DTO/business
imports. An architecture regression rejects direct Shell/business-module imports.
The composition remains lazy; no Accounting domain store is installed globally.

FiscalYears:View plus normal trusted tenant scope gates the control and query.
Missing permission/global role means no context request. Available years are
the server's nonarchived list across lifecycle statuses; Draft is a valid personal
choice. Company Current remains the default. Choosing it clears the personal
override; the client does not invent a reset menu action from nullable API input.
Existing AllowTenantReadOnly policy permits personal selection while company
SetCurrent/lifecycle writes keep their separate permissions and restrictions.

Platform AuthSession.runScopedContextUpdate serializes the module operation with
company/logout, pauses readIdentity/protected content and retains verified
header identity. Accounting sends one PUT. On lost/invalid reply it reads actual
context without repeating the write. Platform independently rereads actual
session, renews CSRF/localization and accepts only API identity. Success also
requires unchanged actor/tenant/company. Confirmed prior year gets a shared
translated error; unverified outcome clears protected scope and returns to login.
The existing invalidation-only notification refreshes the other tabs; no year,
role, token or grant is trusted from a message or browser storage.

Existing OptionSelect context/external commit is reused, with only generic
emptyLabel/invalid inputs added. Existing ContextBadge, action and inline
FeedbackState are composed. Header state retains old selection until a verified
commit, rejects stale scope synchronously and refetches on resume. Strict DTO
validation checks actual DateOnly dates/order, enum range, unique IDs,
selected/current membership and override consistency. Public
BrowserMutationSecurity exposes only the auth owner's CSRF operation to modules,
without exposing its login/challenge/logout transport.

The owning accounting namespace loads independently, using existing bilingual
fiscalYears.context labels, Current annotation, DateOnly intervals and SQL-backed
company override runtime. No new catalog key/hash/schema is needed. Warning
calendar treatment, grouped values, compact icons, logical RTL and actual
PrimeNG combobox/listbox behavior are preserved. PrimeNG trigger/dropdown and
inline feedback are intentional adapter differences from source MUI Menu/toast;
no pixel-identical control claim is made.

## Verification

- Full Angular check: **24 files / 99 unit tests**, **7 architecture cases**,
  strict templates/types, tokens/fonts/catalog and production build pass.
  **432.52 kB initial / 115.87 kB estimated transfer**; unchanged budgets and no
  build warning. Source-module composition is lazy.
- **15 production browser scenarios** cover eight EN/AR/light/dark/390/1440
  selections, externally committed old value, pending hidden protected content,
  restored selection on reload, lost response recovery, rejection with closeable
  feedback, unverified outcome/login, empty context, malformed read/retry, missing
  permission with zero reads and two-tab convergence.
- Actual Angular **4210 + existing API + SQL** uses two already existing years:
  selects through the actual PrimeNG control, verifies persisted context,
  second-tab update and reload. It restores the original effective selection and
  override afterward and logs out204. No year was created and company Current was
  unchanged. The earlier API-only probe separately proves unknown selection400
  preserves context. These receipts are separate from fixture results.
- Unit tests cover schema consistency/invalid dates/status, scope masking,
  current/unlisted candidates, authoritative recovery, unchanged old year versus
  unverifiable scope, generic pending/company/logout exclusion and changed actor/
  company. Existing scoped-read tests retain cancellation/destruction coverage.
- Regressions pass: **14 company**, **20 language/color/keyboard**, **24 shell**,
  **14 home** and **10 synthetic login** browser scenarios. Existing API controller/
  company-isolation **17**, Next service/query **2 files / 7**, native use-case/
  remote-boundary **2 files / 10** pass. S2-A4's real Chromium/Cookie/JWT/SQL company
  proof remains separately recorded; no full repository/release pass is claimed.

Use npm --prefix web-angular run check, verify:fiscal-browser and
verify:fiscal-live. Production fixture origin is4220; real local API tests use
trusted4210. The live script requires existing eligible years and restores the
original preference in cleanup; it does not create production fixture entities.
Canonical redacted receipts are verification/api-preflight.json and
verification/live-ui-results.json. Local screenshots/results are
.codex-tmp/angular-fiscal-context. Existing Node fixture-loader module-type
advisories are script warnings, not Angular production build warnings.

## Limits and handoff

No domain entity/structured property/API/schema/permission changed. The existing
SQL context tables and persistence were verified through real API read/write/
restore. Creation/edit/view/list/mock audit for new domain data is N/A on both
retained platforms; native modal/dirty registry remains intact. Future editable
year-dependent routes must satisfy FOLLOW-014's shared dirty approval first.
FOLLOW-012 retains actual translation editor save/reset/conflict acceptance;
FOLLOW-015 retains module context navigation and other workspace/business screens.
Hosted/provider G4 remains PROD-002/017/019/RISK-018. Rollback only this Angular
adaptation/public slot and generic barrier additions, never the existing
Accounting preference API or source workflows.

Composition follows [Angular NgComponentOutlet](https://angular.dev/api/common/NgComponentOutlet)
and [dependency providers](https://angular.dev/guide/di/defining-dependency-providers).
The real existing API, current source and independent browser proofs establish
business meaning; a DTO or generated phase packet alone does not establish UI
acceptance. Customer education is authored after this Phase06 verification.
