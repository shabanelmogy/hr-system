import { Component, input } from '@angular/core';
import { AppIcon, type AppIconName } from '../icons/app-icon';

@Component({selector:'erp-metric-card',imports:[AppIcon],host:{'[class.raised-metric]':"appearance()==='raised'"},template:`
  <section [attr.aria-label]="label()+': '+value()" [style.--accent]="accent()"><header><span>{{ label() }}</span><span class="metric-icon"><erp-icon [name]="icon()" /></span></header><strong>{{ value() }}</strong></section>`,styles:`
  :host{display:block;min-width:0}section{height:100%;padding:8px;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 5%,var(--surface)),color-mix(in srgb,var(--accent) 2%,var(--surface)));box-shadow:0 2px 4px #0001}
  header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px}header>span:first-child{font-size:12px;line-height:1.429;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted-foreground);overflow-wrap:anywhere}.metric-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;color:var(--accent);border:2px solid color-mix(in srgb,var(--accent) 20%,transparent);background:color-mix(in srgb,var(--accent) 12%,transparent);box-shadow:0 4px 12px color-mix(in srgb,var(--accent) 15%,transparent)}erp-icon{width:16.8px;height:16.8px}strong{display:block;font-size:18px;line-height:1.1;font-weight:800;margin-bottom:4px;color:var(--accent)}
  :host(.raised-metric) section{border-radius:16px;box-shadow:0 3px 1px -2px #0003,0 2px 2px #00000024,0 1px 5px #0000001f}
  `})
export class MetricCard {readonly appearance=input<'default'|'raised'>('default');readonly label=input.required<string>();readonly value=input.required<string>();readonly icon=input<AppIconName>('chart');readonly accent=input('var(--primary)');}
