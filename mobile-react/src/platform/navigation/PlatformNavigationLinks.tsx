import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { asHref, type AppRoute } from '@/src/core/constants/routes';
import { canAccessRoute, isAuthorized, useAuth, type PermissionString } from '@/src/platform/auth';
import { AppButton, AppCard, AppText, type AppIconName } from '@/src/shared/components';

export interface PlatformNavigationLink {
  route: AppRoute;
  titleKey: string;
  icon: AppIconName;
  requiredPermission?: PermissionString;
}

/** Platform navigation composition; shared components retain all visual behavior. */
export function PlatformNavigationLinks({ titleKey, links, onNavigate }: {
  titleKey: string; links: readonly PlatformNavigationLink[]; onNavigate?: () => void;
}) {
  const { session } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const visible = links.filter((link) => canAccessRoute(link.route, session)
    && (!link.requiredPermission || isAuthorized(session, { permissions: [link.requiredPermission] })));
  if (visible.length === 0) return null;
  return <AppCard>
    <AppText variant="titleSmall">{t(titleKey)}</AppText>
    {visible.map((link) => <AppButton key={link.route} variant="ghost" icon={link.icon} onPress={() => {
      onNavigate?.();
      router.push(asHref(link.route));
    }}>{t(link.titleKey)}</AppButton>)}
  </AppCard>;
}
