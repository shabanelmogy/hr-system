import { Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';

@Component({selector:'erp-status-badge',imports:[Tag],template:`<p-tag [value]="label()" [rounded]="true" [style]="{color:accent(),background:'color-mix(in srgb,'+accent()+' 12%,transparent)',fontSize:'12px',fontWeight:'700',padding:'2px 8px',whiteSpace:'nowrap'}" />`})
export class StatusBadge {readonly label=input.required<string>();readonly accent=input('var(--muted-foreground)');}
