import { fontFamily as tokenFontFamily } from '@app/tokens';
import type { TextStyle } from 'react-native';

/**
 * IBM Plex Sans Arabic (tokens `fontFamily.sans`), bundled in assets/fonts (SIL OFL 1.1).
 * React Native picks a face by family name, not by fontWeight, so every weight is its own
 * family. 800 maps to Bold, the heaviest face the font ships.
 */
export const appFontFamily = tokenFontFamily.sans;

export const appFontFaces = {
  regular: 'IBMPlexSansArabic-Regular',
  medium: 'IBMPlexSansArabic-Medium',
  semiBold: 'IBMPlexSansArabic-SemiBold',
  bold: 'IBMPlexSansArabic-Bold',
} as const;

export const appFontAssets = {
  [appFontFaces.regular]: require('../../../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
  [appFontFaces.medium]: require('../../../assets/fonts/IBMPlexSansArabic-Medium.ttf'),
  [appFontFaces.semiBold]: require('../../../assets/fonts/IBMPlexSansArabic-SemiBold.ttf'),
  [appFontFaces.bold]: require('../../../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
};

let fontsAvailable = false;

/** Called by the root layout once the font files loaded (or failed: then the system font stays). */
export function setAppFontsAvailable(available: boolean) {
  fontsAvailable = available;
}

export function areAppFontsAvailable() {
  return fontsAvailable;
}

export function getFontFace(weight: TextStyle['fontWeight'] | undefined): string {
  const numeric =
    weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 400 : Number(weight);
  if (numeric >= 700) return appFontFaces.bold;
  if (numeric >= 600) return appFontFaces.semiBold;
  if (numeric >= 500) return appFontFaces.medium;
  return appFontFaces.regular;
}

/**
 * Style that applies the bundled face for `weight`. fontWeight is reset to 'normal'
 * because the face already carries the weight; Android would otherwise synthesize bold.
 * Returns nothing while the fonts are unavailable, so the system font is used.
 */
export function fontStyleForWeight(weight: TextStyle['fontWeight'] | undefined): TextStyle | undefined {
  if (!fontsAvailable) return undefined;
  return { fontFamily: getFontFace(weight), fontWeight: 'normal' };
}
