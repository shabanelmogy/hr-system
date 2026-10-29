import type { Routes } from '@angular/router';
import { sessionGuard } from './platform/auth/public-api';

export const applicationRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', title: 'Login | ERP System', loadComponent: () => import('./platform/auth/pages/login-page').then(module => module.LoginPage) },
  { path: 'forgetPassword', loadComponent: () => import('./platform/auth/pages/password-request-page').then(module => module.PasswordRequestPage) },
  { path: '', canActivate: [sessionGuard], loadChildren: () => import('./composition/authenticated-routes').then(module => module.authenticatedRoutes) },
];
