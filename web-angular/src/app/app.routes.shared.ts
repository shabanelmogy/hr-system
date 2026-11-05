import type { Routes } from '@angular/router';
import { sessionGuard } from './platform/auth/public-api';
import { publicAuthRoutes } from './platform/auth/routes.public-api';

export const applicationRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  ...publicAuthRoutes,
  { path: '', canActivate: [sessionGuard], loadChildren: () => import('./composition/authenticated-routes').then(module => module.authenticatedRoutes) },
];
