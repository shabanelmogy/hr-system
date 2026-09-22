import { ROUTES } from '@/src/core/constants/routes';
import type { MobileModuleDefinition } from '@/src/platform/modules/registry';

export const accountingModuleDefinition: MobileModuleDefinition = {
  code: 'acc',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [{
    code: 'fiscal-years',
    entryCandidates: [ROUTES.finance.fiscalYears],
    routePrefixes: [ROUTES.finance.fiscalYears],
  }, {
    code: 'ledger-setup',
    entryCandidates: [ROUTES.finance.currencies],
    routePrefixes: [ROUTES.finance.ledgerSetup],
  }],
};
