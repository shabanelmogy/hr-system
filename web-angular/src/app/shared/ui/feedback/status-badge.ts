import { Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';

@Component({selector:'erp-status-badge',imports:[Tag],template:`<p-tag [value]="label()" [rounded]="true" [style]="styles()" />`})
export class StatusBadge {
 readonly label=input.required<string>();readonly accent=input('var(--muted-foreground)');
 readonly appearance=input<'soft'|'outline'|'solid'>('soft');readonly contrast=input('var(--primary-foreground)');
 readonly pill=input(false);readonly size=input<'small'|'medium'>('small');readonly strong=input(true);
 readonly softOpacity=input(12);readonly opacity=computed(()=>{const value=this.softOpacity();return Number.isFinite(value)&&value>=0&&value<=100?value:12;});
 readonly styles=computed(()=>({color:this.appearance()==='solid'?this.contrast():this.accent(),background:this.appearance()==='solid'?this.accent():this.appearance()==='outline'?'transparent':'color-mix(in srgb,'+this.accent()+' '+this.opacity()+'%,transparent)',border:this.appearance()==='outline'?'1px solid color-mix(in srgb,'+this.accent()+' 40%,transparent)':null,borderRadius:this.pill()||this.appearance()!=='soft'?'999px':null,fontSize:this.size()==='medium'?'13px':'12px',fontWeight:this.strong()?'700':'400',height:this.size()==='medium'?'24px':null,padding:'2px 8px',whiteSpace:'nowrap'}));
}
