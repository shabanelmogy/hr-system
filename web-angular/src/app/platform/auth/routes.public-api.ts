import type { Routes } from '@angular/router';

export const publicAuthRoutes: Routes = [
  { path: 'login', title: 'Login | ERP System', loadComponent: () => import('./pages/login-page').then(module => module.LoginPage) },
  { path: 'forgetPassword', loadComponent: () => import('./pages/password-request-page').then(module => module.PasswordRequestPage) },
];
