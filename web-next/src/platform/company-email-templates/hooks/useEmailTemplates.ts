import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/SessionContext";
import { getEmailTemplates, previewEmailTemplate, resetEmailTemplate, saveEmailTemplate } from "../services/emailTemplateService";
import type { EmailCriteria, EmailLanguage, EmailWrite } from "../types/emailTemplate";
export function useEmailTemplates(criteria: EmailCriteria, enabled: boolean) {
  const { user } = useSession(); const client = useQueryClient();
  const scope = ["company-email-templates", user?.tenantId, user?.companyId, user?.userId] as const;
  const active = enabled && Boolean(user?.tenantId && user.companyId) && !user?.roles.includes("super_admin");
  const list = useQuery({ queryKey: [...scope, criteria], queryFn: () => getEmailTemplates(criteria), enabled: active });
  const refresh = () => client.invalidateQueries({ queryKey: scope });
  const save = useMutation({ mutationFn: ({ id, request }: { id: string; request: EmailWrite }) => saveEmailTemplate(id, request), onSuccess: refresh });
  const reset = useMutation({ mutationFn: ({ id, language, revision }: { id: string; language: EmailLanguage; revision: number }) => resetEmailTemplate(id, language, revision), onSuccess: refresh });
  const preview = useMutation({ mutationFn: ({ id, language, draft }: { id: string; language: EmailLanguage; draft?: { subject: string; body: string } }) => previewEmailTemplate(id, language, draft) });
  return { list, save, reset, preview };
}
