import type { LocalizationCulture } from '../domain/models/localization';
import type {
  LocalizationRepository,
  UpdateLocalizationRequest,
} from '../domain/repositories/localization-repository';

export interface LocalizationUseCases {
  getLocalization(culture: LocalizationCulture): ReturnType<LocalizationRepository['getLocalization']>;
  updateLocalization(request: UpdateLocalizationRequest): Promise<void>;
}

export function createLocalizationUseCases(repository: LocalizationRepository): LocalizationUseCases {
  return {
    getLocalization: (culture) => repository.getLocalization(culture),
    updateLocalization: (request) => repository.updateLocalization(request),
  };
}
