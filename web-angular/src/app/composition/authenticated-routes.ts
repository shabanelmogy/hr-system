import { Component, computed, isDevMode } from '@angular/core';
import { RouterOutlet, type Routes } from '@angular/router';
import { unsavedNavigationGuard } from '../shared/data/public-api';
import { FiscalContextControl,FiscalContextState } from '../modules/accounting/fiscal-year-context/public-api';
import { LocalizationRuntime } from '../platform/localization/public-api';
import { ModuleCatalogState, ModuleContextState, ModuleContextControl } from '../platform/modules/public-api';
import { shellRoutes,SHELL_CONTEXT_COMPONENT,SHELL_APPLICATION_COMPONENT,SHELL_CONTEXT_FEEDBACK,type ShellContextFeedback } from '../shell/public-api';
// Component lifetime disposes the shared catalog on public navigation/logout,
// even when Angular retains the lazy route's environment injector.
@Component({imports:[RouterOutlet],template:'<router-outlet />',providers:[FiscalContextState,ModuleCatalogState,ModuleContextState,
 {provide:SHELL_APPLICATION_COMPONENT,useValue:ModuleContextControl},
 {provide:SHELL_CONTEXT_COMPONENT,useValue:FiscalContextControl},
 {provide:SHELL_CONTEXT_FEEDBACK,useFactory:(state:FiscalContextState,locale:LocalizationRuntime,application:ModuleContextState)=>computed<ShellContextFeedback|null>(()=>{
  if(application.navigationFailed())return {title:locale.translate('common.error'),dismiss:()=>application.clearError()};
  if(!state.visible())return null;const error=state.error();
  if(error)return {title:locale.translate(error,'accounting'),dismiss:()=>state.clearError()};
  return ['error','forbidden'].includes(state.state().kind)?{title:locale.translate('fiscalYears.context.loadError','accounting')}:null;
 }),deps:[FiscalContextState,LocalizationRuntime,ModuleContextState]},
]})
export class AuthenticatedApplication {}
const workspaceRoutes:Routes=shellRoutes.map(route=>({...route,children:[...(route.children??[]),...(isDevMode()?[{path:'dev/countries',loadComponent:()=>import('../modules/reference-data/public-api').then(module=>module.CountriesReadPage)}]:[])]}));
export const authenticatedRoutes:Routes=[{path:'',component:AuthenticatedApplication,canDeactivate:[unsavedNavigationGuard],runGuardsAndResolvers:'always',children:workspaceRoutes}];
