import { localizationEndpoints } from './localization-endpoints';
import { localizationSchema } from './localization-schemas';

describe('localization remote boundary', () => {
  it('preserves localization endpoint routes', () => {
    expect(localizationEndpoints.get('ar-EG')).toBe('localization/getLocalization/ar-EG');
    expect(localizationEndpoints.update).toBe('localization/updateLocalizationKey');
  });

  it('accepts string dictionaries and rejects nested values', () => {
    expect(localizationSchema.parse({ greeting: 'Hello' })).toEqual({ greeting: 'Hello' });
    expect(localizationSchema.safeParse({ greeting: { nested: true } }).success).toBe(false);
  });
});
