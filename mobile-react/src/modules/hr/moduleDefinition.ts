import { ROUTES } from '@/src/core/constants/routes';
import type { MobileModuleDefinition } from '@/src/platform/modules/registry';

export const hrModuleDefinition: MobileModuleDefinition = {
  code: 'hr',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [
    {
      code: 'basic-data',
      entryCandidates: [ROUTES.basicData.root],
      routePrefixes: [ROUTES.basicData.organizationalStructure, ROUTES.basicData.organizationalStructureManagement],
    },
    {
      code: 'recruitment',
      entryCandidates: [ROUTES.recruitment.root],
      routePrefixes: [ROUTES.recruitment.root],
    },
    {
      code: 'workforce',
      entryCandidates: [ROUTES.workforcePlanning.index],
      routePrefixes: [ROUTES.workforcePlanning.index],
    },
  ],
};
