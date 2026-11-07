import {
  resolveTranslationSource,
  translationValueError,
  translationSettingsSchema,
} from './language-translation';
describe('System translation contracts', () => {
  it('selects an available Web source instead of hardcoding platform-auth', () => {
    const settings = translationSettingsSchema.parse({
      revision: 2,
      languages: ['en', 'ar'],
      catalogVersions: { web: 'current' },
      sources: [
        { id: 'mobile-core', client: 'mobile', namespace: 'core' },
        { id: 'reference-countries', client: 'web', namespace: 'reference-countries' },
      ],
    });
    expect(resolveTranslationSource('', settings)).toBe('reference-countries');
    expect(resolveTranslationSource('platform-auth', settings)).toBe('reference-countries');
    expect(resolveTranslationSource('mobile-core', settings)).toBe('mobile-core');
  });
  it('requires nonempty bounded text and preserves all placeholders including repeated markers', () => {
    expect(translationValueError(' ', 'original')).toBe('required');
    expect(translationValueError('a'.repeat(4001), 'original')).toBe('maxlength');
    expect(translationValueError('مرحبًا {{name}}', 'Hello {{name}}')).toBeNull();
    expect(translationValueError('مرحبًا', 'Hello {{name}}')).toBe('placeholders');
    expect(translationValueError('{0}', '{0} {0}')).toBe('placeholders');
  });
});
