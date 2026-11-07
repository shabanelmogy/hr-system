import { Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActionButton } from '../../buttons/action-button/action-button';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { OptionSelect } from '../../controls/option-select/option-select';
import { UI_LOCALIZATION } from '../../../localization/public-api';
import { ResponsivePreviewState } from '../responsive-preview-state';
import { viewportPresets } from '../responsive-preview-presets';

@Component({
  selector: 'erp-responsive-preview-host',
  imports: [ActionButton, AppIcon, OptionSelect],
  templateUrl: './responsive-preview-host.html',
  styleUrl: './responsive-preview-host.scss',
})
export class ResponsivePreviewHost {
  readonly preview = inject(ResponsivePreviewState);
  readonly locale = inject(UI_LOCALIZATION);
  private readonly sanitizer = inject(DomSanitizer);
  readonly url = computed(() => {
    const target = this.preview.target();
    return target ? this.sanitizer.bypassSecurityTrustResourceUrl(target) : null;
  });
  readonly options = viewportPresets.map((preset) => ({
    value: preset.id,
    label: `${preset.width} × ${preset.height}`,
  }));
  text(key: string): string {
    return this.locale.translate('displayDebugger.' + key, 'core');
  }
}
