import { Component, computed, input } from '@angular/core';
import { ProgressBar } from 'primeng/progressbar';

export function progressPercentage(used:number,limit:number):number{return Number.isFinite(used)&&Number.isFinite(limit)&&limit>0?Math.max(0,Math.min(100,Math.round(used/limit*100))):0;}
@Component({selector:'erp-progress-meter',imports:[ProgressBar],template:`
  <div class="meter" [class.inline]="appearance()==='inline'" [style.--meter-accent]="accent()??'var(--primary)'"><div class="meter-label"><strong>{{ label() }}</strong><span>{{ description() }}</span></div><p-progressbar [value]="percentage()" [showValue]="false" [ariaLabel]="label()" [dt]="tokens()" /></div>`,styles:`
  :host{display:block}.meter{padding:8px 10px;background:color-mix(in srgb,var(--foreground) 4%,transparent);border-radius:8px}.meter-label{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:6.4px;flex-wrap:wrap}strong{font-weight:700}span{font-size:14px;color:var(--muted-foreground)}
  .inline{padding:0;background:transparent;border-radius:0}.inline .meter-label{gap:8px;margin-bottom:4px;font-size:12px;color:var(--muted-foreground)}.inline span{font-size:12px;font-weight:700;color:var(--meter-accent)}
  `})
export class ProgressMeter {
  readonly label=input.required<string>();readonly description=input.required<string>();readonly used=input.required<number>();readonly limit=input.required<number>();
  readonly accent=input<string|null>(null);
  readonly appearance=input<'panel'|'inline'>('panel');
  readonly percentage=computed(()=>progressPercentage(this.used(),this.limit()));
  readonly tokens=computed(()=>({root:{height:this.appearance()==='inline'?'6px':'7px',borderRadius:'999px',background:this.appearance()==='inline'?'color-mix(in srgb,'+(this.accent()??'var(--primary)')+' 18%,transparent)':'var(--muted)'},value:{background:this.accent()??(this.percentage()>=90?'var(--warning)':'var(--primary)')}}));
}
