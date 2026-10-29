import type { Routes } from '@angular/router';
export { tenantWorkspaceAllowed } from './presentation/module-access';
export { ModuleCatalogState } from './state/module-catalog-state';
export { ModuleContextState } from './state/module-context-state';
export { ModuleContextControl } from './components/module-context-control';

export const moduleRoutes: Routes = [{ path: '', loadComponent: () => import('./pages/module-workspace').then(m => m.ModuleWorkspace), children: [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/module-browser').then(m => m.ModuleBrowser) },
  { path: ':moduleCode', loadComponent: () => import('./pages/module-browser').then(m => m.ModuleBrowser) },
  { path: ':moduleCode/:submoduleCode', loadComponent: () => import('./pages/module-browser').then(m => m.ModuleBrowser) },
] }];
