import { Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionButton } from '../buttons/public-api';
import { TextField } from '../forms/public-api';
import { AppIcon, type AppIconName } from '../icons/app-icon';

export interface NavigationEntry { readonly id:string; readonly label:string; readonly icon:AppIconName; readonly selected?:boolean; readonly children?:readonly NavigationEntry[]; }
export function filterNavigationEntries(entries:readonly NavigationEntry[],query:string):readonly NavigationEntry[]{
 const text=query.trim().toLocaleLowerCase();if(!text)return entries;
 return entries.flatMap(entry=>{if(entry.label.toLocaleLowerCase().includes(text))return [entry];const children=entry.children?filterNavigationEntries(entry.children,text):[];return children.length?[{...entry,children}]:[];});
}
@Component({ selector:'erp-navigation-list', imports:[forwardRef(()=>NavigationList),ActionButton,AppIcon,ReactiveFormsModule,TextField], template:`
  @if(expanded()&&searchable()){<div class="navigation-search"><erp-text-field [formControl]="search" [label]="searchLabel()" labelVisibility="sr-only" [placeholder]="searchLabel()" /></div>}
  <nav [attr.aria-label]="label()">@for(item of filtered();track item.id){
    <erp-button [label]="item.label" [appearance]="expanded() ? 'quiet' : 'icon'" variant="text" [fullWidth]="expanded()"
      [title]="item.label" [pressed]="item.selected ?? false" [expanded]="item.children?.length?branchOpen(item.id):null" [controls]="item.children?.length?branchId(item.id):null" (activated)="activate(item)"><erp-icon buttonIcon [name]="item.icon" /></erp-button>
    @if(item.children?.length&&expanded()&&branchOpen(item.id)){
      <div class="navigation-children" [id]="branchId(item.id)"><erp-navigation-list [entries]="item.children!" [expanded]="true" [searchable]="false" [expandedEntries]="childExpandedEntries()" [label]="item.label" [searchLabel]="searchLabel()" (selected)="selected.emit($event)" /></div>
    }
  }</nav>`, styles:`
    :host{display:block;min-width:0}.navigation-search{padding:16px 8px 8px;--touch-target:36px}.navigation-search erp-text-field{font-size:13px}
    nav{display:flex;flex-direction:column;gap:4px;padding:8px}.navigation-search+nav{padding-top:4px}erp-button{--action-radius:8px;--action-font-size:14px;--action-min-height:44px;--action-quiet-background:transparent;--action-border-width:0px;--action-padding-x:12px;color:var(--foreground)}.navigation-children{margin-inline-start:8px;border-inline-start:1px solid var(--border);min-width:0}
  ` })
export class NavigationList {
  readonly entries=input.required<readonly NavigationEntry[]>(); readonly expanded=input(false); readonly label=input.required<string>(); readonly searchLabel=input.required<string>();
  readonly searchable=input(true);readonly expandedEntries=input<readonly string[]>([]);readonly expansionRequested=output<void>();
  readonly selected=output<string>(); readonly search=new FormControl('',{nonNullable:true});
  private readonly query=toSignal(this.search.valueChanges,{initialValue:''});
  private readonly branches=signal<ReadonlySet<string>>(new Set());private static sequence=0;private readonly id='erp-navigation-'+ ++NavigationList.sequence;
  readonly filtered=computed(()=>filterNavigationEntries(this.entries(),this.query()));
  readonly childExpandedEntries=computed(()=>{if(!this.query().trim())return this.expandedEntries();const collect=(entries:readonly NavigationEntry[]):string[]=>entries.flatMap(entry=>entry.children?.length?[entry.id,...collect(entry.children)]:[]);return collect(this.filtered());});
  constructor(){effect(()=>{this.branches.set(new Set(this.expandedEntries()));});}
  branchId(id:string){return this.id+'-'+id;}
  branchOpen(id:string){return this.query().trim().length>0||this.branches().has(id);}
  activate(item:NavigationEntry):void{
   if(!item.children?.length){this.selected.emit(item.id);return;}
   this.branches.update(current=>{const next=new Set(current);if(next.has(item.id))next.delete(item.id);else next.add(item.id);return next;});
   if(!this.expanded())this.expansionRequested.emit();
  }
}
