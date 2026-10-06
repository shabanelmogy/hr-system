/** `#RRGGBB` (or `#RGB`) → `rgba(r, g, b, alpha)`. Other inputs are returned unchanged. */
export function withAlpha(color, alpha) {
    const hex = color.trim().replace(/^#/, '');
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    if (!/^[0-9a-fA-F]{6}$/.test(full))
        return color;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
export function createMobileColors(colors) {
    return {
        background: colors.background,
        surface: colors.surface,
        surfaceMuted: colors.muted,
        text: colors.foreground,
        textMuted: colors.mutedForeground,
        primary: colors.primary,
        onPrimary: colors.primaryForeground,
        onPrimaryMuted: withAlpha(colors.primaryForeground, 0.14),
        onSecondary: colors.brand2Foreground,
        onWarning: colors.warningForeground,
        onDanger: colors.destructiveForeground,
        onSolid: colors.brand3Foreground,
        secondary: colors.brand2,
        accent: colors.brand3,
        success: colors.success,
        warning: colors.warning,
        danger: colors.destructive,
        border: colors.border,
        disabled: colors.disabled,
        overlay: colors.overlay,
        shadow: colors.shadow,
    };
}
