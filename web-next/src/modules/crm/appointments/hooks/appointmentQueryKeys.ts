import type { AppointmentRange } from "../types/appointment";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (range: AppointmentRange) => [...appointmentKeys.all, "list", range] as const,
};
