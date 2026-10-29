import type { Routes } from '@angular/router';
import { homeLandingGuard } from './home-landing-guard';
export { SHELL_CONTEXT_COMPONENT,SHELL_CONTEXT_FEEDBACK,type ShellContextFeedback } from './context-slot';

export const shellRoutes:Routes=[{path:'',loadComponent:()=>import('./layout/main-shell').then(m=>m.MainShell),children:[
  {path:'home',pathMatch:'full',canActivate:[homeLandingGuard],loadComponent:()=>import('../platform/tenants/public-api').then(m=>m.DashboardPage)},
  {path:'super-admin',loadComponent:()=>import('../platform/tenants/public-api').then(m=>m.DashboardPage)},
  {path:'apps',loadChildren:()=>import('../platform/modules/public-api').then(m=>m.moduleRoutes)},
]}];
