import { Component, computed, inject, input, output } from '@angular/core';
import type { ResolvedThemeMode } from '@app/tokens';
import { UI_LOCALIZATION, type UiLanguage } from '../../localization/public-api';
import { ActionButton } from '../buttons/public-api';
import { AppIcon } from '../icons/app-icon';
import { OptionSelect } from './option-select';

@Component({
  imports: [ActionButton, AppIcon, OptionSelect],
  host: { '[class.quiet]': "appearance() === 'quiet'" },
  selector: 'erp-appearance-preferences',
  styleUrl: './appearance-preferences.scss',
  templateUrl: './appearance-preferences.html',
})
export class AppearancePreferences {
  readonly language = input.required<UiLanguage>();
  readonly mode = input.required<ResolvedThemeMode>();
  readonly appearance = input<'icon' | 'text' | 'quiet'>('icon');
  readonly languageChange = output<UiLanguage>();
  readonly modeChange = output<ResolvedThemeMode>();
  readonly locale = inject(UI_LOCALIZATION);
  readonly languages = [{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }];
  readonly buttonAppearance = computed(() => {
    const appearance = this.appearance();
    return appearance === 'text' ? 'default' : appearance;
  });
  readonly modeLabel = computed(() => this.locale.translate(this.mode() === 'light' ? 'general.darkMode' : 'general.lightMode'));

  chooseLanguage(value: string): void {
    if (value === 'en' || value === 'ar') this.languageChange.emit(value);
  }

  toggleMode(): void {
    this.modeChange.emit(this.mode() === 'light' ? 'dark' : 'light');
  }
}
