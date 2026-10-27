import { z } from 'zod';
import { apiService } from '@/src/core/api';
import type { EmailTemplateReader } from '../../domain/email-template';
import { emailTemplateEndpoints as endpoints } from './email-template-endpoints';

export const emailTemplateSchema = z.object({ id: z.string(), nameEn: z.string(), nameAr: z.string(), language: z.enum(['en', 'ar']),
  subject: z.string(), body: z.string(), isCustomized: z.boolean(), revision: z.number().int().nonnegative(), variables: z.array(z.object({
    token: z.string(), nameEn: z.string(), nameAr: z.string(), sample: z.string(), subjectAllowed: z.boolean(), required: z.boolean(),
  })) });
export const emailTemplatePageSchema = z.object({ items: z.array(emailTemplateSchema), totalCount: z.number().int().nonnegative(), page: z.number().int().positive(), pageSize: z.number().int().positive(), revision: z.number().int().nonnegative() });
export const emailPreviewSchema = z.object({ subject: z.string(), html: z.string(), text: z.string() });

export const emailTemplateRemote: EmailTemplateReader = {
  async list(criteria) { return emailTemplatePageSchema.parse(await apiService.get<unknown>(endpoints.list, { params: { ...criteria } })); },
  async preview(id, language) { return emailPreviewSchema.parse(await apiService.post<unknown, { language: string }>(endpoints.preview(id), { language })); },
};
