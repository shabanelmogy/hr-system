import { Component,input,output } from '@angular/core';
import { UiTextPipe } from '../../../platform/localization/public-api';
import { ActionButton } from '../buttons/public-api';
import { AppIcon } from '../icons/app-icon';
import type { CollectionId } from './collection.types';
import type { GridRowAction } from './grid-options.types';

/** Shared action presentation; callers retain domain permissions and callbacks. */
@Component({selector:'erp-row-actions',imports:[ActionButton,AppIcon,UiTextPipe],template:`
 <div class="row-actions" role="group" [attr.aria-label]="'collections.rowActions'|uiText">
  @for(action of actions();track action.id){<erp-button [attr.data-row-action]="action.id" [attr.data-action-row]="rowKey()" [label]="action.label" [title]="action.label" [disabled]="action.disabled??false" [style.color]="color(action)" appearance="icon" variant="text" (activated)="activate(action.id)"><erp-icon buttonIcon [name]="action.icon??'more'" /></erp-button>}
 </div>`,styles:':host{display:block}.row-actions{display:flex;align-items:center;justify-content:center;gap:0;--action-icon-size:32px}erp-icon{width:24px;height:24px}'})
export class RowActions {
 readonly actions=input.required<readonly GridRowAction[]>();readonly rowKey=input<CollectionId|null>(null);readonly activated=output<string>();
 color(action:GridRowAction):string{return ({primary:'var(--primary)',secondary:'var(--foreground)',success:'var(--success)',warning:'var(--warning)',danger:'var(--destructive)'} as const)[action.tone??'primary'];}
 activate(id:string){if(this.actions().some(action=>action.id===id&&!action.disabled))this.activated.emit(id);}
}
