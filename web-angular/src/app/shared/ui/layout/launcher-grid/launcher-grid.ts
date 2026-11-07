import { Component, input, output } from '@angular/core';
import { BackButton } from '../../buttons/public-api';
import { LauncherTile } from '../launcher-tile/launcher-tile';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

import type { LauncherItem } from '../launcher.types';
export type { LauncherItem } from '../launcher.types';
@Component({
  selector: 'erp-launcher-grid',
  imports: [LauncherTile, AppIcon, BackButton],
  templateUrl: './launcher-grid.html',
  styleUrl: './launcher-grid.scss',
})
export class LauncherGrid {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<AppIconName>('apps');
  readonly items = input.required<readonly LauncherItem[]>();
  readonly variant = input<'module' | 'area'>('module');
  readonly backLabel = input('');
  readonly backRequested = output<void>();
}
