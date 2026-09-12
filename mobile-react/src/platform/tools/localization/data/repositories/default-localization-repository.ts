import type {
  LocalizationRepository,
  UpdateLocalizationRequest,
} from '../../domain/repositories/localization-repository';
import { localizationRemoteDataSource } from '../remote/localization-remote-data-source';

export class DefaultLocalizationRepository implements LocalizationRepository {
  constructor(private readonly remote: LocalizationRepository = localizationRemoteDataSource) {}

  getLocalization = (culture: Parameters<LocalizationRepository['getLocalization']>[0]) => this.remote.getLocalization(culture);
  updateLocalization = (request: UpdateLocalizationRequest) => this.remote.updateLocalization(request);
}
