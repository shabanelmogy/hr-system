import type { TFunction } from "i18next";
import dayjs from "dayjs";
import { z } from "zod";

export function getAppointmentValidationSchema(
  t: TFunction,
  options: { allowPastStart: boolean },
) {
  return z
    .object({
      text: z
        .string()
        .trim()
        .min(1, t("appointments.validation.titleRequired"))
        .min(3, t("appointments.validation.titleMin"))
        .max(200, t("appointments.validation.titleMax")),
      start: z.string().min(1, t("appointments.validation.startRequired")),
      end: z.string().min(1, t("appointments.validation.endRequired")),
      isAllDay: z.boolean(),
    })
    .superRefine((data, context) => {
      const start = dayjs(data.start);
      const end = dayjs(data.end);

      if (!start.isValid()) {
        context.addIssue({
          code: "custom",
          path: ["start"],
          message: t("appointments.validation.invalidDate"),
        });
      }

      if (!end.isValid()) {
        context.addIssue({
          code: "custom",
          path: ["end"],
          message: t("appointments.validation.invalidDate"),
        });
      }

      if (!start.isValid() || !end.isValid()) return;

      const invalidEnd = data.isAllDay
        ? end.startOf("day").isBefore(start.startOf("day"))
        : !end.isAfter(start);

      if (invalidEnd) {
        context.addIssue({
          code: "custom",
          path: ["end"],
          message: data.isAllDay
            ? t("appointments.validation.allDayEnd")
            : t("appointments.validation.endAfterStart"),
        });
      }

      if (
        !options.allowPastStart &&
        start.startOf("day").isBefore(dayjs().startOf("day"))
      ) {
        context.addIssue({
          code: "custom",
          path: ["start"],
          message: t("appointments.validation.pastStart"),
        });
      }
    });
}
