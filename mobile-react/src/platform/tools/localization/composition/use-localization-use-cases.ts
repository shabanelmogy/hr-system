import { createLocalizationUseCases } from '../application/localization-use-cases';
import { DefaultLocalizationRepository } from '../data/repositories/default-localization-repository';

const localizationUseCases = createLocalizationUseCases(new DefaultLocalizationRepository());

export function useLocalizationUseCases() {
  return localizationUseCases;
}
