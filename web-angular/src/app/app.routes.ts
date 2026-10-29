import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';
import { applicationRoutes } from './app.routes.shared';

export const routes: Routes = [...applicationRoutes, ...(isDevMode() ? [{
  path: 'dev/theme', loadComponent: () => import('./dev/theme-preview').then(module => module.ThemePreview),
}, {
  path: 'dev/forms', loadComponent: () => import('./dev/form-preview').then(module => module.FormPreview),
}] : []), { path: '**', redirectTo: 'login' }];
