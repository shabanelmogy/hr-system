import { z } from "zod";

// Function to generate the schema with translations
const getPersonalDetailsSchema = (t: (key: string, options?: any) => string) =>
  z.object({
    id: z.string().nullable().optional(),
    firstName: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLengthError", { count: 3 }))
      .max(50, t("validation.maxLengthError", { count: 50 })),
    lastName: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLengthError", { count: 3 }))
      .max(50, t("validation.maxLengthError", { count: 50 })),
    userName: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLengthError", { count: 3 }))
      .max(50, t("validation.maxLengthError", { count: 50 })),
  });

export default getPersonalDetailsSchema;
