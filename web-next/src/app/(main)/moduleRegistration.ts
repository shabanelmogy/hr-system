import {
  accountingModuleDefinition,
  registerAccountingRealtimeResources,
} from "@/modules/accounting/registration";
import {
  crmModuleDefinition,
  registerCrmRealtimeResources,
} from "@/modules/crm/registration";
import {
  hrModuleDefinition,
  registerHrRealtimeResources,
} from "@/modules/hr/registration";
import {
  referenceDataModuleDefinition,
  registerReferenceDataRealtimeResources,
} from "@/modules/reference-data/registration";
import { reportingModuleDefinition } from "@/modules/reporting/registration";
import {
  registerFrontendModule,
  validateFrontendModuleRegistry,
} from "@/platform/modules/registration";

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
