/**
 * Non-color scales. Values in pixels (React Native units); the CSS build
 * converts them to rem where appropriate (16px = 1rem).
 * Spacing, radius, typography sizes and line heights come from the HR mobile
 * app (`theme.ts`, `AppText.tsx`); the rest completes the system.
 */
export declare const spacing: {
    readonly none: 0;
    readonly xxs: 2;
    readonly xs: 4;
    readonly sm: 8;
    readonly md: 12;
    readonly lg: 16;
    readonly xl: 20;
    readonly xxl: 24;
    readonly xxxl: 32;
    readonly section: 48;
};
export declare const radius: {
    readonly none: 0;
    readonly xs: 4;
    readonly sm: 6;
    readonly md: 8;
    readonly lg: 12;
    readonly xl: 16;
    readonly full: 999;
};
export declare const fontWeight: {
    readonly regular: "400";
    readonly medium: "500";
    readonly semibold: "600";
    readonly bold: "700";
    readonly extrabold: "800";
};
export interface TextStyleToken {
    fontSize: number;
    lineHeight: number;
    fontWeight: (typeof fontWeight)[keyof typeof fontWeight];
}
export declare const textStyles: {
    readonly caption: {
        readonly fontSize: 12;
        readonly lineHeight: 16;
        readonly fontWeight: "400";
    };
    readonly bodySmall: {
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: "400";
    };
    readonly body: {
        readonly fontSize: 16;
        readonly lineHeight: 24;
        readonly fontWeight: "400";
    };
    readonly label: {
        readonly fontSize: 14;
        readonly lineHeight: 20;
        readonly fontWeight: "600";
    };
    readonly titleSmall: {
        readonly fontSize: 20;
        readonly lineHeight: 26;
        readonly fontWeight: "700";
    };
    readonly title: {
        readonly fontSize: 24;
        readonly lineHeight: 31;
        readonly fontWeight: "700";
    };
    readonly display: {
        readonly fontSize: 30;
        readonly lineHeight: 38;
        readonly fontWeight: "800";
    };
};
export type TextVariant = keyof typeof textStyles;
/**
 * Font families. Arabic and Latin share one family so mixed text keeps the
 * same rhythm. The native app bundles the files (assets/fonts) and loads one family per
 * weight with expo-font; the web app self-hosts them (public/fonts + src/fonts.css).
 */
export declare const fontFamily: {
    readonly sans: "IBM Plex Sans Arabic";
    readonly mono: "IBM Plex Mono";
};
export declare const fontStack: {
    readonly sans: "\"IBM Plex Sans Arabic\", \"Segoe UI\", Tahoma, system-ui, sans-serif";
    readonly mono: "\"IBM Plex Mono\", ui-monospace, SFMono-Regular, Menlo, monospace";
};
/** Elevation levels. `native` feeds React Native shadow props; `css` feeds box-shadow. */
export declare const elevation: {
    readonly none: {
        readonly css: "none";
        readonly native: {
            readonly shadowOpacity: 0;
            readonly shadowRadius: 0;
            readonly shadowOffsetY: 0;
            readonly elevation: 0;
        };
    };
    readonly sm: {
        readonly css: "0 1px 2px 0 rgb(0 0 0 / 0.06)";
        readonly native: {
            readonly shadowOpacity: 0.06;
            readonly shadowRadius: 2;
            readonly shadowOffsetY: 1;
            readonly elevation: 1;
        };
    };
    readonly md: {
        readonly css: "0 4px 12px -2px rgb(0 0 0 / 0.10)";
        readonly native: {
            readonly shadowOpacity: 0.1;
            readonly shadowRadius: 8;
            readonly shadowOffsetY: 4;
            readonly elevation: 3;
        };
    };
    readonly lg: {
        readonly css: "0 12px 32px -8px rgb(0 0 0 / 0.18)";
        readonly native: {
            readonly shadowOpacity: 0.18;
            readonly shadowRadius: 16;
            readonly shadowOffsetY: 8;
            readonly elevation: 8;
        };
    };
};
export declare const motion: {
    readonly duration: {
        readonly fast: 120;
        readonly normal: 200;
        readonly slow: 320;
    };
    readonly easing: {
        readonly standard: "cubic-bezier(0.2, 0, 0, 1)";
        readonly emphasized: "cubic-bezier(0.3, 0, 0, 1)";
    };
};
export declare const layout: {
    readonly contentMaxWidth: 960;
    readonly wideContentMaxWidth: 1280;
    readonly overlayMaxWidth: 520;
    readonly sidebarWidth: 272;
    readonly sidebarCollapsedWidth: 72;
    /** Minimum touch/click target (WCAG 2.5.8 recommends 24; platforms recommend 44-48). */
    readonly touchTarget: 44;
    readonly controlHeight: {
        readonly sm: 36;
        readonly md: 44;
        readonly lg: 52;
    };
};
/** Viewport breakpoints (min-width), shared by web media queries and native useWindowDimensions. */
export declare const breakpoints: {
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
};
export declare const zIndex: {
    readonly base: 0;
    readonly sticky: 10;
    readonly drawer: 40;
    readonly overlay: 50;
    readonly modal: 60;
    readonly toast: 70;
    readonly tooltip: 80;
};
/** Icon names are shared by meaning; each platform maps them to its icon set. */
export declare const iconSize: {
    readonly sm: 16;
    readonly md: 20;
    readonly lg: 24;
    readonly xl: 32;
};
