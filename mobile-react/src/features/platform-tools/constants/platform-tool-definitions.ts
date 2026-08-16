import type { AppRoute } from '@/src/core/constants/routes';
import { ROUTES } from '@/src/core/constants/routes';
import type { AppIconName } from '@/src/shared/components';

export type PlatformToolModuleId = 'extras' | 'advancedTools';
export type PlatformToolId =
  | 'files'
  | 'appointments'
  | 'trackChanges'
  | 'localizationApi'
  | 'healthCheck'
  | 'apiEndpoints'
  | 'hangfireDashboard';

export interface PlatformToolDefinition {
  id: PlatformToolId;
  screen: string;
  route: AppRoute;
  titleKey: string;
  descriptionKey: string;
  icon: AppIconName;
}

export interface PlatformToolModuleDefinition {
  id: PlatformToolModuleId;
  rootRoute: AppRoute;
  titleKey: string;
  descriptionKey: string;
  icon: AppIconName;
  tools: readonly PlatformToolDefinition[];
}

export const PLATFORM_TOOL_MODULES: Record<
  PlatformToolModuleId,
  PlatformToolModuleDefinition
> = {
  extras: {
    id: 'extras',
    rootRoute: ROUTES.extras.root,
    titleKey: 'navigation.extras',
    descriptionKey: 'platformTools.extrasDescription',
    icon: 'apps-outline',
    tools: [
      {
        id: 'files',
        screen: 'files',
        route: ROUTES.extras.files,
        titleKey: 'navigation.files',
        descriptionKey: 'platformTools.filesDescription',
        icon: 'folder-open-outline',
      },
      {
        id: 'appointments',
        screen: 'appointments',
        route: ROUTES.extras.appointments,
        titleKey: 'navigation.appointments',
        descriptionKey: 'platformTools.appointmentsDescription',
        icon: 'calendar-outline',
      },
    ],
  },
  advancedTools: {
    id: 'advancedTools',
    rootRoute: ROUTES.advancedTools.root,
    titleKey: 'navigation.advancedTools',
    descriptionKey: 'platformTools.advancedToolsDescription',
    icon: 'construct-outline',
    tools: [
      {
        id: 'trackChanges',
        screen: 'track-changes',
        route: ROUTES.advancedTools.trackChanges,
        titleKey: 'navigation.trackChanges',
        descriptionKey: 'platformTools.trackChangesDescription',
        icon: 'git-commit-outline',
      },
      {
        id: 'localizationApi',
        screen: 'localization-api',
        route: ROUTES.advancedTools.localizationApi,
        titleKey: 'navigation.localizationApi',
        descriptionKey: 'platformTools.localizationApiDescription',
        icon: 'language-outline',
      },
      {
        id: 'healthCheck',
        screen: 'health-check',
        route: ROUTES.advancedTools.healthCheck,
        titleKey: 'navigation.healthCheck',
        descriptionKey: 'platformTools.healthCheckDescription',
        icon: 'pulse-outline',
      },
      {
        id: 'apiEndpoints',
        screen: 'api-endpoints',
        route: ROUTES.advancedTools.apiEndpoints,
        titleKey: 'navigation.apiEndpoints',
        descriptionKey: 'platformTools.apiEndpointsDescription',
        icon: 'code-slash-outline',
      },
      {
        id: 'hangfireDashboard',
        screen: 'hangfire-dashboard',
        route: ROUTES.advancedTools.hangfireDashboard,
        titleKey: 'navigation.hangfireDashboard',
        descriptionKey: 'platformTools.hangfireDashboardDescription',
        icon: 'timer-outline',
      },
    ],
  },
};
