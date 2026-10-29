import { Component, computed, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionButton } from '../buttons/public-api';
import { TextField } from '../forms/public-api';
import { AppIcon, type AppIconName } from '../icons/app-icon';

export interface NavigationEntry { readonly id:string; readonly label:string; readonly icon:AppIconName; readonly selected?:boolean; }
@Component({ selector:'erp-navigation-list', imports:[ActionButton,AppIcon,ReactiveFormsModule,TextField], template:`
  @if(expanded()){<div class="navigation-search"><erp-text-field [formControl]="search" [label]="searchLabel()" labelVisibility="sr-only" [placeholder]="searchLabel()" /></div>}
  <nav [attr.aria-label]="label()">@for(item of filtered();track item.id){
    <erp-button [label]="item.label" [appearance]="expanded() ? 'quiet' : 'icon'" variant="text" [fullWidth]="expanded()"
      [title]="item.label" [pressed]="item.selected ?? false" (activated)="selected.emit(item.id)"><erp-icon buttonIcon [name]="item.icon" /></erp-button>
  }</nav>`, styles:`
    :host{display:block;min-width:0}.navigation-search{padding:16px 8px 8px;--touch-target:36px}.navigation-search erp-text-field{font-size:13px}
    nav{display:flex;flex-direction:column;gap:4px;padding:8px}.navigation-search+nav{padding-top:4px}erp-button{--action-radius:8px;--action-font-size:14px;--action-min-height:44px;--action-quiet-background:transparent;--action-border-width:0px;--action-padding-x:12px;color:var(--foreground)}
  ` })
export class NavigationList {
  readonly entries=input.required<readonly NavigationEntry[]>(); readonly expanded=input(false); readonly label=input.required<string>(); readonly searchLabel=input.required<string>();
  readonly selected=output<string>(); readonly search=new FormControl('',{nonNullable:true});
  private readonly query=toSignal(this.search.valueChanges,{initialValue:''});
  readonly filtered=computed(()=>{const q=this.query().trim().toLocaleLowerCase();return this.entries().filter(item=>item.label.toLocaleLowerCase().includes(q));});
}
