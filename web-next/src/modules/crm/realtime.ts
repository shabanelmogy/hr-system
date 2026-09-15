import { registerRealtimeQueryKeys } from "@/platform/realtime";
import { appointmentKeys } from "./appointments";

export const crmRealtimeResources = {
  appointments: "appointments",
} as const;

export function registerCrmRealtimeResources() {
  registerRealtimeQueryKeys({
    [crmRealtimeResources.appointments]: [appointmentKeys.all],
  });
}
