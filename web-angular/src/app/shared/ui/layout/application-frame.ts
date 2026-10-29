import { NgTemplateOutlet } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Drawer } from 'primeng/drawer';
import { ActionButton } from '../buttons/public-api';
import { AppIcon } from '../icons/app-icon';
import { IdentityAvatar } from './identity-avatar';
import { NavigationList, type NavigationEntry } from './navigation-list';
import { ScrollViewport } from './scroll-viewport';

@Component({ selector:'erp-application-frame', imports:[NgTemplateOutlet,RouterLink,Drawer,ActionButton,AppIcon,IdentityAvatar,NavigationList,ScrollViewport],
  templateUrl:'./application-frame.html',styleUrl:'./application-frame.scss',
  host:{'[class.expanded]':'navigationVisible() && desktop() && opened()','[class.compact]':'!desktop()','[class.sidebarless]':'!navigationVisible()','[class.filled]':'fillContent()'},
})
export class ApplicationFrame {
  readonly title=input.required<string>(); readonly name=input.required<string>(); readonly subtitle=input(''); readonly navigationLabel=input.required<string>();
  readonly homePath=input.required<string>();
  readonly openLabel=input.required<string>(); readonly closeLabel=input.required<string>(); readonly searchLabel=input.required<string>();
  readonly entries=input.required<readonly NavigationEntry[]>(); readonly activated=output<string>(); readonly opened=signal(false);
  readonly desktop=toSignal(inject(BreakpointObserver).observe('(min-width:900px)').pipe(map(value=>value.matches)),{initialValue:false});
  readonly rtl=input(false);
  readonly navigationVisible=input(true);
  readonly fillContent=input(false);
  constructor(){effect(()=>{this.desktop();this.navigationVisible();this.opened.set(false);});}
  activate(id:string):void{if(!this.desktop())this.opened.set(false);this.activated.emit(id);}
}
