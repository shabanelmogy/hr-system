import { Component, input, output } from '@angular/core';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';

@Component({
  selector: 'erp-feedback-state',
  imports: [ActionButton, AppIcon],
  templateUrl: './feedback-state.html',
  host: {
    '[class.inline-feedback]': "layout()==='inline'",
    '[class.compact-feedback]': 'compact()',
    '[style.--feedback-color]':
      "tone()==='success'?'var(--success)':tone()==='warning'?'var(--warning)':'var(--destructive)'",
  },
  styleUrl: './feedback-state.scss',
})
export class FeedbackState {
  readonly compact = input(false);
  readonly icon = input<AppIconName | null>(null);
  readonly tone = input<'danger' | 'success' | 'warning'>('danger');
  readonly kind = input<'loading' | 'empty' | 'error' | 'forbidden'>('empty');
  readonly title = input.required<string>();
  readonly message = input('');
  readonly actionLabel = input('');
  readonly action = output<void>();
  readonly layout = input<'page' | 'inline'>('page');
}
