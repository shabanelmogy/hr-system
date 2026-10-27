import {
  createCompanyLocalizationDefaultSchema,
  createCompanyLocalizationTextSchema,
  createMockLocalizedValue,
  hasMatchingPlaceholders,
} from './company-localization-validation';

describe('company localization presentation validation', () => {
  const message = 'invalid localization value';

  it('requires a nonblank value and enforces the API maximum without trimming its submitted value', () => {
    const schema = createCompanyLocalizationTextSchema(message);

    expect(schema.safeParse({ value: '   ' }).success).toBe(false);
    expect(schema.safeParse({ value: 'x'.repeat(4001) }).success).toBe(false);
    expect(schema.parse({ value: '  Hello {{name}}  ' }).value).toBe('  Hello {{name}}  ');
  });

  it('limits default language to the two catalog languages', () => {
    const schema = createCompanyLocalizationDefaultSchema();

    expect(schema.parse({ language: 'en' })).toEqual({ language: 'en' });
    expect(schema.parse({ language: 'ar' })).toEqual({ language: 'ar' });
    expect(schema.safeParse({ language: 'fr' }).success).toBe(false);
  });

  it('adds mock content after the shipped string and keeps all placeholder spellings intact', () => {
    const shipped = 'Hello {{name}}, total {0}, {{-html}}';
    const generated = createMockLocalizedValue(shipped, ' — sample');

    expect(generated).toBe('Hello {{name}}, total {0}, {{-html}} — sample');
    expect(generated.match(/\{\{[^}]+}}|\{\d+}/g)).toEqual(['{{name}}', '{0}', '{{-html}}']);
  });

  it('requires the exact shipped placeholder multiset when a baseline is supplied', () => {
    const baseline = 'Hello {{name}}, total {0}, <1>details</1>';
    const schema = createCompanyLocalizationTextSchema(message, baseline);

    expect(hasMatchingPlaceholders(baseline, 'Total {0}; {{name}} <1>x</1>')).toBe(true);
    expect(schema.safeParse({ value: 'Hello {{name}}' }).success).toBe(false);
    expect(schema.safeParse({ value: 'Hello {{name}} {{name}}, {0}, <1>x</1>' }).success).toBe(false);
  });
});
