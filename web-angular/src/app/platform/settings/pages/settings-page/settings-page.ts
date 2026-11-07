import { Component, computed, inject, signal } from '@angular/core';
import {
  PageHeader,
  AppearancePreferences,
  ContentTabs,
  type ContentTab,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime } from '../../../localization/public-api';
import { ThemeService } from '../../../../../theme/public-api';
import { ErrorLogSettingsPage } from '../../../system-error-logs/public-api';
import { UiTextPipe } from '../../../localization/public-api';

@Component({
  selector: 'erp-settings-page',
  imports: [PageHeader, AppearancePreferences, ContentTabs, ErrorLogSettingsPage, UiTextPipe],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
})
export class SettingsPage {
  readonly locale = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly selected = signal('system');
  readonly tabs = computed<readonly ContentTab[]>(() => [
    { id: 'system', label: this.locale.translate('settingsWorkspace.tabs.system', 'core') },
    { id: 'appearance', label: this.locale.translate('settingsWorkspace.tabs.appearance', 'core') },
  ]);
  readonly appearanceLanguage = computed(() => this.locale.language());
  constructor() {
    void this.locale.loadNamespace('core');
  }
}
