export const moduleColorOrder = [
    'hr',
    'accounting',
    'crm',
    'referenceData',
    'reporting',
];
export const moduleColors = {
    green: {
        light: { hr: '#0F766E', accounting: '#4D7C0F', crm: '#7C3AED', referenceData: '#0369A1', reporting: '#B45309' },
        dark: { hr: '#5EEAD4', accounting: '#A3E635', crm: '#C4B5FD', referenceData: '#7DD3FC', reporting: '#FCD34D' },
    },
    orange: {
        light: { hr: '#C2410C', accounting: '#78350F', crm: '#BE123C', referenceData: '#0F766E', reporting: '#6D28D9' },
        dark: { hr: '#FDBA74', accounting: '#D6BFA8', crm: '#FDA4AF', referenceData: '#5EEAD4', reporting: '#C4B5FD' },
    },
    blue: {
        light: { hr: '#1D4ED8', accounting: '#0F766E', crm: '#BE185D', referenceData: '#4D7C0F', reporting: '#C2410C' },
        dark: { hr: '#93C5FD', accounting: '#5EEAD4', crm: '#F9A8D4', referenceData: '#BEF264', reporting: '#FDBA74' },
    },
    // Black & white: deep (800) tones in light mode so the set stays sober but every module
    // is still clearly distinct (owner feedback 2026-10-07: tinted greys looked identical).
    monochrome: {
        light: { hr: '#171717', accounting: '#115E59', crm: '#5B21B6', referenceData: '#3F6212', reporting: '#9A3412' },
        dark: { hr: '#FAFAFA', accounting: '#5EEAD4', crm: '#C4B5FD', referenceData: '#BEF264', reporting: '#FDBA74' },
    },
};
