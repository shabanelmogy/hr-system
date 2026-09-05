# Mobile styling guide

This is the default styling contract for every feature in `mobile-react` (Expo SDK 57 / React Native 0.86). It keeps the app coherent across palettes, light/dark mode, screen sizes, and English/Arabic. When a feature needs an exception, document the reason in review and keep the exception local.

## Ownership hierarchy

Use the narrowest owner that can express the rule:

1. **`src/core/theme/theme.ts`** owns reusable design tokens: semantic colors, spacing, radii, typography sizes, and theme-mode behavior. Add a token only when it is genuinely app-wide and name it by meaning, not by a screen.
2. **`src/shared/components`** owns domain-neutral visual behavior (text, cards, fields, buttons, modal surfaces). A shared component owns its internal layout and exposes intentional variants/props; consumers should not reach into its implementation styles.
3. **`src/features/<feature>`** owns feature composition and feature-specific visuals. Keep styles beside the screen/component that renders them. A feature may use shared primitives and theme tokens, but must not add feature colors or a second design system.

There is no global `shared/styles` dump, per-feature global stylesheet, or catch-all constants file. A token belongs in core only after it has multiple independent consumers; a component belongs in shared only after its behavior is domain-neutral.

## Colocation and file shape

Prefer a `const styles = StyleSheet.create({...})` at the bottom of the component file. This makes ownership, usage, and responsive conditions easy to review and lets React Native validate the style map.

```tsx
import { spacing, useAppTheme } from '@/src/core/theme';

export function EmployeeRow({ employee }: Props) {
  const { theme } = useAppTheme();
  const { direction } = useLocalization();

  return (
    <AppCard style={styles.card}>
      <View style={[styles.row, { direction }]}>
        <AppText style={styles.name}>{employee.name}</AppText>
        <AppText color="muted" variant="bodySmall">{employee.role}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flexShrink: 1 },
});
```

`Component.styles.ts` is allowed only when a component's style map is large enough to obscure the component (roughly 150+ lines or several independently tested sub-layouts), or when multiple files in the same feature intentionally share that map. Pass only the values needed to create dynamic styles; do not turn it into a feature-wide dump. Keep the file next to the component and name it after the component.

## Tokens and visual rules

- **Color:** use semantic pairs from `theme.colors`: surfaces/text, `primary`/`onPrimary`, `secondary`/`onSecondary`, `warning`/`onWarning`, `danger`/`onDanger`, plus `success`, `accent`, `border`, `disabled`, `overlay`, and `shadow`. `onPrimaryMuted` is the translucent foreground treatment over a primary surface; `onSolid` is the foreground for solid status badges. Never assume that white contrasts with a semantic color in dark mode. Disabled content needs both a disabled color and a disabled interaction state.
- **Spacing:** use `theme.spacing` (`xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 20, `xxl` 24, `xxxl` 32). Use a token for gaps, padding, and margins; a one-off number is acceptable only for a platform metric or a documented measured constraint.
- **Radius:** use `theme.radius` (`xs`, `sm`, `md`, `full`). `full` is for pills/circular affordances; do not invent near-duplicate radii.
- **Typography:** use `AppText` and its variants (`caption`, `bodySmall`, `body`, `titleSmall`, `title`, `display`) instead of ad-hoc `fontSize`/color pairs. A custom weight or line height must preserve readable contrast and be justified locally.
- **Layout:** default to flexbox, `flexShrink: 1` for text beside controls, and bounded content widths on large screens. Use `theme.layout.contentMaxWidth` for normal screen/full-screen content and `theme.layout.overlayMaxWidth` for compact overlays/auth workflows. Avoid fixed screen widths/heights; use `flex`, `minWidth`, `maxWidth`, and measured breakpoints.
- **Elevation:** use the existing surface/card primitive where possible. For a new surface, keep Android `elevation` and iOS shadow properties together, use subtle theme-appropriate opacity, and do not use shadows as the only boundary (also provide a border or contrast).

## Static, dynamic, and responsive styles

Put invariant structure in `StyleSheet.create`. Static app-wide tokens such as `spacing`, `radius`, and `layout` may be imported directly from `core/theme` inside a colocated style map. Compose conditional styles with arrays. Put semantic colors and values that change with theme, direction, state, or measurement in the render path:

```tsx
<Pressable
  disabled={disabled}
  style={[styles.button, { backgroundColor: theme.colors.primary }, pressed && styles.pressed, disabled && { opacity: 0.5 }]}
>
  <AppText color="inverse">{label}</AppText>
</Pressable>
```

For many computed values, use `useMemo` keyed by the relevant values or a small style factory; never mutate a `StyleSheet` object. Use `useWindowDimensions` or `onLayout` for responsive decisions. Prefer a compact/expanded layout breakpoint over device-name checks. Verify phones, tablets, portrait, and landscape.

## RTL, safe areas, and platform behavior

Use logical props (`marginStart`, `marginEnd`, `paddingStart`, `paddingEnd`, `borderStartWidth`) and apply the app's `direction` where row order or text alignment must change. Do not call `I18nManager.forceRTL` or reload for language changes. Set `textAlign`/`writingDirection` through `AppText` or the localization convention. Icons that convey direction (back, next, chevrons) must choose the RTL-aware glyph; do not blindly mirror every icon.

Use `SafeAreaView`/insets at the screen or modal boundary, not repeated padding in every child. Account for bottom insets when a footer, keyboard action, or scroll content can be obscured. Keep platform-specific styling behind a small `Platform.select` or a named local variant, and preserve equivalent behavior on iOS, Android, and the web development target.

## Accessibility and touch targets

Every actionable control needs an accessible label/role and a disabled state that is announced by the native control. Keep the interactive hit area at least 44x44 points (use `hitSlop` when the visual icon is smaller), provide visible pressed/focus feedback, and do not communicate status by color alone. Preserve text scaling: avoid clipping, fixed-height text containers, and `numberOfLines` unless truncation is intentional and announced. Check contrast in every palette and both modes.

## Light/dark themes

Resolve the active palette/mode through the app theme provider. A style must remain valid when `isDark` changes: use semantic surfaces, borders, inverse text, and overlay tokens. Do not branch on a palette name to solve a contrast issue; adjust the semantic token or shared primitive. Test system, explicit light, and explicit dark preferences, including modal, navigation, input, empty, error, and disabled states.

## When to extract shared UI

Extract to `shared/components` when the UI is domain-neutral, appears in at least two features (or is clearly a foundational primitive), has a stable API, and its accessibility/theme behavior can be owned centrally. Keep it feature-local when it encodes business vocabulary, query state, a one-off workflow, or has not yet stabilized. Extract the behavior and style together; do not export raw style objects for consumers to coordinate.

## Anti-patterns

- Hardcoded hex colors, arbitrary spacing/radii, or a feature palette.
- `src/shared/styles`, `commonStyles.ts`, or a global screen-style dump.
- Inline style objects for invariant rules, or mutation of styles after creation.
- LTR-only `left`/`right` margins, row assumptions, or directional icons.
- Fixed dimensions that clip translated or scaled text.
- Shadows without a non-shadow boundary, or elevation values copied without platform testing.
- Making a shared component for one business screen, or leaking a shared component's internal style contract.
- Using color alone for validation/status, hiding focus/pressed states, or touch targets smaller than 44 points.

Fixed neutral colors are allowed only when the pixels belong to media itself rather
than the application theme, for example crop-grid guides over a photograph. Keep
such values named and local, verify their contrast over light and dark media, and
do not reuse that exception for normal pages, cards, text, or controls.

## New feature template

1. Identify the screen owner under `src/features/<feature>` and choose existing shared primitives.
2. Sketch states first: loading, empty, error, disabled, pressed, keyboard, light/dark, and LTR/RTL.
3. Use theme tokens and `AppText`; create a colocated `styles` map for invariant layout.
4. Add only necessary dynamic styles for theme, state, direction, and measured breakpoints.
5. Use safe-area insets at boundaries and logical properties throughout.
6. Extract only stable, domain-neutral repetition to `shared/components`.

## Review checklist

- Ownership is clear and no global style dump or raw style export was added.
- Colors, spacing, radii, and typography come from core tokens/primitives.
- `StyleSheet.create` is colocated (or a justified adjacent `.styles.ts` file is used).
- Dynamic values respond correctly to theme, state, direction, and dimensions.
- RTL uses logical props and direction-aware icons; no forced RTL/reload.
- Safe areas, keyboard/scroll behavior, and iOS/Android equivalents are covered.
- Controls have labels, roles, visible states, 44-point targets, and color-independent status.
- Text scaling, translation length, contrast, light/dark, phone/tablet, and landscape were checked.
- `npm run check` passes; the change does not add unrelated dependencies or style infrastructure.

## Migration order and verification

For existing screens, migrate in this order: (1) replace hardcoded colors with semantic theme colors; (2) replace spacing/radii/type constants with tokens or `AppText`; (3) move invariant inline objects into a colocated `StyleSheet`; (4) replace physical directional props with logical props and add direction-aware icons; (5) add safe-area and responsive handling; (6) extract only proven shared primitives; (7) remove obsolete local/global style helpers.

Run the repository check, then manually verify representative loading, data, empty, error, modal, form, and disabled states on a phone and tablet in portrait/landscape, both directions, and light/dark/system modes. Confirm text scaling and keyboard/safe-area behavior on physical or platform simulators. Record any intentional exception in the feature review.

## Platform references

- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [React Native 0.86 StyleSheet](https://reactnative.dev/docs/0.86/stylesheet)
