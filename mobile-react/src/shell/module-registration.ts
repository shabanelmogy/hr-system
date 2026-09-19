import { accountingModuleDefinition } from '@/src/modules/accounting';
import { crmModuleDefinition } from '@/src/modules/crm';
import { hrModuleDefinition } from '@/src/modules/hr';
import { platformModuleDefinition } from '@/src/modules/platform';
import { referenceDataModuleDefinition } from '@/src/modules/reference-data';
import {
  registerMobileModule,
  validateMobileModuleRegistry,
} from '@/src/platform/modules/registry';

registerMobileModule(hrModuleDefinition);
registerMobileModule(accountingModuleDefinition);
registerMobileModule(referenceDataModuleDefinition);
registerMobileModule(platformModuleDefinition);
registerMobileModule(crmModuleDefinition);
validateMobileModuleRegistry();
