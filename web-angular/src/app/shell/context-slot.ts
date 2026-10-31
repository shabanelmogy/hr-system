import { InjectionToken, signal, type Signal, type Type } from '@angular/core';
export interface ShellContextFeedback { readonly title:string; readonly dismiss?:()=>void; }
export const SHELL_CONTEXT_COMPONENT=new InjectionToken<Type<unknown>|null>('shell.context.component',{factory:()=>null});
export const SHELL_APPLICATION_COMPONENT=new InjectionToken<Type<unknown>|null>('shell.application.component',{factory:()=>null});
export const SHELL_CONTEXT_FEEDBACK=new InjectionToken<Signal<ShellContextFeedback|null>>('shell.context.feedback',{factory:()=>signal(null)});
export interface ShellDataNavigation { readonly available:Signal<boolean>; open():void; }
export const SHELL_DATA_NAVIGATION=new InjectionToken<ShellDataNavigation|null>('shell.data.navigation',{factory:()=>null});
