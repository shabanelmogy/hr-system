# Angular shared theme and action control

S1-A1 implementation/checks recorded 2026-10-28. Phase 06 is **Verified** after the requester configured the actual local Community key. The 40-case browser matrix passed again; manual visual inspection confirms the vendor invalid-license notice is absent. FOLLOW-013 is Verified. Source/build and visual evidence follow.
This is a technical compatibility fixture, not the login/shell or a business form.

## What exists

- Independent Angular 22 client now installs PrimeNG 22.1.4, CDK 22.2.5,
  @primeuix/themes 3.1.0 and the local compiled @app/tokens package.
- One src/theme adapter uses the existing five palettes and light/dark semantics.
  Quiet secondary/accent remain quiet; status foregrounds and brand3 are mapped
  deliberately. Primary actions retain the reviewed Next gradient/radius/label
  weight/shadow. Its MUI dark-color derivation is used only while AA text contrast
  remains valid; otherwise the original primary is retained. No new color catalog.
- Shared ActionButton is the only owner of PrimeNG button imports/templates.
  It provides translated label, native type/submit/focus, enabled default,
  busy/disabled behavior, selected aria-pressed and full-width composition.
  Busy keeps its label and blocks duplicate activation; it does not own business
  validation. Outlined/text/secondary/status use semantic theme values.
- ThemeService validates and persists existing themePalette/currentMode Cookies,
  restores them before bootstrap and leaves document language/direction to the
  localization owner. No storage of session credentials or new query/store engine.
- Self-hosted IBM Plex Sans Arabic fonts and OFL license are synchronized from
  the existing source; a byte check rejects drift. They ship inside Angular public
  assets with no external font request. Token synchronization now covers Angular
  as well as retained Next/native, with current package-content checks.
- The development-only /dev/theme route composes shared controls in two distinct
  layouts. Production replaces the route file; the resulting build contains no
  theme-preview chunk. It has no API call, fake auth, business data or navigation.
- AST-based boundary checks reject aliased/dynamic/re-exported raw PrimeNG imports
  and inline template bypasses outside shared ownership; only the theme owner can
  configure PrimeNG. Four checker regressions cover allowed/denied paths.
- Angular CI checks tokens, installs the locked dependencies and runs the complete
  Angular check. A configured CI key is read from PRIMEUI_LICENSE_KEY; no key is
  written into tracked files. The workflow is authored; no hosted run is claimed.

## Verification results

| Check | Result |
| --- | --- |
| npm --prefix web-angular run check | Passed: token/font/catalog/current-source checks, AST guards, strict types/templates, unit tests, production build |
| Angular behavioral tests | 5 files / 30 passed: retained localization 14, theme 12, action 4 |
| Architecture guard tests | 4 passed, including aliased/dynamic imports and shared-only control templates |
| Chromium theme/action matrix | 40 combinations passed: 5 palettes x light/dark x EN/AR x 390/1440 width |
| Browser interaction | Actual computed colors/gradient/status text, font availability, 44px target, no horizontal overflow, native Tab focus and Enter/Space; palette/mode/language survive reload |
| Current production initial bundle | 415.52 kB raw / 108.58 kB estimated transfer; unchanged 500 kB warning budget passes |
| Canonical token package | Contrast for 10 themes, types and committed dist check passed; synced to all 3 clients |
| Retained Next regressions | 2 files / 8 passed: runtime-preferences and ThemePaletteSelector |
| API/native business source | No changes in this unit; no EF migration or full API/native suite rerun |

Browser command: npm --prefix web-angular run verify:theme-browser while the
Angular development server is running at https://localhost:4210. A separate
Chromium process/profile is used; no existing user browser session is controlled.
Local screenshots/results are under .codex-tmp/angular-theme. The canonical
verification summary is verification/browser-summary.json; it contains no key.

## Corrections and deliberate differences

The initial asset setup attempted to reference sibling font assets directly;
Angular rejected assets outside its workspace. Following the documented workspace
asset contract, the client now has synchronized local copies plus a drift check:
[Angular workspace assets](https://angular.dev/reference/configs/workspace-config#assets-configuration).
Strict template checking also rejected repeated getter-based union narrowing;
a typed computed value now maps the shared variant to PrimeNG without casts or
weakened checks: [computed signals](https://angular.dev/guide/signals#computed-signals),
[strict templates](https://angular.dev/tools/cli/template-typecheck).

Importing the entire Aura preset caused a 567.71 kB initial-bundle warning.
The adapter now imports only the adopted button preset and explicitly maps its
semantic values, as supported by the current package's documented subpath API:
[@primeuix/themes](https://www.npmjs.com/package/@primeuix/themes?activeTab=readme),
[PrimeNG theming](https://primeng.dev/theming). Future controls must add their
reviewed preset/compatibility evidence at their shared owner. The budget was not raised.

The button matches current primary gradient, font and radius semantics; native
PrimeNG rendering/44px standard geometry replaces MUI-specific implementation.
Secondary/status buttons use their true semantic colors rather than the old
MyButton's unconditional primary-gradient override. These are explicit generic
adapter choices, not a claim that every future screen has visual parity.

During execution the existing API web catalog changed under retained auth text
work. Canonical generation check passed with 21 sources / 7107 keys; Angular was
re-exported to the validated current fingerprint
4055f47ad8997a5f241ef23ed2423af54892acf905b252cbcafe5a1087f77e22.
No namespace/key or schema fork was introduced. RISK-016 remains the drift owner.

Token tooling initially lacked local TypeScript; after installing its declared
dependency, the dist comparison required regeneration. Build/check then passed;
Git reports no substantive token source/dist diff. No design value was changed.
Existing token advisories for low-contrast hairline input borders remain reported,
not suppressed; the existing text/status/focus gates pass.

## Local license setup and acceptance boundary

Requester confirms owning a Community key; its supplied entitlement screenshot
shows four seats and expiry 2027-10-28. The requester subsequently populated the
ignored web-angular/.env.local configuration. configure:license loaded it without
printing the value, and regenerated the ignored src/config/license.generated.ts.
The browser matrix passed again (40 combinations, keyboard and preference reload).
Manual visual inspection of a fresh Chromium page after license verification
confirms the earlier Invalid PrimeUI License notice is absent. No notice was hidden
or bypassed. FOLLOW-013 is Verified; this is actual local runtime acceptance.

The licensed production build passes at 415.52 kB initial / 108.58 kB estimated
transfer. Local key and generated input remain ignored by Git and absent from
required-files manifests. Production build output is also ignored; deployment/CI
must configure its own authorized environment input. No account registration,
purchase or key fabrication occurred. On key replacement, run configure:license
and repeat licensed browser verification; never publish the key itself in logs.

Angular workspace analytics is explicitly false in angular.json after the requester
encountered the optional CLI prompt. `ng analytics info` reports Local disabled and
Effective disabled; no global user setting was changed. Official reference:
[Angular analytics](https://angular.dev/cli/analytics).
The current [PrimeNG configuration](https://primeng.dev/configuration) accepts a
Community or Commercial key. [Community terms](https://primeui.dev/licenses/community)
own eligibility/renewal; the requester remains the license owner. This unit does
not infer eligibility or redistribute a reusable component library externally.

Later forms/select/date/dialog contracts retain their own internal locale,
overlay/focus/CVA/validation compatibility requirements under SIG-07/08. Actual
signed-in SQL translation acceptance remains FOLLOW-012; hosting/origins remain
PROD-017/019. No customer creation/edit/view/list/mock workflow is added on either
platform in this technical unit. Rollback changes the new client/config/CI/sync
integration only, with no database operation. No full S1 completion claim.
