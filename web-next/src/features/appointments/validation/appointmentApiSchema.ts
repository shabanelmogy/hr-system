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
  const record = isRecord(value) ? value : {};

  return appointmentSchema.parse({
    id: record.id ?? record.Id,
    start: record.start ?? record.Start,
    end: record.end ?? record.End,
    text: record.text ?? record.Text,
    isAllDay: record.isAllDay ?? record.IsAllDay,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
