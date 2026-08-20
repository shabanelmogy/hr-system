import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';

export const localizationApi = {
  getLocalization: platformToolsApi.getLocalization,
  updateLocalization: platformToolsApi.updateLocalization,
};
