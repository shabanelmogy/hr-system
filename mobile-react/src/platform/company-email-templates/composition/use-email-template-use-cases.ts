import { useMemo } from 'react';
import { connectivityService } from '@/src/core/offline';
import { createEmailTemplateUseCases } from '../application/email-template-use-cases';
import { emailTemplateRemote } from '../data/remote/email-template-remote';
import { OnlineEmailTemplateReader } from '../data/repositories/online-email-template-reader';
export function useEmailTemplateUseCases() {
  return useMemo(() => createEmailTemplateUseCases(new OnlineEmailTemplateReader(emailTemplateRemote,
    () => connectivityService.getSnapshot().isOnline)), []);
}
