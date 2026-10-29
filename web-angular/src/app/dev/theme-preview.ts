import { Component, inject, signal } from '@angular/core';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime, UiTextPipe } from '../platform/localization/public-api';
import { ActionButton } from '../shared/ui/public-api';
import { ThemeService } from '../../theme/public-api';

/** Development compatibility fixture; contains no business data or network calls. */
@Component({
  imports: [UiTextPipe, ActionButton],
  template: `
    <main>
      @if (ready()) {
        <header>
          <h2>{{ 'menu.colorPalette' | uiText }}</h2>
          <div class="actions" data-testid="preferences">
            @for (palette of palettes; track palette) {
              <erp-button [label]="('menu.palettes.' + palette) | uiText" severity="secondary"
                [pressed]="theme.palette() === palette"
                [attr.data-palette]="palette" (activated)="theme.setPalette(palette)" />
            }
            <erp-button [label]="(theme.mode() === 'light' ? 'general.darkMode' : 'general.lightMode') | uiText"
              variant="outlined" data-testid="mode" (activated)="theme.setMode(theme.mode() === 'light' ? 'dark' : 'light')" />
            <erp-button [label]="(runtime.language() === 'en' ? 'common.arabic' : 'common.english') | uiText" severity="secondary"
              data-testid="language" (activated)="runtime.setLanguage(runtime.language() === 'en' ? 'ar' : 'en')" />
          </div>
        </header>
        <section class="surface" data-testid="action-composition">
          <div class="actions">
            <erp-button [label]="'common.save' | uiText" data-testid="primary" />
            <erp-button [label]="'common.cancel' | uiText" severity="secondary" />
            <erp-button [label]="'common.success' | uiText" severity="success" data-testid="success" />
            <erp-button [label]="'common.warning' | uiText" severity="warn" data-testid="warning" />
            <erp-button [label]="'common.error' | uiText" severity="danger" data-testid="danger" />
            <erp-button [label]="'common.info' | uiText" severity="info" data-testid="info" />
          </div>
          <div class="actions">
            <erp-button [label]="'common.save' | uiText" variant="outlined" />
            <erp-button [label]="'common.cancel' | uiText" variant="text" />
            <erp-button [label]="'common.loading' | uiText" busy />
            <erp-button [label]="'common.save' | uiText" disabled />
          </div>
        </section>
        <section class="surface" data-testid="second-composition">
          <erp-button [label]="'actions.saveInformation' | uiText" fullWidth />
        </section>
      }
    </main>
  `,
  styles: `
    main { max-inline-size: var(--wide-content-max-width); margin-inline: auto; padding: 1.5rem; }
    h2 { margin-block: 0 1rem; font-size: 1.5rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-block-end: 1rem; }
    .surface { background: var(--surface); color: var(--surface-foreground); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 1.5rem; margin-block-start: 1.5rem; }
  `,
})
export class ThemePreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly palettes = themePaletteOrder;
  readonly ready = signal(false);
  constructor() { void this.runtime.loadNamespace('core').then(() => this.ready.set(true)); }
}
