import type { Routes } from '@angular/router';
export { SHELL_ADDITIONAL_NAVIGATION } from './context-slot';
export type { ShellNavigationContribution } from './context-slot';
import { homeLandingGuard } from './home-landing-guard';
export {
  SHELL_CONTEXT_COMPONENT,
  SHELL_APPLICATION_COMPONENT,
  SHELL_CONTEXT_FEEDBACK,
  SHELL_DATA_NAVIGATION,
  type ShellContextFeedback,
  type ShellDataNavigation,
} from './context.public-api';

export const shellRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-shell/main-shell').then((m) => m.MainShell),
    children: [
      {
        path: 'home',
        pathMatch: 'full',
        canActivate: [homeLandingGuard],
        loadComponent: () => import('../platform/tenants/public-api').then((m) => m.DashboardPage),
      },
      {
        path: 'super-admin',
        loadComponent: () => import('../platform/tenants/public-api').then((m) => m.DashboardPage),
      },
      {
        path: 'apps',
        loadChildren: () =>
          import('../platform/modules/routes.public-api').then((m) => m.moduleRoutes),
      },
    ],
  },
];
