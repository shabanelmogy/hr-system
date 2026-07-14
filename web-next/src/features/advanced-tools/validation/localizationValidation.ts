import { z } from "zod";

export const localizationEntrySchema = z.object({
  Language: z.string().trim().min(1, "Language is required"),
  key: z.string().trim().min(1, "Localization key is required"),
  value: z.string().trim().min(1, "Localization value is required"),
});
