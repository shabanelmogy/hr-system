/**
 * React Native adapter.
 *
 * `createMobileColors()` returns the color object in the exact shape and key names that
 * `mobile-react/src/core/theme/theme.ts` (`AppColors`) uses today, so the mobile app can
 * switch its source of truth to this package without touching any screen. Values are
 * identical to the original mobile palettes except: the orange light `warning`, which now
 * uses the standard amber so warnings stay distinguishable from the orange primary; and
 * the green and orange palette `secondary`, which is olive (green) and coffee brown
 * (orange) instead of blue (owner decision 2026-10-06); their `info` stays blue on web.
 */
import type { SemanticColors } from './palettes.ts';
export interface MobileColors {
    background: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    primary: string;
    onPrimary: string;
    onPrimaryMuted: string;
    onSecondary: string;
    onWarning: string;
    onDanger: string;
    onSolid: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    border: string;
    disabled: string;
    overlay: string;
    shadow: string;
}
/** `#RRGGBB` (or `#RGB`) → `rgba(r, g, b, alpha)`. Other inputs are returned unchanged. */
export declare function withAlpha(color: string, alpha: number): string;
export declare function createMobileColors(colors: SemanticColors): MobileColors;
