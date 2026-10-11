import { accountingModuleDefinition } from '@/src/modules/accounting';
import { crmModuleDefinition } from '@/src/modules/crm';
import { hrModuleDefinition } from '@/src/modules/hr';
import { platformModuleDefinition } from '@/src/modules/platform';
import { referenceDataModuleDefinition } from '@/src/modules/reference-data';
import {
  registerMobileModule,
  validateMobileModuleRegistry,
} from '@/src/platform/modules/registry';

// Same order as the API module registry: platform foundation, General Data, then business modules.
registerMobileModule(platformModuleDefinition);
registerMobileModule(referenceDataModuleDefinition);
registerMobileModule(accountingModuleDefinition);
registerMobileModule(hrModuleDefinition);
registerMobileModule(crmModuleDefinition);
validateMobileModuleRegistry();
