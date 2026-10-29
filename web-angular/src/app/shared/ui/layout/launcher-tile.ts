import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIcon } from '../icons/app-icon';
import type { LauncherItem } from './launcher-grid';

@Component({selector:'erp-launcher-tile',imports:[RouterLink,AppIcon],host:{'[class.area]':"variant()==='area'"},template:`
  <a class="launcher-tile" [routerLink]="item().href" [attr.aria-label]="item().label" [style.--accent]="item().accent" [style.--accent-contrast]="item().contrast">
          <span class="launcher-arrow"><erp-icon name="forward" /></span><span class="launcher-icon"><erp-icon [name]="item().icon" /></span>
          @if(item().eyebrow){<span class="eyebrow">{{ item().eyebrow }}</span>}<strong>{{ item().label }}</strong>
        </a>`,styleUrl:'./launcher-tile.scss'})
export class LauncherTile {readonly item=input.required<LauncherItem>();readonly variant=input<'module'|'area'>('module');}
