import { Component, input } from '@angular/core';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

@Component({
  selector: 'erp-metric-card',
  imports: [AppIcon],
  host: { '[class.raised-metric]': "appearance()==='raised'" },
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
})
export class MetricCard {
  readonly appearance = input<'default' | 'raised'>('default');
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<AppIconName>('chart');
  readonly accent = input('var(--primary)');
}
