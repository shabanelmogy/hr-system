import type { EmailTemplateReader } from '../domain/email-template';
export function createEmailTemplateUseCases(reader: EmailTemplateReader) {
  return { list: reader.list.bind(reader), preview: reader.preview.bind(reader) };
}
