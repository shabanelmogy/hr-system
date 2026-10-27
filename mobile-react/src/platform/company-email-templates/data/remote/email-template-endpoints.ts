export const emailTemplateEndpoints = {
  list: 'company-email-templates',
  preview: (id: string) => `company-email-templates/${encodeURIComponent(id)}/preview`,
} as const;
