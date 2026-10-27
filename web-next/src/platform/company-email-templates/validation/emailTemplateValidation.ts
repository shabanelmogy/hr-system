import { z } from "zod";
export const emailTemplateFormSchema = (messages: { subject: string; body: string; action: string }) => z.object({
  subject: z.string().trim().min(1, messages.subject).max(200, messages.subject).refine(value => !/[\r\n]/.test(value), messages.subject),
  body: z.string().min(1, messages.body).max(50000, messages.body).refine(value => value.split("{ACTION_URL}").length === 2, messages.action),
});
export type EmailTemplateFormValues = z.infer<ReturnType<typeof emailTemplateFormSchema>>;
