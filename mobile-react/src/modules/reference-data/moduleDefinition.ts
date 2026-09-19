import { ROUTES } from '@/src/core/constants/routes';
import type { MobileModuleDefinition } from '@/src/platform/modules/registry';

export const referenceDataModuleDefinition: MobileModuleDefinition = {
  code: 'reference-data',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [
    {
      code: 'geography',
      entryCandidates: [ROUTES.basicData.countries, ROUTES.basicData.states, ROUTES.basicData.districts],
      routePrefixes: [
        ROUTES.basicData.countries,
        ROUTES.basicData.states,
        ROUTES.basicData.districts,
      ],
    },
    {
      code: 'addresses',
      entryCandidates: [ROUTES.basicData.addressTypes],
      routePrefixes: [ROUTES.basicData.addressTypes],
    },
  ],
};
