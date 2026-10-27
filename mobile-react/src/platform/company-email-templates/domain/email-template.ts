export type EmailLanguage = 'en' | 'ar';
export interface EmailTemplateCriteria { language: EmailLanguage; search: string; status: 'all' | 'default' | 'customized'; page: number; pageSize: number; }
export interface EmailTemplateVariable { token: string; nameEn: string; nameAr: string; sample: string; subjectAllowed: boolean; required: boolean; }
export interface EmailTemplate { id: string; nameEn: string; nameAr: string; language: EmailLanguage; subject: string; body: string; isCustomized: boolean; revision: number; variables: EmailTemplateVariable[]; }
export interface EmailTemplatePage { items: EmailTemplate[]; totalCount: number; page: number; pageSize: number; revision: number; }
export interface EmailPreview { subject: string; html: string; text: string; }
export interface EmailTemplateReader {
  list(criteria: EmailTemplateCriteria): Promise<EmailTemplatePage>;
  preview(id: string, language: EmailLanguage): Promise<EmailPreview>;
}
