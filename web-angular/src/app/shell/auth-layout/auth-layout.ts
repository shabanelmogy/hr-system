import { Component, computed, inject } from '@angular/core';
import { AuthBranding } from './auth-branding';
import { parseHex } from '@app/tokens';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import { ActionButton, AppIcon, OptionSelect } from '../../shared/ui/public-api';
import { ThemeService } from '../../../theme/public-api';

const shade = (color: string, lighten: boolean) => '#' + parseHex(color).map(channel => Math.floor(lighten ? channel + (255 - channel) * 0.2 : channel * 0.7).toString(16).padStart(2, '0')).join('');
@Component({ selector: 'erp-auth-layout', imports: [UiTextPipe, ActionButton, AppIcon, OptionSelect, AuthBranding],
  templateUrl: './auth-layout.html', styleUrl: './auth-layout.scss',
  host: { '[style.--auth-primary-light]': 'colors().primaryLight', '[style.--auth-primary-dark]': 'colors().primaryDark',
    '[style.--auth-secondary-light]': 'colors().secondaryLight', '[style.--auth-secondary-dark]': 'colors().secondaryDark' },
})
export class AuthLayout {
  readonly locale = inject(LocalizationRuntime); readonly theme = inject(ThemeService);
  readonly year = new Date().getFullYear();
  readonly languageOptions = [{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }];
  readonly colors = computed(() => { const c = this.theme.theme().colors; return { primaryLight: shade(c.primary, true), primaryDark: shade(c.primary, false), secondaryLight: shade(c.brand2, true), secondaryDark: shade(c.brand2, false) }; });
  readonly features = [{ icon: '🔒', title: 'auth.secureAccess', description: 'auth.secureAccessDesc' },
    { icon: '🔐', title: 'auth.dataPrivacy', description: 'auth.dataPrivacyDesc' },
    { icon: '📊', title: 'auth.analytics', description: 'auth.analyticsDesc' }];
  changeLanguage(value: string): void { if (value === 'en' || value === 'ar') this.locale.setLanguage(value); }
}
