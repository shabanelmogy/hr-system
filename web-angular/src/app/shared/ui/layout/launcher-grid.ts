import { Component, input } from '@angular/core';
import { LauncherTile } from './launcher-tile';
import { AppIcon, type AppIconName } from '../icons/app-icon';

export type LauncherItem = { id: string; label: string; href: string; icon: AppIconName; accent: string; contrast: string; eyebrow?: string };
@Component({ selector: 'erp-launcher-grid', imports: [LauncherTile, AppIcon], template: `
  <section class="launcher" [class.area-launcher]="variant()==='area'" [attr.aria-label]="title()">
    <header><span class="heading-icon"><erp-icon [name]="icon()" /></span><h1>{{ title() }}</h1><p>{{ description() }}</p></header>
    <div class="launcher-grid">
      @for(item of items();track item.id){
        <erp-launcher-tile [item]="item" [variant]="variant()" />
      }
    </div><ng-content />
  </section>`, styleUrl: './launcher-grid.scss' })
export class LauncherGrid {
  readonly title = input.required<string>(); readonly description = input.required<string>(); readonly icon = input<AppIconName>('apps');
  readonly items = input.required<readonly LauncherItem[]>(); readonly variant = input<'module'|'area'>('module');
}
