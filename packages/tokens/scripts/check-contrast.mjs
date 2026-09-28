// Fails when a text/background pair in any palette misses WCAG AA.
// Requires Node >= 22.18 (built-in TypeScript type stripping).
import { contrastRatio, palettes, themePaletteOrder } from '../src/index.ts';

const TEXT = 4.5; // WCAG 1.4.3 normal text
const UI = 3.0;   // WCAG 1.4.11 non-text (focus ring, icons, input boundary)

const textPairs = [
  ['foreground', 'background'],
  ['surfaceForeground', 'surface'],
  ['mutedForeground', 'surface'],
  ['mutedForeground', 'background'],
  ['mutedForeground', 'muted'],
  ['secondaryForeground', 'secondary'],
  ['primaryForeground', 'primary'],
  ['destructiveForeground', 'destructive'],
  ['successForeground', 'success'],
  ['warningForeground', 'warning'],
  ['infoForeground', 'info'],
  ['brand2Foreground', 'brand2'],
  ['brand3Foreground', 'brand3'],
];
const uiPairs = [
  ['ring', 'background'],
  ['primary', 'surface'],
  ['destructive', 'surface'],
];
// Reported but not failing: many design systems keep hairline borders below 3:1
// and rely on fill/label for the control boundary.
const advisoryPairs = [['input', 'surface']];

const failures = [];
const advisories = [];
for (const palette of themePaletteOrder) {
  for (const mode of ['light', 'dark']) {
    const colors = palettes[palette][mode];
    const check = (pairs, minimum, sink) => {
      for (const [fg, bg] of pairs) {
        const ratio = contrastRatio(colors[fg], colors[bg]);
        if (ratio < minimum) sink.push(`${palette}/${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)} (< ${minimum})`);
      }
    };
    check(textPairs, TEXT, failures);
    check(uiPairs, UI, failures);
    check(advisoryPairs, UI, advisories);
  }
}

for (const line of advisories) console.log(`ADVISORY ${line}`);
if (failures.length > 0) {
  for (const line of failures) console.error(`FAIL     ${line}`);
  console.error(`\n${failures.length} contrast failure(s).`);
  process.exit(1);
}
console.log(`Contrast OK: ${themePaletteOrder.length * 2} themes, ${textPairs.length} text pairs (AA ${TEXT}) and ${uiPairs.length} UI pairs (${UI}).`);
