import type { LocalizationCulture } from '../../domain/models/localization';

export const localizationEndpoints = {
  get: (culture: LocalizationCulture) => `localization/getLocalization/${culture}`,
  update: 'localization/updateLocalizationKey',
} as const;
