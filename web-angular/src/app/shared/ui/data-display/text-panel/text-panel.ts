import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ScrollViewport } from '../../layout/scroll-viewport/scroll-viewport';

@Component({
  imports: [ScrollViewport],
  selector: 'erp-text-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './text-panel.scss',
  templateUrl: './text-panel.html',
})
export class TextPanel {
  readonly text = input.required<string>();
  readonly label = input.required<string>();
  readonly direction = input<'auto' | 'ltr' | 'rtl'>('auto');
  readonly monospace = input(false);
}
