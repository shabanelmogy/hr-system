import { inject, provideAppInitializer } from '@angular/core';
import { defaultPalette, zIndex } from '@app/tokens';
import { providePrimeNG } from 'primeng/config';
import { primeUiLicenseKey } from '../config/license.generated';
import { createPrimePreset } from './prime-preset';
import { ThemeService } from './theme-service';

export function provideAppTheme() {
  return [
    providePrimeNG({
      license: primeUiLicenseKey,
      theme: { preset: createPrimePreset(defaultPalette), options: { darkModeSelector: '.dark' } },
      ripple: false,
      zIndex: { modal: 1300 + zIndex.modal, overlay: 1200 + zIndex.overlay,
        menu: 1200 + zIndex.overlay, tooltip: 1500 + zIndex.tooltip },
    }),
    provideAppInitializer(() => { inject(ThemeService); }),
  ];
}
