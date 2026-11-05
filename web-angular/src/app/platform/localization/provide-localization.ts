import type { Provider } from '@angular/core';
import { UI_LOCALIZATION } from '../../shared/localization/public-api';
import { LocalizationRuntime } from './localization-runtime';

export function provideAppLocalization(): Provider[] {
  return [{ provide: UI_LOCALIZATION, useExisting: LocalizationRuntime }];
}
