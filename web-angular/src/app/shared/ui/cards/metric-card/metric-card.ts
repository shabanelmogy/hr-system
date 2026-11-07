import { Component, input, type TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

@Component({
  selector: 'erp-metric-card',
  imports: [AppIcon, NgTemplateOutlet],
  host: {
    '[class.compact-metric]': 'compact()',
    '[class.raised-metric]': "appearance()==='raised'",
    '[class.large-metric]': "size()==='large'",
    '[class.small-metric]': "size()==='small'",
  },
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
})
export class MetricCard {
  readonly appearance = input<'default' | 'raised'>('default');
  readonly compact = input(false);
  readonly size = input<'small' | 'regular' | 'large'>('regular');
  readonly description = input('');
  readonly footerTemplate = input<TemplateRef<unknown> | null>(null);
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<AppIconName>('chart');
  readonly accent = input('var(--primary)');
}
