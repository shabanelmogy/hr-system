import {
  accountingModuleDefinition,
  registerAccountingRealtimeResources,
} from "@/modules/accounting";
import { crmModuleDefinition, registerCrmRealtimeResources } from "@/modules/crm";
import { hrModuleDefinition, registerHrRealtimeResources } from "@/modules/hr";
import {
  referenceDataModuleDefinition,
  registerReferenceDataRealtimeResources,
} from "@/modules/reference-data";
import { reportingModuleDefinition } from "@/modules/reporting";
import {
  registerFrontendModule,
  validateFrontendModuleRegistry,
} from "@/platform/modules";

registerFrontendModule(hrModuleDefinition);
registerFrontendModule(accountingModuleDefinition);
registerFrontendModule(crmModuleDefinition);
registerFrontendModule(referenceDataModuleDefinition);
registerFrontendModule(reportingModuleDefinition);
validateFrontendModuleRegistry();
registerHrRealtimeResources();
registerAccountingRealtimeResources();
registerCrmRealtimeResources();
registerReferenceDataRealtimeResources();
