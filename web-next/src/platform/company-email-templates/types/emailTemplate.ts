import { z } from "zod";
export const emailTemplateSchema = z.object({ id: z.string(), nameEn: z.string(), nameAr: z.string(), language: z.enum(["en", "ar"]),
  subject: z.string(), body: z.string(), isCustomized: z.boolean(), revision: z.number().int().nonnegative(), variables: z.array(z.object({
    token: z.string(), nameEn: z.string(), nameAr: z.string(), sample: z.string(), subjectAllowed: z.boolean(), required: z.boolean(),
  })) });
export const emailTemplatePageSchema = z.object({ items: z.array(emailTemplateSchema), totalCount: z.number().int().nonnegative(),
  page: z.number().int().positive(), pageSize: z.number().int().positive(), revision: z.number().int().nonnegative() });
export const emailPreviewSchema = z.object({ subject: z.string(), html: z.string(), text: z.string() });
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export type EmailPreview = z.infer<typeof emailPreviewSchema>;
export type EmailLanguage = "en" | "ar";
export interface EmailCriteria { language: EmailLanguage; search: string; status: "all" | "default" | "customized"; page: number; pageSize: number; }
export interface EmailWrite { language: EmailLanguage; subject: string; body: string; expectedRevision: number; }
