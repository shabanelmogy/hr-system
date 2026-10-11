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
import { replaceFrontendModuleRegistry } from "@/platform/modules/registration";

// Same order as the API module registry: General Data first, reporting last.
replaceFrontendModuleRegistry([
  referenceDataModuleDefinition,
  accountingModuleDefinition,
  hrModuleDefinition,
  crmModuleDefinition,
  reportingModuleDefinition,
]);
registerReferenceDataRealtimeResources();
registerAccountingRealtimeResources();
registerHrRealtimeResources();
registerCrmRealtimeResources();
