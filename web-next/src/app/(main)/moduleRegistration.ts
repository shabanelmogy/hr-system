import { accountingModuleDefinition } from "@/modules/accounting";
import { hrModuleDefinition, registerHrRealtimeResources } from "@/modules/hr";
import {
  registerFrontendModule,
  validateFrontendModuleRegistry,
} from "@/platform/modules";

registerFrontendModule(hrModuleDefinition);
registerFrontendModule(accountingModuleDefinition);
validateFrontendModuleRegistry();
registerHrRealtimeResources();
