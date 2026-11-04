import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIcon } from '../../icons/app-icon/app-icon';
import type { LauncherItem } from '../launcher.types';

@Component({
  selector: 'erp-launcher-tile',
  imports: [RouterLink, AppIcon],
  host: { '[class.area]': "variant()==='area'" },
  templateUrl: './launcher-tile.html',
  styleUrl: './launcher-tile.scss',
})
export class LauncherTile {
  readonly item = input.required<LauncherItem>();
  readonly variant = input<'module' | 'area'>('module');
}
