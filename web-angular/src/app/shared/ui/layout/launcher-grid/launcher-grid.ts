import { Component, input } from '@angular/core';
import { LauncherTile } from '../launcher-tile/launcher-tile';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

import type { LauncherItem } from '../launcher.types';
export type { LauncherItem } from '../launcher.types';
@Component({
  selector: 'erp-launcher-grid',
  imports: [LauncherTile, AppIcon],
  templateUrl: './launcher-grid.html',
  styleUrl: './launcher-grid.scss',
})
export class LauncherGrid {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<AppIconName>('apps');
  readonly items = input.required<readonly LauncherItem[]>();
  readonly variant = input<'module' | 'area'>('module');
}
