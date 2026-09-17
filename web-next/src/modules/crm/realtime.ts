import { registerRealtimeQueryKeys } from "@/platform/realtime/registry";
import { appointmentKeys } from "./appointments/hooks/appointmentQueryKeys";

export const crmRealtimeResources = {
  appointments: "appointments",
} as const;

export function registerCrmRealtimeResources() {
  registerRealtimeQueryKeys({
    [crmRealtimeResources.appointments]: [appointmentKeys.all],
  });
}
