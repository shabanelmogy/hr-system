import { ROUTES } from '@/src/core/constants/routes';
import type { MobileModuleDefinition } from '@/src/platform/modules/registry';

export const crmModuleDefinition: MobileModuleDefinition = {
  code: 'crm',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [{
    code: 'appointments',
    entryCandidates: [ROUTES.extras.appointments],
    routePrefixes: [ROUTES.extras.appointments],
  }],
};
