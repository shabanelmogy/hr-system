import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';
import { applicationRoutes } from './app.routes.shared';
import { unsavedNavigationGuard } from './shared/data/public-api';
import { sessionGuard } from './platform/auth/public-api';
import { CriteriaPreviewGate,criteriaPreviewGuard } from './dev/criteria-preview-gate';

export const routes: Routes = [...applicationRoutes, ...(isDevMode() ? [{
  path: 'dev/theme', loadComponent: () => import('./dev/theme-preview').then(module => module.ThemePreview),
}, {
  path: 'dev/forms', loadComponent: () => import('./dev/form-preview').then(module => module.FormPreview),
}, {
  path: 'dev/collections', loadComponent: () => import('./dev/collection-preview').then(module => module.CollectionPreview),
}, {
  path:'dev/grid-capabilities',loadComponent:()=>import('./dev/grid-capabilities-preview').then(module=>module.GridCapabilitiesPreview),
}, {
  path: 'dev/references', loadComponent: () => import('./dev/reference-preview').then(module => module.ReferencePreview),
}, {
  path: 'dev/dates', loadComponent: () => import('./dev/date-preview').then(module => module.DatePreview),
}, {
  path: 'dev/numbers', loadComponent: () => import('./dev/numeric-preview').then(module => module.NumericPreview),
}, {
  path: 'dev/booleans', loadComponent: () => import('./dev/boolean-preview').then(module => module.BooleanPreview),
}, {
  path: 'dev/multiline', loadComponent: () => import('./dev/multiline-preview').then(module => module.MultilinePreview),
}, {
  path:'dev/criteria',providers:[CriteriaPreviewGate],canActivate:[criteriaPreviewGuard],runGuardsAndResolvers:'always' as const,loadComponent:()=>import('./dev/criteria-preview').then(module=>module.CriteriaPreview),children:[{path:'editor/:record',loadComponent:()=>import('./dev/criteria-preview').then(module=>module.CriteriaPreviewEditor)}],
}, {
  path:'dev/reads',loadComponent:()=>import('./dev/read-preview').then(module=>module.ReadPreview),
}, {
  path:'dev/reads-away',loadComponent:()=>import('./dev/read-preview').then(module=>module.ReadPreviewAway),
}, {
  path:'dev/reports',canActivate:[sessionGuard],loadComponent:()=>import('./modules/reporting/public-api').then(module=>module.GlobalReportView),
}, {
  path: 'dev/form-close', loadComponent: () => import('./dev/form-close-preview').then(module => module.FormClosePreview),
}, {
  path: 'dev/unsaved', loadComponent: () => import('./dev/unsaved-preview').then(module => module.UnsavedPreviewFrame),
  canDeactivate: [unsavedNavigationGuard], runGuardsAndResolvers: 'always' as const,
  children: [{ path: ':record', loadComponent: () => import('./dev/unsaved-preview').then(module => module.UnsavedPreview) }],
}, {
  path: 'dev/unsaved-destination', loadComponent: () => import('./dev/unsaved-preview').then(module => module.UnsavedDestination),
}, {
  path: 'dev/unsaved-denied', canActivate: [() => false], loadComponent: () => import('./dev/unsaved-preview').then(module => module.UnsavedDestination),
}, {
  path: 'dev/unsaved-context', canActivate:[sessionGuard], loadComponent: () => import('./dev/unsaved-context-preview').then(module => module.UnsavedContextPreview),
}] : []), { path: '**', redirectTo: 'login' }];
