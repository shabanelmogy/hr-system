import dayjs from "dayjs";
import { z } from "zod";

export const appointmentValidationSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Title is required")
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be 200 characters or fewer"),
    start: z.string().min(1, "Start and End are required"),
    end: z.string().min(1, "Start and End are required"),
  })
  .superRefine((data, ctx) => {
    const start = dayjs(data.start);
    const end = dayjs(data.end);

    if (!start.isValid() || !end.isValid()) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Start and End are required" });
      return;
    }

    if (!end.isAfter(start)) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "End must be after Start" });
    }

    if (start.startOf("day").isBefore(dayjs().startOf("day"))) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Cannot create in past days" });
    }
  });

export type AppointmentFormData = z.infer<typeof appointmentValidationSchema>;
