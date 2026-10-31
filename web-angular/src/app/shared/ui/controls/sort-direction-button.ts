import { Component,computed,input,output } from '@angular/core';
import { ActionButton } from '../buttons/public-api';
import { AppIcon } from '../icons/app-icon';
import { UiTextPipe } from '../../../platform/localization/public-api';

/** Controlled shared sort direction: compact visible label, full accessible name. */
@Component({selector:'erp-sort-direction-button',imports:[ActionButton,AppIcon,UiTextPipe],template:`
 <erp-button [label]="shortKey()|uiText" [accessibleLabel]="fullKey()|uiText" [title]="fullKey()|uiText" variant="text" [disabled]="disabled()" (activated)="toggle()"><erp-icon buttonIcon [name]="direction()==='asc'?'arrowUp':'arrowDown'" /></erp-button>`,styles:':host{display:inline-flex;flex-shrink:0}'})
export class SortDirectionButton {
 readonly direction=input<'asc'|'desc'>('asc');readonly disabled=input(false);readonly directionChange=output<'asc'|'desc'>();
 readonly shortKey=computed(()=>this.direction()==='asc'?'collections.sortAscendingShort':'collections.sortDescendingShort');
 readonly fullKey=computed(()=>this.direction()==='asc'?'collections.sortAscending':'collections.sortDescending');
 toggle():void{if(!this.disabled())this.directionChange.emit(this.direction()==='asc'?'desc':'asc');}
}
