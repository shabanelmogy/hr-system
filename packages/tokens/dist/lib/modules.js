export const moduleColorOrder = [
    'referenceData',
    'hr',
    'accounting',
    'crm',
    'reporting',
];
export const moduleColors = {
    green: {
        light: { referenceData: '#0F766E', hr: '#0369A1', accounting: '#4D7C0F', crm: '#7C3AED', reporting: '#B45309' },
        dark: { referenceData: '#5EEAD4', hr: '#7DD3FC', accounting: '#A3E635', crm: '#C4B5FD', reporting: '#FCD34D' },
    },
    orange: {
        light: { referenceData: '#C2410C', hr: '#0F766E', accounting: '#78350F', crm: '#BE123C', reporting: '#6D28D9' },
        dark: { referenceData: '#FDBA74', hr: '#5EEAD4', accounting: '#D6BFA8', crm: '#FDA4AF', reporting: '#C4B5FD' },
    },
    blue: {
        light: { referenceData: '#1D4ED8', hr: '#4D7C0F', accounting: '#0F766E', crm: '#BE185D', reporting: '#C2410C' },
        dark: { referenceData: '#93C5FD', hr: '#BEF264', accounting: '#5EEAD4', crm: '#F9A8D4', reporting: '#FDBA74' },
    },
    // Navy & gold: navy General Data, gold accounting; reporting is orange so it stays apart from the
    // lavender navy primary in dark mode.
    navy: {
        light: { referenceData: '#1E3A8A', hr: '#0F766E', accounting: '#A16207', crm: '#BE185D', reporting: '#C2410C' },
        dark: { referenceData: '#A5B4FC', hr: '#5EEAD4', accounting: '#FDE047', crm: '#F9A8D4', reporting: '#FDBA74' },
    },
    // Black & white: deep (800) tones in light mode so the set stays sober but every module
    // is still clearly distinct (owner feedback 2026-10-07: tinted greys looked identical).
    monochrome: {
        light: { referenceData: '#171717', hr: '#3F6212', accounting: '#115E59', crm: '#5B21B6', reporting: '#9A3412' },
        dark: { referenceData: '#FAFAFA', hr: '#BEF264', accounting: '#5EEAD4', crm: '#C4B5FD', reporting: '#FDBA74' },
    },
};
