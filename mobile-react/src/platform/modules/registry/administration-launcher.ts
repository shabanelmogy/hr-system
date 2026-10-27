import { ROUTES } from '@/src/core/constants/routes';
import { permissions } from '@/src/platform/auth/rbac';
import type { ErpModule } from '../domain/models/module';

export const administrationLauncherEntries = [
  { route: ROUTES.emailTemplates, titleKey: 'navigation.emailTemplates', icon: 'mail-outline', requiredPermission: permissions.ViewCompanyEmailTemplates },
  { route: ROUTES.settings, titleKey: 'navigation.settings', icon: 'settings-outline' },
  { route: ROUTES.administration.root, titleKey: 'navigation.users', icon: 'people-outline', requiredPermission: permissions.ViewUsers },
  { route: ROUTES.administration.roles, titleKey: 'navigation.roles', icon: 'shield-checkmark-outline' },
  { route: ROUTES.administration.invitations, titleKey: 'navigation.invitations', icon: 'mail-outline' },
  { route: ROUTES.systemAuditTrail, titleKey: 'navigation.auditTrail', icon: 'time-outline' },
  { route: ROUTES.systemErrorLogs, titleKey: 'navigation.systemErrorLogs', icon: 'alert-circle-outline' },
  { route: ROUTES.advancedTools.errorLogs, titleKey: 'navigation.errorLogs', icon: 'alert-circle-outline' },
  { route: ROUTES.advancedTools.auditTrail, titleKey: 'navigation.auditTrail', icon: 'time-outline' },
  { route: ROUTES.advancedTools.healthCheck, titleKey: 'navigation.healthCheck', icon: 'pulse-outline' },
  { route: ROUTES.advancedTools.apiEndpoints, titleKey: 'navigation.apiEndpoints', icon: 'code-slash-outline' },
  { route: ROUTES.advancedTools.hangfireDashboard, titleKey: 'navigation.hangfireDashboard', icon: 'timer-outline' },
] as const;


/** Session-local UI grouping, separate from installed/purchased module catalogs. */
export function getAdministrationModule(
  canAccessPath: (path: string) => boolean,
  hasPermission: (permission: string) => boolean,
  translate: (key: string) => string,
): ErpModule | null {
  const submodules = administrationLauncherEntries.flatMap(item =>
    canAccessPath(item.route) && (!('requiredPermission' in item) || hasPermission(item.requiredPermission)) ? [{
      code: item.route.replace(/^\//, '').replaceAll('/', '-'),
      name: translate(item.titleKey),
      requiredPermissions: [],
      entryPath: item.route,
    }] : []);
  return submodules.length ? { code: 'administration', name: translate('navigation.administration'), submodules, isDefault: true } : null;
}
