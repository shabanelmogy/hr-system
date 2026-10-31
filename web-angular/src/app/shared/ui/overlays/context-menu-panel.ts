import { Component,computed,DestroyRef,inject,input,output,viewChild } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import type { MenuItem } from 'primeng/api';
import AuraContextMenu from '@primeuix/themes/aura/contextmenu';
import { AppIcon,type AppIconName } from '../icons/app-icon';

export interface ContextMenuAction {readonly id:string;readonly label:string;readonly icon?:AppIconName;readonly disabled?:boolean;readonly separator?:boolean;}
/** Native menu presentation only; the caller rechecks its current context and authority. */
@Component({selector:'erp-context-menu',imports:[ContextMenu,AppIcon],template:`
 <p-contextmenu #menu [model]="model()" [ariaLabel]="label()" appendTo="body" [style]="{maxWidth:'calc(100vw - 24px)'}" [dt]="tokens" (onHide)="closed()">
  <ng-template #item let-item><a class="p-contextmenu-item-link">@if(item.icon){<erp-icon [name]="item.icon" />}<span class="p-contextmenu-item-label">{{item.label}}</span></a></ng-template>
 </p-contextmenu>
`,styles:'.p-contextmenu-item-link{display:flex;align-items:center;gap:10px;min-width:0}erp-icon{width:18px;height:18px;flex-shrink:0}.p-contextmenu-item-label{overflow-wrap:anywhere}'})
export class ContextMenuPanel {
 readonly actions=input.required<readonly ContextMenuAction[]>();readonly label=input.required<string>();readonly activated=output<string>();
 readonly dismissed=output<void>();
 private readonly menu=viewChild.required<ContextMenu>('menu');private readonly destroy=inject(DestroyRef);
 private returnTarget:HTMLElement|null=null;private returnFocus=true;
 readonly tokens={...AuraContextMenu,root:{...AuraContextMenu.root,background:'var(--surface)',color:'var(--foreground)',borderColor:'var(--border)',borderRadius:'10px',shadow:'0 8px 24px #00000026'},list:{padding:'6px',gap:'2px'},item:{...AuraContextMenu.item,color:'var(--foreground)',focusColor:'var(--accent-foreground)',focusBackground:'var(--accent)',activeColor:'var(--accent-foreground)',activeBackground:'var(--accent)',padding:'10px 12px',borderRadius:'6px'}};
 readonly model=computed<MenuItem[]>(()=>{
  const actions=this.actions();if(new Set(actions.map(action=>action.id)).size!==actions.length)return [];
  return actions.map(action=>({id:action.id,label:action.label,icon:action.icon,disabled:action.disabled,separator:action.separator,command:()=>this.activate(action.id)}));
 });
 show(event:MouseEvent,returnTarget:HTMLElement|null=event.currentTarget instanceof HTMLElement?event.currentTarget:null):void{
  if(!this.model().some(item=>!item.disabled&&!item.separator))return;
  this.returnTarget=returnTarget;this.returnFocus=true;
  this.menu().show(event);
 }
 hide(restoreFocus=true):void{this.returnFocus=restoreFocus;this.menu().hide();}
 activate(id:string):void{if(this.model().some(action=>action.id===id&&!action.disabled&&!action.separator))this.activated.emit(id);}
 closed():void{
  const target=this.returnTarget,restore=this.returnFocus;this.returnTarget=null;
  this.dismissed.emit();
  queueMicrotask(()=>{if(restore&&!this.destroy.destroyed&&target?.isConnected&&target.getClientRects().length&&!target.matches(':disabled,[inert],[aria-disabled="true"]'))target.focus({preventScroll:true});});
 }
}
