import { ModuleContextControl } from '../../platform/modules/controls.public-api';
import { groupAdministrationNavigation } from './administration-navigation';
import {
  languageTranslationGuard,
  translationAllowed,
} from '../../platform/language-translation/policy.public-api';
import { tenantAdministrationEntries } from './tenant-navigation';
import { TabularFileService } from '../../modules/reporting/collection-export/export.public-api';
import { TABULAR_FILE_WRITER } from '../../shared/data/public-api';
import {
  errorLogSettingsGuard,
  systemErrorLogsAllowed,
  systemErrorLogsGuard,
} from '../../platform/system-error-logs/policy.public-api';
import {
  systemAuditAllowed,
  systemAuditGuard,
} from '../../platform/system-audit/policy.public-api';
import { tenantAdminsGuard } from '../../platform/tenant-admins/policy.public-api';
import {
  tenantReadAllowed,
  tenantRouteGuard,
  tenantCreateRouteGuard,
} from '../../platform/tenants/management/policy.public-api';
import { globalCountryReadAllowed, globalGeographyEntries } from './global-geography-navigation';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import {
  districtReadAllowed,
  districtRouteGuard,
} from '../../modules/reference-data/geographical-information/districts/policy.public-api';
import {
  stateReadAllowed,
  stateRouteGuard,
} from '../../modules/reference-data/geographical-information/states/policy.public-api';
import {
  globalTemplateManagerGuard,
  globalTemplateManagerAllowed,
  globalReportConsumerGuard,
  GlobalReportView,
  globalReportAllowed,
} from '../../modules/reporting/public-api';
import { SYSTEM_ERROR_LOG_REPORT } from '../../platform/system-error-logs/public-api';
import { AuthSession } from '../../platform/auth/session.public-api';
import { Router } from '@angular/router';
import { Component, computed, inject, isDevMode } from '@angular/core';
import { RouterOutlet, type CanActivateFn, type Routes } from '@angular/router';
import { unsavedNavigationGuard } from '../../shared/data/public-api';
import {
  FiscalContextControl,
  FiscalContextState,
} from '../../modules/accounting/fiscal-year-context/public-api';
import { LocalizationRuntime } from '../../platform/localization/public-api';
import { ModuleCatalogState, ModuleContextState } from '../../platform/modules/public-api';
import {
  shellRoutes,
  SHELL_CONTEXT_COMPONENT,
  SHELL_APPLICATION_COMPONENT,
  SHELL_CONTEXT_FEEDBACK,
  type ShellContextFeedback,
  SHELL_ADDITIONAL_NAVIGATION,
  type ShellNavigationContribution,
} from '../../shell/public-api';
// Component lifetime disposes the shared catalog on public navigation/logout,
// even when Angular retains the lazy route's environment injector.
@Component({
  selector: 'erp-authenticated-application',
  imports: [RouterOutlet],
  templateUrl: './authenticated-routes.html',
  providers: [
    { provide: TABULAR_FILE_WRITER, useExisting: TabularFileService },
    {
      provide: SHELL_ADDITIONAL_NAVIGATION,
      useFactory: (
        auth: AuthSession,
        locale: LocalizationRuntime,
        router: Router,
      ): ShellNavigationContribution => {
        void locale.loadNamespace('reporting');
        void locale.loadNamespace('platform-advanced-tools');
        const currentPath = toSignal(
          router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map((event) => event.urlAfterRedirects.split('?')[0] ?? ''),
          ),
          { initialValue: router.url.split('?')[0] ?? '' },
        );
        return {
          dataEntries: computed(() => [
            ...globalGeographyEntries(
              auth.readIdentity(),
              (key) => locale.translate(key),
              currentPath(),
              isDevMode(),
            ),
            ...tenantAdministrationEntries(
              auth.readIdentity(),
              (key) => locale.translate(key),
              currentPath(),
            ),
          ]),
          entries: computed(() =>
            groupAdministrationNavigation(
              [
                ...(systemErrorLogsAllowed(auth.readIdentity())
                  ? [
                      {
                        id: 'system-error-logs',
                        label: locale.translate('menu.systemErrorLogs'),
                        icon: 'assessment' as const,
                        selected: currentPath() === '/super-admin/error-logs',
                      },
                    ]
                  : []),
                {
                  id: 'settings',
                  label: locale.translate('menu.settings'),
                  icon: 'settings' as const,
                  selected: currentPath() === '/administration/settings',
                },
                ...(translationAllowed(auth.readIdentity())
                  ? [
                      {
                        id: 'language-translation',
                        label: locale.translate('menu.languageTranslation'),
                        icon: 'language' as const,
                        selected: currentPath() === '/administration/language-translation',
                      },
                    ]
                  : []),
                ...(systemAuditAllowed(auth.readIdentity())
                  ? [
                      {
                        id: 'system-audit',
                        label: locale.translate('menu.auditTrail'),
                        icon: 'history' as const,
                        selected: currentPath() === '/super-admin/audit-trail',
                      },
                    ]
                  : []),
                ...(auth.readIdentity()?.permissions.includes('SystemHealth:View')
                  ? [
                      {
                        id: 'system-health',
                        label: locale.translate('menu.healthCheck'),
                        icon: 'assessment' as const,
                        selected: currentPath() === '/advanced-tools/health-check',
                      },
                    ]
                  : []),
                ...(auth.readIdentity()?.permissions.includes('SystemApiDocs:View')
                  ? [
                      {
                        id: 'system-api-docs',
                        label: locale.translate('menu.apiEndpoints'),
                        icon: 'openInNew' as const,
                        selected: currentPath() === '/advanced-tools/api-endpoints',
                      },
                    ]
                  : []),
                ...(auth.readIdentity()?.permissions.includes('Hangfire:View')
                  ? [
                      {
                        id: 'hangfire-dashboard',
                        label: locale.translate('menu.hangfireDashboard'),
                        icon: 'history' as const,
                        selected: currentPath() === '/advanced-tools/hangfire-dashboard',
                      },
                    ]
                  : []),
                ...(globalTemplateManagerAllowed(auth.readIdentity())
                  ? [
                      {
                        id: 'global-template-manager',
                        label: locale.translate('globalTemplates.title', 'reporting'),
                        icon: 'report' as const,
                      },
                    ]
                  : []),
              ],
              locale.translate('menu.administration'),
            ),
          ),
          activate: (id) => {
            if (id === 'system-error-logs' && systemErrorLogsAllowed(auth.readIdentity())) {
              void router.navigateByUrl('/super-admin/error-logs');
              return true;
            }
            if (id === 'settings') {
              void router.navigateByUrl('/administration/settings');
              return true;
            }
            if (id === 'language-translation' && translationAllowed(auth.readIdentity())) {
              void router.navigateByUrl('/administration/language-translation');
              return true;
            }
            if (id === 'system-audit' && systemAuditAllowed(auth.readIdentity())) {
              void router.navigateByUrl('/super-admin/audit-trail');
              return true;
            }
            if (id === 'system-health') {
              void router.navigateByUrl('/advanced-tools/health-check');
              return true;
            }
            if (id === 'system-api-docs') {
              void router.navigateByUrl('/advanced-tools/api-endpoints');
              return true;
            }
            if (id === 'hangfire-dashboard') {
              void router.navigateByUrl('/advanced-tools/hangfire-dashboard');
              return true;
            }
            if (id === 'tenants' && tenantReadAllowed(auth.readIdentity())) {
              void router.navigateByUrl('/super-admin/tenants');
              return true;
            }
            if (id === 'countries' && globalCountryReadAllowed(auth.readIdentity(), isDevMode())) {
              void router.navigateByUrl('/dev/countries');
              return true;
            }
            if (id === 'districts' && districtReadAllowed(auth.readIdentity())) {
              void router.navigateByUrl('/super-admin/geography/districts');
              return true;
            }
            if (id === 'states' && stateReadAllowed(auth.readIdentity())) {
              void router.navigateByUrl('/super-admin/geography/states');
              return true;
            }
            if (
              id !== 'global-template-manager' ||
              !globalTemplateManagerAllowed(auth.readIdentity())
            )
              return false;
            void router.navigateByUrl('/administration/global-crystal-reports');
            return true;
          },
        };
      },
      deps: [AuthSession, LocalizationRuntime, Router],
    },
    FiscalContextState,
    ModuleCatalogState,
    ModuleContextState,
    { provide: SHELL_APPLICATION_COMPONENT, useValue: ModuleContextControl },
    { provide: SHELL_CONTEXT_COMPONENT, useValue: FiscalContextControl },
    {
      provide: SHELL_CONTEXT_FEEDBACK,
      useFactory: (
        state: FiscalContextState,
        locale: LocalizationRuntime,
        application: ModuleContextState,
      ) =>
        computed<ShellContextFeedback | null>(() => {
          if (application.navigationFailed())
            return {
              title: locale.translate('common.error'),
              dismiss: () => application.clearError(),
            };
          if (!state.visible()) return null;
          const error = state.error();
          if (error)
            return {
              title: locale.translate(error, 'accounting'),
              dismiss: () => state.clearError(),
            };
          return ['error', 'forbidden'].includes(state.state().kind)
            ? { title: locale.translate('fiscalYears.context.loadError', 'accounting') }
            : null;
        }),
      deps: [FiscalContextState, LocalizationRuntime, ModuleContextState],
    },
  ],
})
export class AuthenticatedApplication {}
const permissionGuard =
  (permission: string): CanActivateFn =>
  () =>
    inject(AuthSession).readIdentity()?.permissions.includes(permission) ?? false;

const workspaceRoutes: Routes = shellRoutes.map((route) => ({
  ...route,
  children: [
    ...(route.children ?? []),
    {
      path: 'profile',
      canDeactivate: [unsavedNavigationGuard],
      data: { workspaceLayout: 'fill' },
      loadComponent: () =>
        import('../../platform/account-profile/public-api').then(
          (module) => module.AccountProfilePage,
        ),
    },
    {
      path: 'change-password',
      canDeactivate: [unsavedNavigationGuard],
      data: { workspaceLayout: 'fill', accountTab: 'password' },
      loadComponent: () =>
        import('../../platform/account-profile/public-api').then(
          (module) => module.AccountProfilePage,
        ),
    },
    {
      path: 'advanced-tools/health-check',
      canActivate: [permissionGuard('SystemHealth:View')],
      data: { workspaceLayout: 'fill', toolKind: 'health' },
      loadComponent: () =>
        import('../../platform/advanced-tools/public-api').then(
          (module) => module.AdvancedToolPage,
        ),
    },
    {
      path: 'advanced-tools/api-endpoints',
      canActivate: [permissionGuard('SystemApiDocs:View')],
      data: { workspaceLayout: 'fill', toolKind: 'swagger' },
      loadComponent: () =>
        import('../../platform/advanced-tools/public-api').then(
          (module) => module.AdvancedToolPage,
        ),
    },
    {
      path: 'advanced-tools/hangfire-dashboard',
      canActivate: [permissionGuard('Hangfire:View')],
      data: { workspaceLayout: 'fill', toolKind: 'hangfire' },
      loadComponent: () =>
        import('../../platform/advanced-tools/public-api').then(
          (module) => module.AdvancedToolPage,
        ),
    },
    {
      path: 'administration/settings',
      data: { workspaceLayout: 'fill' },
      loadComponent: () =>
        import('../../platform/settings/public-api').then((module) => module.SettingsPage),
    },
    {
      path: 'super-admin/ui-texts',
      pathMatch: 'full',
      redirectTo: '/administration/language-translation',
    },
    {
      path: 'administration/language-translation',
      data: { workspaceLayout: 'fill' },
      canActivate: [languageTranslationGuard],
      loadComponent: () =>
        import('../../platform/language-translation/public-api').then(
          (module) => module.LanguageTranslationPage,
        ),
    },
    {
      path: 'super-admin/error-logs',
      providers: [
        {
          provide: SYSTEM_ERROR_LOG_REPORT,
          useValue: {
            component: GlobalReportView,
            headerActions: (component: unknown) =>
              component instanceof GlobalReportView ? component.headerActions() : null,
            allowed: (actor: ReturnType<AuthSession['readIdentity']>) =>
              globalReportAllowed(actor, 'system-error-logs'),
          },
        },
      ],
      data: { workspaceLayout: 'fill' },
      canActivate: [systemErrorLogsGuard],
      loadComponent: () =>
        import('../../platform/system-error-logs/public-api').then(
          (module) => module.SystemErrorLogsPage,
        ),
    },
    {
      path: 'super-admin/error-log-settings',
      data: { workspaceLayout: 'fill' },
      canActivate: [errorLogSettingsGuard],
      canDeactivate: [unsavedNavigationGuard],
      loadComponent: () =>
        import('../../platform/system-error-logs/public-api').then(
          (module) => module.ErrorLogSettingsPage,
        ),
    },
    {
      path: 'super-admin/tenant-admins',
      data: { workspaceLayout: 'fill' },
      canActivate: [tenantAdminsGuard],
      canDeactivate: [unsavedNavigationGuard],
      loadComponent: () =>
        import('../../platform/tenant-admins/public-api').then((module) => module.TenantAdminsPage),
    },
    {
      path: 'super-admin/tenants/administrators',
      pathMatch: 'full',
      redirectTo: 'super-admin/tenant-admins',
    },
    {
      path: 'super-admin/tenants/new',
      data: { workspaceLayout: 'fill', workspaceDensity: 'compact' },
      canActivate: [tenantCreateRouteGuard],
      canDeactivate: [unsavedNavigationGuard],
      loadComponent: () =>
        import('../../platform/tenants/management/public-api').then(
          (module) => module.TenantEditorPage,
        ),
    },
    {
      path: 'super-admin/tenants/:id/edit',
      data: { workspaceLayout: 'fill', workspaceDensity: 'compact' },
      canActivate: [tenantCreateRouteGuard],
      canDeactivate: [unsavedNavigationGuard],
      loadComponent: () =>
        import('../../platform/tenants/management/public-api').then(
          (module) => module.TenantEditorPage,
        ),
    },
    {
      path: 'super-admin/tenants',
      data: { workspaceLayout: 'fill' },
      canActivate: [tenantRouteGuard],
      canDeactivate: [unsavedNavigationGuard],
      loadComponent: () =>
        import('../../platform/tenants/management/public-api').then(
          (module) => module.TenantManagementPage,
        ),
    },
    {
      path: 'super-admin/audit-trail',
      data: { workspaceLayout: 'fill' },
      canActivate: [systemAuditGuard],
      loadComponent: () =>
        import('../../platform/system-audit/public-api').then((module) => module.SystemAuditPage),
    },
    {
      path: 'super-admin/geography/districts',
      data: { workspaceLayout: 'fill' },
      canActivate: [districtRouteGuard],
      loadComponent: () =>
        import('../../modules/reference-data/geographical-information/districts/public-api').then(
          (module) => module.DistrictsPage,
        ),
    },
    {
      path: 'reports/global',
      data: { workspaceLayout: 'fill' },
      canActivate: [globalReportConsumerGuard],
      loadComponent: () =>
        import('../../modules/reporting/public-api').then((module) => module.GlobalReportsPage),
    },
    {
      path: 'super-admin/geography/states',
      data: { workspaceLayout: 'fill' },
      canActivate: [stateRouteGuard],
      loadComponent: () =>
        import('../../modules/reference-data/geographical-information/states/public-api').then(
          (module) => module.StatesPage,
        ),
    },
    {
      path: 'administration/global-crystal-reports',
      data: { workspaceLayout: 'fill' },
      canActivate: [globalTemplateManagerGuard],
      loadComponent: () =>
        import('../../modules/reporting/public-api').then((module) => module.GlobalTemplateManager),
    },
    ...(isDevMode()
      ? [
          {
            path: 'dev/countries',
            loadComponent: () =>
              import('../../modules/reference-data/public-api').then(
                (module) => module.CountriesReadPage,
              ),
          },
        ]
      : []),
  ],
}));
export const authenticatedRoutes: Routes = [
  {
    path: '',
    component: AuthenticatedApplication,
    canDeactivate: [unsavedNavigationGuard],
    runGuardsAndResolvers: 'always',
    children: workspaceRoutes,
  },
];
