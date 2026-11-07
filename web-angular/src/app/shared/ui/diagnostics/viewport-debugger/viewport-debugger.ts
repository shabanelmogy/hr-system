import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { UI_LOCALIZATION } from '../../../localization/public-api';
import { CopyButton } from '../../buttons/copy-button/copy-button';
import { OptionSelect } from '../../controls/option-select/option-select';
import { PopoverPanel } from '../../overlays/popover-panel/popover-panel';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { ResponsivePreviewState } from '../responsive-preview-state';
import { viewportPresets } from '../responsive-preview-presets';

/** Development-only consumer: CSS viewport pixels match the media-query width. */
@Component({
  selector: 'erp-viewport-debugger',
  imports: [CopyButton, OptionSelect, PopoverPanel, AppIcon],
  templateUrl: './viewport-debugger.html',
  styleUrl: './viewport-debugger.scss',
  host: { '(window:resize)': 'measure()' },
})
export class ViewportDebugger {
  private readonly document = inject(DOCUMENT);
  readonly locale = inject(UI_LOCALIZATION);
  readonly size = signal(this.readSize());
  readonly breakpoint = computed(() => {
    const width = this.size().width;
    return width < 600 ? 'xs' : width < 900 ? 'sm' : width < 1200 ? 'md' : 'lg';
  });
  readonly label = computed(
    () => `${this.size().width} × ${this.size().height} · ${this.breakpoint()}`,
  );
  readonly description = computed(() => this.locale.translate('development.viewport', 'core'));
  readonly copyLabel = computed(() => this.locale.translate('displayDebugger.copy', 'core'));
  readonly preview = inject(ResponsivePreviewState);
  readonly openLabel = computed(() => this.locale.translate('displayDebugger.open', 'core'));
  readonly presetLabel = computed(() => this.locale.translate('displayDebugger.preset', 'core'));
  readonly visibleLabel = computed(() =>
    this.size().width < 600 ? `${this.size().width}×${this.size().height}` : this.label(),
  );
  readonly options = computed(() => [
    { value: 'current', label: this.locale.translate('displayDebugger.actualSize', 'core') },
    ...viewportPresets.map((preset) => ({
      value: preset.id,
      label: `${preset.width} × ${preset.height}`,
    })),
  ]);
  readonly selectedPreset = computed(() =>
    this.preview.embedded
      ? (viewportPresets.find(
          (preset) => preset.width === this.size().width && preset.height === this.size().height,
        )?.id ?? 'current')
      : (this.preview.active()?.id ?? 'current'),
  );

  measure(): void {
    const next = this.readSize();
    if (next.width !== this.size().width || next.height !== this.size().height) this.size.set(next);
  }

  private readSize(): { readonly width: number; readonly height: number } {
    const viewport = this.document.defaultView;
    return { width: viewport?.innerWidth ?? 0, height: viewport?.innerHeight ?? 0 };
  }
}
