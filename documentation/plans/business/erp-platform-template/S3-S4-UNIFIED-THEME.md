# S3 + S4 — Unified theme change set

| Field | Value |
| --- | --- |
| Plan | `erp-platform-template`, slices S3 (web) and S4 (mobile) |
| Prepared | 2026-10-01, in the cloud workspace while the repository computer was offline |
| Status | Applied and verified in the repository 2026-10-06 (see "Applied 2026-10-06") |
| Decisions | D-004, D-009, D-010; proposes resolving DEC-014 |

## What changes

| File | Change |
| --- | --- |
| `packages/tokens/src/native.ts` (new) | `createMobileColors()` returns the mobile `AppColors` shape and keys from tokens; `withAlpha()` helper. |
| `packages/tokens/src/index.ts` | Exports `native.ts`. |
| `packages/tokens/tsconfig.build.json` (new), `package.json` | Builds `dist/lib/*.js` + `.d.ts` (TS `rewriteRelativeImportExtensions`); `exports` point to `dist/lib`; version 0.2.0. |
| `packages/tokens/scripts/check-dist.mjs` (new) | Fails when committed `dist/lib` differs from a fresh build. |
| `packages/tokens/dist/lib/*` (new) | Committed build output. |
| `packages/tokens/README.md` | Install guidance (copy install, no transpile flags). |
| `.github/workflows/tokens-ci.yml` (new) | Contrast, type check, dist and CSS freshness. |
| `web-next/src/theme/theme.ts` | `getDesignTokens(mode, direction, palette = 'green')` built from `createMuiThemeOptions`; keeps scroll-lock component defaults; same call signature. |
| `web-next/src/theme/legacyPalette.ts` (new) | `myColor` and `purple.*` with their old values, marked deprecated, until S3.2 replaces consumers. |
| `web-next/src/theme/tokens-augmentation.d.ts` (new) | Types `theme.palette.app`. |
| `mobile-react/src/core/theme/theme.ts` | Same exports and shapes; values now come from tokens. |

`useThemeSettings.ts` and `ThemeProvider.tsx` need no change.

## Verified before handoff (cloud workspace)

- Mobile: new `themeCatalog` equals the old one for all 8 themes, every color and every
  spacing/radius/typography/layout value, except orange light `warning` (`#C2410C` →
  `#B45309`, intended, C-004 in `EVIDENCE.md`).
- Web: `createTheme(getDesignTokens(...))` type-checks against `@mui/material` 9 with the
  legacy keys and `palette.app`.
- Package: consumed by name from a project without `allowImportingTsExtensions` and with
  `skipLibCheck: false` — no errors; contrast check passes; `check-dist` passes and detects a
  stale build.

## Visible changes on web (review with screenshots)

| Area | Before | After |
| --- | --- | --- |
| `palette.success` | Indigo (light) / light blue (dark) | Green from tokens — the fix for W-1 |
| Primary and secondary | MUI defaults | Token palette (green default) |
| Button text | Uppercase (MUI default) | As written (`textTransform: none`) |
| Corner radius | 4px | 8px |
| Font family | Current app font | `IBM Plex Sans Arabic` stack — load it with `next/font` or the stack falls back to Segoe UI / Tahoma |
| Headings h1–h6, body, caption | MUI scale | Token text scale |
| Breakpoints | MUI defaults | Unchanged (D-009) |

Mobile renders exactly as today except the orange-palette warning color.

## Apply on the repository computer

```bash
# 1. copy the files listed above into the repository (same relative paths)

# 2. tokens package
cd packages/tokens && npm install && npm run build && npm run check && cd ../..

# 3. web
cd web-next
grep -qx "install-links=true" .npmrc 2>/dev/null || echo "install-links=true" >> .npmrc
npm install ../packages/tokens
npm run type-check && npm run lint && npm run check:architecture && npm run test && npm run build
cd ..

# 4. mobile
cd mobile-react
grep -qx "install-links=true" .npmrc 2>/dev/null || echo "install-links=true" >> .npmrc
npm install ../packages/tokens
npm run check && npm run check:dependencies && npm run check:export
cd ..

# 5. documentation
./documentation/plans/Check-Planning.ps1
./documentation/system/Generate-Documentation.ps1 -Check
```

Things to confirm while applying:

1. An existing module augmentation declares `myColor` / `purple`; keep it until S3.2.
2. `check:architecture` (web) and `check:dependencies` (mobile) accept the new
   `@app/tokens` dependency; if a guard lists allowed packages, add it there.
3. No mobile code enumerates `spacing` or `radius` keys (`Object.keys`); tokens add `none`,
   `xxs`, `section` to spacing and `none`, `lg`, `xl` to radius.
4. Screenshot the reference screens (Countries P-001, Cost Centers P-002, Add Tenant P-003,
   Role Permissions P-006) light/dark, LTR/RTL, before and after.

## Applied 2026-10-06

Applied on the repository computer; checks run on a copy of the same commit.

| Check | Result |
| --- | --- |
| tokens `build` + `check` | Pass (contrast, type check, `dist is current`) |
| web `type-check`, `lint`, `check:architecture`, `check:i18n`, `build` | Pass |
| web `test` | 1 failure, pre-existing and unrelated: `reporting/moduleDefinition.test.tsx` |
| mobile `typecheck`, `lint`, `check:dependencies`, `check:export`, tests (165 suites) | Pass |
| mobile `check:architecture` | Pre-existing failure: two `fiscal-years/domain` tests import `@jest/globals` |
| `Check-Planning.ps1`, `Generate-Documentation.ps1 -Check` | Pass |

Differences from the prepared change set:

1. The three S0.5 API files in the same archive were **not** applied. `TenantReadOnlyMiddleware`
   would read `ErpSystem.CorrelationId` while the host and HR still write
   `HrManagementSystem.CorrelationId`, and the JWT literal rename breaks
   `PlatformAuthenticationTokenWireCompatibilityTests` and stops production from rejecting the
   old placeholder key. S0.5 must rename every writer, reader and test together.
2. `mobile-react` Jest: `transformIgnorePatterns` includes `@app/tokens` (ES module in
   `node_modules`).
3. `mobile-react` `decode-uri-component` override: npm 11.6 (Node 24) resolves a `file:` folder
   override relative to the dependent package (`node_modules/query-string/vendor/...`) and fails
   with ENOENT. The vendored package is now a tarball
   (`vendor/decode-uri-component-0.5.0.tgz`), referenced by both the direct dependency and the
   override. Works with npm 10.9, 11.4, 11.6 and 11.21; `check:dependencies` passes.
4. Owner decision: the green palette second brand color is olive (`#4D7C0F` / `#A3E635`) and the
   orange one is coffee brown (`#78350F` / `#D6BFA8`) instead of blue. `info` keeps the previous
   blue on web so it never reads as success. Mobile `secondary` follows the new values.
5. S3.4 (palette preference on web) is done: a palette picker in the settings menu, stored in the
   `themePalette` cookie and restored on the server like `currentMode`. Tenant primary branding
   remains open.

## Next steps inside S3/S4

- S3.4: palette preference and tenant primary branding on web (`withBrandPrimary` + contrast
  check); mobile already has palette selection.

## Color review follow-up 2026-10-07

- S3.2 done: no consumer of `palette.myColor` / `palette.purple.*` remained; `legacyPalette.ts`
  and its theme spread are deleted (also the unused register `constants/colors.ts` and the
  `NavigationColors` enum).
- Charts resolve named palettes (`primary`, `secondary`, `rainbow`, status ramps) from the active
  theme (`palette.app.chart` + module colors), so every chart follows the selected palette.
- Owner decision: decorative gradients use primary only (primary → primary.dark); `secondary`
  (brand 2) stays for real secondary actions and distinct states.
- Text on solid status/brand fills uses `*.contrastText` (monochrome dark primary is near white).
- Success color is tuned per palette (orange: olive, blue: emerald, monochrome: neutral) and
  toast icons take their colors from the theme.
- The pre-hydration background/accent CSS is generated from tokens per palette and mode; the
  bootstrap script sets `data-palette` from the `themePalette` cookie.

## Color review P2, mobile and font 2026-10-07

- Web: tree views (cost centers, split tree, hierarchical list), profile/auth card surfaces, the
  metric card and the login side panel use theme tokens; the dark login panel no longer fills
  with the light (300) dark-mode primary.
- Hydration: saved mode/palette/language are applied in one update that remounts the page tree
  when they differ from the static-shell defaults (no mismatched colors or text).
- Mobile: palette list/default from tokens; `AppTheme.modules`; module drawers color the header
  icon by module and alternate item icons like the web sidebar; recruitment, workforce trace and
  tree views use theme colors; rgba helpers use tokens `withAlpha`.
- Font: IBM Plex Sans Arabic is self-hosted on web (`public/fonts`, `src/fonts.css`, preload,
  immutable cache, cached by the service worker; CSP unchanged) and bundled on mobile
  (`assets/fonts`, `expo-font`, one family per weight in `AppText` and the navigation theme).
- Baselines (S3.3): `web-next/e2e/theme-baselines.spec.ts` (`npm run capture:theme-baselines`)
  captures reference screens in 4 palettes × light/dark × LTR/RTL against the deterministic e2e
  backend. Contact sheets: `baselines/login.png`, `baselines/P-001-countries.png`,
  `baselines/P-006-role-permissions.png`, `baselines/super-admin-dashboard.png`.
- Super Admin dashboard: KPI cards use status colors only for status (enabled = success,
  expiring = warning); neutral counts use primary, brand 2 and the palette module colors
  (`MetricCard.accentColor`); the user badge, company context and Global Geography action use
  primary. Subscription status chips keep semantic colors (trial = info). P-002 (Cost Centers) and P-003 (Add Tenant) need e2e
  fixture endpoints for organizational structure and tenants and stay open.
- Found while capturing: page titles used `info.light` (blue on every palette) and read-only field
  labels used `info.light`; both use primary now. Tinted chips (`AppChip` soft/outlined) use the
  dark shade in light mode for 4.5:1; the unavailable context badge no longer dims its text;
  the top-bar context box and badge have `role="group"`.
- e2e suite repaired (25/25 desktop, 3/3 mobile): fixture role claims carry `moduleCode`;
  role-permissions, Countries (newest-first default order), a11y (`user-avatar-badge`) and the
  fiscal-year date entry (MUI X sectioned picker) specs follow the current UI.
- Still open: tenant primary branding (`withBrandPrimary`, needs a tenant setting and API),
  shared web/mobile palette preference (needs a user-preference API), P-002/P-003 baselines.

## Spacing regression fix 2026-10-10

- Found from owner screenshots (cards, chips overlapping): `createMuiThemeOptions` sets MUI
  `spacing` to the 4px token step, while every web layout was written for MUI's default 8px.
  Since the S3 switch all web `sx` spacing and `Grid spacing` were half size.
- Decision: web keeps `spacing: 8` in `getDesignTokens` (one MUI step = two token steps);
  mobile is unchanged. Rule for new web code: MUI spacing units are 8px.
- Country pills on state/district cards take their hue from the palette module colors (they
  used status colors such as info/error).
- e2e: the fiscal-year and dirty-form specs are timing-sensitive in the full serial run
  (pass when re-run); tracked as flaky, not a regression.

## Scrollbar colors follow the palette 2026-10-10

- Found by the owner: scrollbars were blue in every palette. `index.css` hard-coded blue
  `--app-scrollbar-*` values per mode only, and `data-palette` was set by the bootstrap
  script but never updated when the palette changed at runtime.
- Decision: `layout.tsx` writes the scrollbar variables per palette and mode from the token
  primary (track 7%/10%, thumb 45%, hover 70%, active 88%) next to the other pre-hydration
  colors; `ThemeShell` keeps `data-palette` in sync. `index.css` values are fallbacks only.
- Verified in a production build: computed `--app-scrollbar-thumb` matches the primary of
  all 4 palettes in light and dark.
