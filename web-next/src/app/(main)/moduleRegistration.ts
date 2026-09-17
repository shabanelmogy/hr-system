import { accountingModuleDefinition } from "@/modules/accounting/moduleDefinition";
import { registerAccountingRealtimeResources } from "@/modules/accounting/realtime";
import { crmModuleDefinition } from "@/modules/crm/moduleDefinition";
import { registerCrmRealtimeResources } from "@/modules/crm/realtime";
import { hrModuleDefinition } from "@/modules/hr/moduleDefinition";
import { registerHrRealtimeResources } from "@/modules/hr/realtime";
import { referenceDataModuleDefinition } from "@/modules/reference-data/moduleDefinition";
import { registerReferenceDataRealtimeResources } from "@/modules/reference-data/realtime";
import { reportingModuleDefinition } from "@/modules/reporting/moduleDefinition";
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
