import { booleanAttribute, Component, input, type TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

@Component({
  selector: 'erp-surface-card',
  imports: [AppIcon, NgTemplateOutlet],
  host: {
    '[class.chart-card]': "appearance()==='chart'",
    '[class.compact-card]': 'compact()',
    '[class.fill-card]': 'fill()',
    '[class.natural-card]': "contentSizing()==='natural'",
    '[class.entity-card]': 'entity()',
    '[class.details-card]': "contentLayout() === 'details'",
  },
  templateUrl: './surface-card.html',
  styleUrls: ['./surface-card.scss', './surface-card.component.scss'],
})
export class SurfaceCard<T = unknown> {
  readonly contentLayout = input<'default' | 'details'>('default');
  readonly appearance = input<'default' | 'chart'>('default');
  readonly subtitle = input('');
  readonly entity = input(false, { transform: booleanAttribute });
  readonly title = input.required<string>();
  readonly headerVisible = input(true);
  readonly compact = input(false, { transform: booleanAttribute });
  readonly fill = input(false, { transform: booleanAttribute });
  readonly contentSizing = input<'bounded' | 'natural'>('bounded');
  readonly icon = input<AppIconName>();
  readonly accent = input('var(--primary)');
  readonly headerTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
  readonly footerTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
  readonly templateContext = input<{ $implicit: T } | null>(null);
}
