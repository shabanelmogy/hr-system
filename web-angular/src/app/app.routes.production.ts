import type { Routes } from '@angular/router';
import { applicationRoutes } from './app.routes.shared';

// Production routes are registered by their accepted feature contracts.
export const routes: Routes = [...applicationRoutes, { path: '**', redirectTo: 'login' }];
