import { ModuleContextControl } from '../../platform/modules/controls.public-api';
import {
  globalTemplateManagerGuard,
  globalTemplateManagerAllowed,
  globalReportConsumerAllowed,
  globalReportConsumerGuard,
} from '../../modules/reporting/public-api';
import { AuthSession } from '../../platform/auth/session.public-api';
import { Router } from '@angular/router';
import { Component, computed, isDevMode } from '@angular/core';
import { RouterOutlet, type Routes } from '@angular/router';
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
  imports: [RouterOutlet],
  templateUrl: './authenticated-routes.html',
  providers: [
    {
      provide: SHELL_ADDITIONAL_NAVIGATION,
      useFactory: (
        auth: AuthSession,
        locale: LocalizationRuntime,
        router: Router,
      ): ShellNavigationContribution => {
        void locale.loadNamespace('reporting');
        return {
          entries: computed(() => [
            ...(globalTemplateManagerAllowed(auth.readIdentity())
              ? [
                  {
                    id: 'global-template-manager',
                    label: locale.translate('globalTemplates.title', 'reporting'),
                    icon: 'report' as const,
                  },
                ]
              : []),
            ...(globalReportConsumerAllowed(auth.readIdentity())
              ? [
                  {
                    id: 'global-reports',
                    label: locale.translate('globalTemplates.availableReports', 'reporting'),
                    icon: 'report' as const,
                  },
                ]
              : []),
          ]),
          activate: (id) => {
            if (id === 'global-reports' && globalReportConsumerAllowed(auth.readIdentity())) {
              void router.navigateByUrl('/reports/global');
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
const workspaceRoutes: Routes = shellRoutes.map((route) => ({
  ...route,
  children: [
    ...(route.children ?? []),
    {
      path: 'reports/global',
      canActivate: [globalReportConsumerGuard],
      loadComponent: () =>
        import('../../modules/reporting/public-api').then((module) => module.GlobalReportsPage),
    },
    {
      path: 'administration/global-crystal-reports',
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
