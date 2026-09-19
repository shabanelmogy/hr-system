import { ROUTES } from '@/src/core/constants/routes';
import type { MobileModuleDefinition } from '@/src/platform/modules/registry';

export const platformModuleDefinition: MobileModuleDefinition = {
  code: 'platform',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [
    {
      code: 'tenant-administration',
      entryCandidates: [ROUTES.administration.root, ROUTES.basicData.companyGeographicScope],
      routePrefixes: [
        ROUTES.administration.root,
        ROUTES.basicData.companyGeographicScope,
        ROUTES.advancedTools.trackChanges,
        ROUTES.advancedTools.localizationApi,
      ],
    },
    {
      code: 'operations',
      entryCandidates: [ROUTES.advancedTools.healthCheck, ROUTES.advancedTools.apiEndpoints, ROUTES.extras.files],
      routePrefixes: [
        ROUTES.advancedTools.healthCheck,
        ROUTES.advancedTools.apiEndpoints,
        ROUTES.advancedTools.hangfireDashboard,
        ROUTES.extras.files,
      ],
    },
  ],
};
