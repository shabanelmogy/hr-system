import { ROUTES } from '@/src/core/constants/routes';
import type { MobileModuleDefinition } from '@/src/platform/modules/registry';

export const hrModuleDefinition: MobileModuleDefinition = {
  code: 'hr',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [
    {
      code: 'analytics',
      entryCandidates: [
        ROUTES.advancedTools.trackChanges,
        ROUTES.advancedTools.hangfireDashboard,
      ],
      routePrefixes: [
        ROUTES.advancedTools.trackChanges,
        ROUTES.advancedTools.hangfireDashboard,
      ],
    },
    {
      code: 'basic-data',
      entryCandidates: [ROUTES.basicData.root],
      routePrefixes: [ROUTES.basicData.root, ROUTES.advancedTools.localizationApi],
    },
    {
      code: 'recruitment',
      entryCandidates: [ROUTES.recruitment.root],
      routePrefixes: [ROUTES.recruitment.root],
    },
    {
      code: 'workforce',
      entryCandidates: [ROUTES.workforcePlanning.index, ROUTES.finance.root],
      routePrefixes: [ROUTES.workforcePlanning.index, ROUTES.finance.root],
    },
    {
      code: 'attendance',
      entryCandidates: [],
      routePrefixes: [],
    },
    {
      code: 'administration',
      entryCandidates: [
        ROUTES.administration.root,
        ROUTES.advancedTools.healthCheck,
        ROUTES.advancedTools.apiEndpoints,
        ROUTES.extras.files,
        ROUTES.extras.appointments,
      ],
      routePrefixes: [
        ROUTES.administration.root,
        ROUTES.advancedTools.root,
        ROUTES.extras.root,
      ],
    },
    {
      code: 'collaboration',
      entryCandidates: [],
      routePrefixes: [],
    },
  ],
};