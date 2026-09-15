import dayjs from "dayjs";
import { z } from "zod";
import type { Appointment } from "../types/appointment";

const offsetDateTimeSchema = z.string().refine(
  (value) => dayjs(value).isValid() && /(Z|[+-]\d{2}:\d{2})$/i.test(value),
  "Expected an ISO date-time with a UTC offset",
);

const appointmentSchema = z.object({
  id: z.number().int().positive(),
  start: offsetDateTimeSchema,
  end: offsetDateTimeSchema,
  text: z.string().min(1),
  isAllDay: z.boolean(),
});

export function parseAppointment(value: unknown): Appointment {
  return appointmentSchema.parse(value);
}

export function parseAppointments(value: unknown): Appointment[] {
  return z.array(appointmentSchema).parse(value);
}
