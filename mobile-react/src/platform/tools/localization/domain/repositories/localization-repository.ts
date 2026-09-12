import type { LocalizationCulture, LocalizationEntry } from '../models/localization';

export interface UpdateLocalizationRequest {
  culture: LocalizationCulture;
  key: string;
  value: string;
}

export interface LocalizationRepository {
  getLocalization(culture: LocalizationCulture): Promise<LocalizationEntry[]>;
  updateLocalization(request: UpdateLocalizationRequest): Promise<void>;
}
