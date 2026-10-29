import { computed } from '@angular/core';
import type { Routes } from '@angular/router';
import { FiscalContextControl,FiscalContextState } from '../modules/accounting/fiscal-year-context/public-api';
import { LocalizationRuntime } from '../platform/localization/public-api';
import { shellRoutes,SHELL_CONTEXT_COMPONENT,SHELL_CONTEXT_FEEDBACK,type ShellContextFeedback } from '../shell/public-api';
export const authenticatedRoutes:Routes=[{path:'',providers:[FiscalContextState,
 {provide:SHELL_CONTEXT_COMPONENT,useValue:FiscalContextControl},
 {provide:SHELL_CONTEXT_FEEDBACK,useFactory:(state:FiscalContextState,locale:LocalizationRuntime)=>computed<ShellContextFeedback|null>(()=>{
  if(!state.visible())return null;const error=state.error();
  if(error)return {title:locale.translate(error,'accounting'),dismiss:()=>state.clearError()};
  return ['error','forbidden'].includes(state.state().kind)?{title:locale.translate('fiscalYears.context.loadError','accounting')}:null;
 }),deps:[FiscalContextState,LocalizationRuntime]},
],children:shellRoutes}];
