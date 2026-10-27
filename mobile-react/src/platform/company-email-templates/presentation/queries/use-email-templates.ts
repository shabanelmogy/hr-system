import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/platform/auth';
import type { EmailTemplateCriteria } from '../../domain/email-template';
import { useEmailTemplateUseCases } from '../../composition/use-email-template-use-cases';

export function useEmailTemplates(criteria: EmailTemplateCriteria, enabled: boolean, previewId: string | null) {
  const { session } = useAuth(); const cases = useEmailTemplateUseCases();
  const scope = ['company-email-templates', session?.tenantId, session?.companyId, session?.userId] as const;
  const active = enabled && Boolean(session?.tenantId && session?.companyId);
  const list = useQuery({ queryKey: [...scope, 'list', criteria], queryFn: () => cases.list(criteria), enabled: active });
  const preview = useQuery({ queryKey: [...scope, 'preview', previewId, criteria.language], queryFn: () => cases.preview(previewId!, criteria.language), enabled: active && previewId !== null, gcTime: 0 });
  return { list, preview };
}
