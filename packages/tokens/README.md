# @app/tokens

One design-token source for `web-next` (MUI + Emotion), `mobile-react` (React Native / Expo),
and any future client. Extracted from the mobile app's theme
(`mobile-react/src/core/theme/theme.ts` and `AppText.tsx`) and completed into a full system.

Status in this repository: imported 2026-09-28 from the School template work. Adoption by
`web-next` and `mobile-react` is planned in
`documentation/plans/business/erp-platform-template/` (slices S3 and S4); until then no
application imports this package.

| Token group | Source | Web output (MUI / CSS) | Native use |
| --- | --- | --- | --- |
| Colors — 4 palettes × light/dark | mobile `themeCatalog` | CSS variables, Tailwind `bg-primary` … | `theme.colors.primary` |
| Spacing | mobile `spacing` | Tailwind default scale (4px) matches | `theme.spacing.lg` |
| Radius | mobile `radius` (+ `lg`, `xl`) | `rounded-md`, `--radius` | `theme.radius.md` |
| Text styles (size, line height, weight) | mobile `AppText` variants | `text-title`, `text-body` … | `theme.text.title` |
| Font family (Arabic + Latin) | new | `font-sans` | `fontFamily.sans` (expo-font) |
| Elevation | new | `shadow-md` | `nativeShadow('md', color)` |
| Motion, layout, breakpoints, z-index, icon sizes | new (layout from mobile) | CSS variables | `theme.layout`, `theme.motion` |

## Semantic color names

The canonical vocabulary uses quiet `secondary`/`accent` surfaces (shadcn meaning). The mobile
app's strong "secondary" and "accent" colors are renamed `brand2`/`brand3`. The MUI adapter maps
MUI's strong `palette.secondary` to `brand2`, never to the quiet surface.

| Canonical (`SemanticColors`) | CSS variable | Mobile legacy key |
| --- | --- | --- |
| `background` / `foreground` | `--background` / `--foreground` | `background` / `text` |
| `surface` / `surfaceForeground` | `--card`, `--popover`, `--surface` | `surface` / `text` |
| `muted` / `mutedForeground` | `--muted` / `--muted-foreground` | `surfaceMuted` / `textMuted` |
| `primary` / `primaryForeground` | `--primary` / `--primary-foreground` | `primary` / `onPrimary` |
| `secondary`, `accent` (quiet surfaces) | `--secondary`, `--accent` | `surfaceMuted` |
| `brand2` / `brand2Foreground` | `--brand-2` | `secondary` / `onSecondary` |
| `brand3` / `brand3Foreground` | `--brand-3` | `accent` / `onSolid` |
| `success`, `warning`, `destructive`, `info` (+ foregrounds) | `--success` … | `success`, `warning`/`onWarning`, `danger`/`onDanger`, `secondary` |
| `border`, `input`, `ring` | `--border`, `--input`, `--ring` | `border`, `border`, `primary` |
| `disabled`, `overlay`, `shadow` | `--disabled`, `--overlay` | same |
| chart series | `--chart-1` … `--chart-5` | — |

Deviation from the mobile source: the orange light palette used the primary color as `warning`;
it now uses the standard warning amber so warnings stay distinguishable from primary actions.

## Installing in an app

The package ships compiled JavaScript and declarations in `dist/lib/` (committed), so apps need
no `transpilePackages`, Metro `watchFolders`, or TypeScript extension flags. Each app installs a
**copy** (not a symlink) so Next.js and Metro never resolve files outside their project root:

```bash
# once per app (web-next, mobile-react)
echo "install-links=true" >> .npmrc
npm install ../packages/tokens
```

After changing `src/`, run `npm run sync` here: it builds, runs the checks, and copies the package into `web-next` and `mobile-react` (`npm install` alone skips the copy while the version is unchanged). Commit `src/` and `dist/` together, then restart the dev servers.
`npm run check` fails when `dist/` is stale.

## Web (web-next: MUI)

```ts
// web-next/src/theme/useThemeSettings.ts (target, slice S3)
import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { createMuiThemeOptions, getTheme } from '@app/tokens';
import { appComponentDefaults } from './theme'; // scroll-lock and other app-only defaults stay here

const theme = createTheme(
  deepmerge(createMuiThemeOptions(getTheme(palette, mode), direction), appComponentDefaults),
);
```

```ts
// web-next/src/theme/mui-augmentation.d.ts — expose the extra tokens with types
import type { MuiAppPalette } from '@app/tokens';
declare module '@mui/material/styles' {
  interface Palette { app: MuiAppPalette }
  interface PaletteOptions { app?: MuiAppPalette }
}
```

| MUI slot | Token |
| --- | --- |
| `palette.primary` | `primary` / `primaryForeground` |
| `palette.secondary` | `brand2` / `brand2Foreground` |
| `palette.success/warning/info` | same names |
| `palette.error` | `destructive` |
| `palette.background.default` / `.paper` | `background` / `surface` |
| `palette.text.primary` / `.secondary` / `.disabled` | `foreground` / `mutedForeground` / `disabled` |
| `palette.divider` | `border` |
| `palette.app.*` | surface, muted, brand2, brand3, border, input, ring, overlay, chart |
| `typography` h1–h6, subtitle1–2, body1–2, caption, button | text styles (rem, unitless line height); buttons are not uppercased |
| `shape.borderRadius` | `radius.md` (8) |
| `spacing` | 4px grid (`theme.spacing(4)` = 16px = `spacing.lg`) |
| `zIndex`, `transitions` | token order and durations on MUI's base values |
| `breakpoints` | MUI defaults unless `{ useTokenBreakpoints: true }` |

Breakpoints are opt-in because existing `web-next` layouts are written against MUI's default
breakpoints. Verified against `@mui/material` 9 `createTheme()` with a strict type check.

The legacy `palette.myColor` and `palette.purple.*` keys in `web-next/src/theme/theme.ts` have no
token equivalent. Slice S3 inventories their consumers and maps each one to a semantic token
before removing them.

### CSS variables (non-MUI surfaces)

`dist/tokens.css` exposes the same colors as CSS variables for surfaces MUI does not render
(print templates, report HTML, embedded widgets). `dist/theme.css` is a Tailwind v4 mapping kept
for products that choose Tailwind; `web-next` does not use it.

```html
<html data-palette="green" class="dark" dir="rtl">
```

## Mobile (Expo / React Native)

```tsx
import { getTheme, nativeShadow, resolveMode } from '@app/tokens';

const theme = getTheme(palette, resolveMode(mode, colorScheme === 'dark'));

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    ...nativeShadow('sm', theme.colors.shadow),
  },
  title: { ...theme.text.title, color: theme.colors.foreground, fontFamily: theme.fontFamily.sans },
});
```

The mobile app keeps its `AppTheme` shape through `createMobileColors()`, which returns the
legacy keys (`surfaceMuted`, `text`, `onPrimary`, `danger`, …) with identical values; see
`mobile-react/src/core/theme/theme.ts`.

## Tenant branding

`withBrandPrimary(theme, primary, primaryForeground)` overrides only the primary color (and ring),
so a tenant can carry its brand without breaking the rest of the palette. Validate the pair with
`contrastRatio(primaryForeground, primary) >= 4.5` before saving it.

## Commands

```bash
npm run sync            # build + check + copy into web-next and mobile-react
npm run build           # regenerate dist/tokens.css, dist/theme.css, dist/tokens.json
npm run check:contrast  # WCAG AA for every text pair and 3:1 for focus/UI pairs, all palettes
npm run typecheck
```

The contrast check currently passes for all 8 themes. It reports `input` borders on surfaces as
advisory (about 1.3–1.7:1): inputs must therefore keep a visible label and fill; raise `input` to
a stronger color if a product needs 3:1 hairline boundaries.

## Rules

- Components never use raw hex values or pixel literals that exist as tokens.
- In `web-next`, read colors through the MUI theme (`theme.palette.*`), not from the CSS file.
- Add a token here first, rebuild, and use it on both platforms in the same change.
- Palette changes must pass `check:contrast`.
