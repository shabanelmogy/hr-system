import { accountingModuleDefinition } from '@/src/modules/accounting';
import { hrModuleDefinition } from '@/src/modules/hr';
import {
  registerMobileModule,
  validateMobileModuleRegistry,
} from '@/src/platform/modules/registry';

registerMobileModule(hrModuleDefinition);
registerMobileModule(accountingModuleDefinition);
validateMobileModuleRegistry();