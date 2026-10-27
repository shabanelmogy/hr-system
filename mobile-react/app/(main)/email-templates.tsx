import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { EmailTemplatesScreen } from '@/src/platform/company-email-templates';
export default function Page() { return <RouteGuard path={ROUTES.emailTemplates}><EmailTemplatesScreen /></RouteGuard>; }
