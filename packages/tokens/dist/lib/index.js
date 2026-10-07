import { chartColors, defaultPalette, palettes, themePaletteOrder, } from "./palettes.js";
import { breakpoints, elevation, fontFamily, fontStack, fontWeight, iconSize, layout, motion, radius, spacing, textStyles, zIndex, } from "./scales.js";
export * from "./contrast.js";
export * from "./mui.js";
export * from "./native.js";
export * from "./modules.js";
import { moduleColors } from "./modules.js";
export { breakpoints, chartColors, defaultPalette, elevation, fontFamily, fontStack, fontWeight, iconSize, layout, motion, palettes, radius, spacing, textStyles, themePaletteOrder, zIndex, };
export function getTheme(palette = defaultPalette, mode = 'light') {
    const colors = palettes[palette][mode];
    return {
        palette,
        mode,
        isDark: mode === 'dark',
        colors,
        chart: chartColors(colors),
        modules: moduleColors[palette][mode],
        spacing,
        radius,
        text: textStyles,
        fontFamily,
        elevation,
        motion,
        layout,
        breakpoints,
        zIndex,
        iconSize,
    };
}
export function resolveMode(mode, systemIsDark) {
    return mode === 'system' ? (systemIsDark ? 'dark' : 'light') : mode;
}
/**
 * Tenant branding: a tenant may override the primary color only. The ring follows
 * the primary; everything else stays on the chosen palette so contrast checks still hold.
 */
export function withBrandPrimary(theme, primary, primaryForeground) {
    const colors = { ...theme.colors, primary, primaryForeground, ring: primary };
    return { ...theme, colors, chart: chartColors(colors) };
}
/** React Native shadow props for an elevation level (iOS shadow* + Android elevation). */
export function nativeShadow(level, color) {
    const value = elevation[level].native;
    return {
        shadowColor: color,
        shadowOpacity: value.shadowOpacity,
        shadowRadius: value.shadowRadius,
        shadowOffset: { width: 0, height: value.shadowOffsetY },
        elevation: value.elevation,
    };
}
