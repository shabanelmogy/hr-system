import { Component, inject, signal } from '@angular/core';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import { ActionButton } from '../../shared/ui/public-api';
import { ThemeService } from '../../../theme/public-api';

/** Development compatibility fixture; contains no business data or network calls. */
@Component({
  imports: [UiTextPipe, ActionButton],
  templateUrl: './theme-preview.html',
  styleUrl: './theme-preview.scss',
})
export class ThemePreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly palettes = themePaletteOrder;
  readonly ready = signal(false);
  constructor() {
    void this.runtime.loadNamespace('core').then(() => this.ready.set(true));
  }
}
