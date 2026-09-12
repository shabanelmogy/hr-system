import { apiService } from '@/src/core/api';

import type { LocalizationRepository } from '../../domain/repositories/localization-repository';
import { localizationEndpoints } from './localization-endpoints';
import { localizationSchema } from './localization-schemas';

export const localizationRemoteDataSource: LocalizationRepository = {
  async getLocalization(culture) {
    const response = await apiService.get<unknown>(localizationEndpoints.get(culture));
    return Object.entries(localizationSchema.parse(response)).map(([key, value]) => ({
      id: key,
      key,
      value,
    }));
  },

  async updateLocalization(request) {
    await apiService.put<unknown, { Language: string; Key: string; Value: string }>(
      localizationEndpoints.update,
      { Language: request.culture, Key: request.key, Value: request.value },
    );
  },
};
