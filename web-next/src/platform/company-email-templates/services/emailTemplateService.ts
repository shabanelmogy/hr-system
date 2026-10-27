import { apiService } from "@/shared/services";
import { version } from "@/config/api/constants";
import { emailPreviewSchema, emailTemplatePageSchema, type EmailCriteria, type EmailLanguage, type EmailWrite } from "../types/emailTemplate";
const endpoint = version + "/company-email-templates";
export async function getEmailTemplates(criteria: EmailCriteria) { return emailTemplatePageSchema.parse(await apiService.get<unknown>(endpoint, { ...criteria })); }
export async function saveEmailTemplate(id: string, request: EmailWrite) { await apiService.put(endpoint + "/" + encodeURIComponent(id), request); }
export async function resetEmailTemplate(id: string, language: EmailLanguage, expectedRevision: number) { await apiService.post(endpoint + "/" + encodeURIComponent(id) + "/reset", { language, expectedRevision }); }
export async function previewEmailTemplate(id: string, language: EmailLanguage, draft?: { subject: string; body: string }) {
  return emailPreviewSchema.parse(await apiService.post<unknown>(endpoint + "/" + encodeURIComponent(id) + "/preview", { language, ...draft }));
}
