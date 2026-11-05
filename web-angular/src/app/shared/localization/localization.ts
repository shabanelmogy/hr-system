import { InjectionToken, type Signal } from '@angular/core';
import type { TOptions } from 'i18next';

export type UiLanguage = 'en' | 'ar';

/** Presentation contract. Identity, overrides and persistence belong to Platform. */
export interface UiLocalization {
  readonly language: Signal<UiLanguage>;
  readonly direction: Signal<'ltr' | 'rtl'>;
  translate(key: string, namespace?: string, options?: TOptions): string;
}

export const UI_LOCALIZATION = new InjectionToken<UiLocalization>('ERP UI localization');
