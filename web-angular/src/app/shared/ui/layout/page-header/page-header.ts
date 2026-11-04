import { Component, computed, inject, input, output, viewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../../../../theme/public-api';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';
import { UiTextPipe } from '../../../../platform/localization/public-api';
import { StatusBadge } from '../../feedback/status-badge/status-badge';
import { PopoverPanel } from '../../overlays/popover-panel/popover-panel';

export interface PageViewOption {
  readonly id: string;
  readonly label: string;
  readonly icon: AppIconName;
}
export interface PageHeaderAction {
  readonly label: string;
  readonly icon: AppIconName;
  readonly disabled?: boolean;
}
export function partitionPageViews(
  options: readonly PageViewOption[],
  active: string,
  limit: number,
): { readonly visible: readonly PageViewOption[]; readonly overflow: readonly PageViewOption[] } {
  const count = Math.max(1, Math.floor(limit));
  if (options.length <= count) return { visible: options, overflow: [] };
  const visible = options.slice(0, count),
    selected = options.find((option) => option.id === active);
  if (selected && !visible.some((option) => option.id === active))
    visible[visible.length - 1] = selected;
  return {
    visible,
    overflow: options.filter((option) => !visible.some((item) => item.id === option.id)),
  };
}
@Component({
  selector: 'erp-page-header',
  imports: [ActionButton, AppIcon, UiTextPipe, StatusBadge, PopoverPanel],
  host: { '[class.collection-header]': "variant()==='collection'" },
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  readonly theme = inject(ThemeService);
  private readonly breakpoint = toSignal(
    inject(BreakpointObserver).observe(['(min-width:900px)', '(max-width:599px)']),
    {
      initialValue: {
        matches: true,
        breakpoints: { '(min-width:900px)': true, '(max-width:599px)': false },
      },
    },
  );
  private readonly moreViews = viewChild<PopoverPanel>('moreViews');
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly variant = input<'simple' | 'collection'>('simple');
  readonly views = input<readonly PageViewOption[]>([]);
  readonly view = input('grid');
  readonly total = input(0);
  readonly totalLabel = input('');
  readonly refreshable = input(true);
  readonly filterable = input(true);
  readonly filterVisible = input(true);
  readonly primaryAction = input<PageHeaderAction | null>(null);
  readonly primaryActivated = output<void>();
  readonly compactAction = computed(
    () => this.breakpoint().breakpoints['(max-width:599px)'] === true,
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
  readonly viewOptions = computed(() => {
    const viewport = this.breakpoint();
    return viewport.breakpoints['(min-width:900px)']
      ? { visible: this.views(), overflow: [] }
      : partitionPageViews(
          this.views(),
          this.view(),
          viewport.breakpoints['(max-width:599px)'] ? 2 : 3,
        );
  });
  selectView(id: string) {
    if (id !== this.view() && this.views().some((option) => option.id === id)) {
      this.moreViews()?.close();
      this.viewChange.emit(id);
    }
  }
}
