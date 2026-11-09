import { booleanAttribute, Component, computed, inject, input, output } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../../../../theme/public-api';
import { ActionButton, BackButton } from '../../buttons/public-api';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';
import { UiTextPipe } from '../../../localization/public-api';
import { StatusBadge } from '../../feedback/status-badge/status-badge';
import { CollectionExportMenu } from '../../collections/collection-export-menu/collection-export-menu';
import type { TabularExportSource } from '../../../data/public-api';

export interface PageViewOption<T extends string = string> {
  readonly id: T;
  readonly label: string;
  readonly icon: AppIconName;
}
export interface PageHeaderAction {
  readonly label: string;
  readonly icon: AppIconName;
  readonly disabled?: boolean;
}
const shortLandscapeQuery = '(max-height: 480px) and (orientation: landscape)';
const compactExportQuery = '(max-width:1199px)';
@Component({
  selector: 'erp-page-header',
  imports: [ActionButton, BackButton, AppIcon, UiTextPipe, StatusBadge, CollectionExportMenu],
  host: {
    '[class.collection-header]': "variant()==='collection'",
    '[class.card-header]': "appearance()==='card'",
    '[class.compact-header]': 'compact()',
    '[class.stacked-actions]': "actionsLayout() === 'stacked'",
    '[class.inline-actions]': "actionsLayout() === 'inline'",
  },
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly theme = inject(ThemeService);
  private readonly breakpoint = toSignal(
    inject(BreakpointObserver).observe([
      '(max-width:599px)',
      compactExportQuery,
      shortLandscapeQuery,
    ]),
    {
      initialValue: {
        matches: true,
        breakpoints: {
          '(max-width:599px)': false,
          [compactExportQuery]: false,
          [shortLandscapeQuery]: false,
        },
      },
    },
  );
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly variant = input<'simple' | 'collection'>('simple');
  readonly appearance = input<'plain' | 'card'>('plain');
  readonly compact = input(false, { transform: booleanAttribute });
  readonly actionsLayout = input<'adaptive' | 'stacked' | 'inline'>('adaptive');
  readonly backLabel = input('');
  readonly backDisabled = input(false);
  readonly backRequested = output<void>();
  readonly views = input<readonly PageViewOption[]>([]);
  readonly view = input('grid');
  readonly total = input<number | null>(0);
  readonly totalLabel = input('');
  readonly refreshable = input(true);
  readonly filterable = input(true);
  readonly filterVisible = input(true);
  readonly primaryAction = input<PageHeaderAction | null>(null);
  readonly exportSource = input<TabularExportSource | null>(null);
  readonly primaryActivated = output<void>();
  readonly compactAction = computed(
    () =>
      this.breakpoint().breakpoints['(max-width:599px)'] === true ||
      (this.variant() === 'collection' &&
        this.breakpoint().breakpoints[shortLandscapeQuery] === true),
  );
  readonly compactExport = computed(
    () =>
      this.compactAction() ||
      this.breakpoint().breakpoints[shortLandscapeQuery] === true ||
      (this.variant() === 'collection' &&
        this.breakpoint().breakpoints[compactExportQuery] === true),
  );
  readonly viewChange = output<string>();
  readonly refresh = output<void>();
  readonly filterToggle = output<void>();
  readonly selectedLabel = computed(
    () => this.views().find((option) => option.id === this.view())?.label ?? '',
  );
  readonly countLabel = computed(
    () => String(this.total()) + (this.totalLabel() ? ' ' + this.totalLabel() : ''),
  );
  selectView(id: string) {
    if (id !== this.view() && this.views().some((option) => option.id === id)) {
      this.viewChange.emit(id);
    }
  }
}
