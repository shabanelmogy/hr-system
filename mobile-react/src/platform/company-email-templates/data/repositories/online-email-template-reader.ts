import type { EmailLanguage, EmailTemplateCriteria, EmailTemplateReader } from '../../domain/email-template';
export class OnlineEmailTemplateReader implements EmailTemplateReader {
  constructor(private readonly remote: EmailTemplateReader, private readonly isOnline: () => boolean) {}
  private ensureOnline() { if (!this.isOnline()) throw new Error('Email template preview requires an internet connection.'); }
  list(criteria: EmailTemplateCriteria) { this.ensureOnline(); return this.remote.list(criteria); }
  preview(id: string, language: EmailLanguage) { this.ensureOnline(); return this.remote.preview(id, language); }
}
