/** WCAG 2.x contrast helpers used by the token checks and available to apps. */
export declare function parseHex(color: string): [number, number, number];
export declare function relativeLuminance(color: string): number;
export declare function contrastRatio(foreground: string, background: string): number;
