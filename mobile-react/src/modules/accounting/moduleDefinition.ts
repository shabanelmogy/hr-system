import { ROUTES } from '@/src/core/constants/routes';
import type { MobileModuleDefinition } from '@/src/platform/modules/registry';

export const accountingModuleDefinition: MobileModuleDefinition = {
  code: 'acc',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [
    {
      code: 'ledger-setup',
      entryCandidates: [
        ROUTES.finance.ledgerSetup.root,
        ROUTES.finance.ledgerSetup.fiscalYears,
        ROUTES.finance.ledgerSetup.accountingSettings,
        ROUTES.finance.ledgerSetup.currencies,
        ROUTES.finance.ledgerSetup.accounts,
        ROUTES.finance.ledgerSetup.hierarchyLevels,
        ROUTES.finance.ledgerSetup.dimensions,
        ROUTES.finance.ledgerSetup.books,
        ROUTES.finance.ledgerSetup.journals,
        ROUTES.finance.ledgerSetup.exchangeRates,
        ROUTES.finance.ledgerSetup.accountDetermination,
      ],
      routePrefixes: [ROUTES.finance.ledgerSetup.root],
    },
  ],
};
