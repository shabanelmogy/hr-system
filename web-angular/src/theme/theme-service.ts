import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { defaultPalette, getTheme, themePaletteOrder, type ResolvedThemeMode, type ThemePalette } from '@app/tokens';
import { PrimeNG } from 'primeng/config';
import { createPrimePreset } from './prime-preset';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly prime = inject(PrimeNG);
  private readonly selectedPalette = signal<ThemePalette>(defaultPalette);
  private readonly selectedMode = signal<ResolvedThemeMode>('light');
  readonly palette = this.selectedPalette.asReadonly();
  readonly mode = this.selectedMode.asReadonly();
  readonly theme = computed(() => getTheme(this.palette(), this.mode()));

  constructor() {
    const cookies = new Map(this.document.cookie.split(';').map(value => {
      const index = value.indexOf('=');
      return [value.slice(0, index).trim(), value.slice(index + 1)] as const;
    }));
    this.setPalette(themePaletteOrder.find(palette => palette === cookies.get('themePalette')) ?? defaultPalette, false);
    this.setMode(cookies.get('currentMode') === 'dark' ? 'dark' : 'light', false);
  }

  setPalette(value: string, persist = true): boolean {
    const palette = themePaletteOrder.find(candidate => candidate === value);
    if (!palette) return false;
    this.selectedPalette.set(palette);
    this.document.documentElement.dataset['palette'] = palette;
    this.prime.theme.set({ preset: createPrimePreset(palette), options: { darkModeSelector: '.dark' } });
    if (persist) this.writePreference('themePalette', palette);
    return true;
  }

  setMode(value: string, persist = true): boolean {
    if (value !== 'light' && value !== 'dark') return false;
    this.selectedMode.set(value);
    const root = this.document.documentElement;
    root.classList.toggle('dark', value === 'dark');
    root.dataset['theme'] = value;
    root.style.colorScheme = value;
    if (persist) this.writePreference('currentMode', value);
    return true;
  }

  private writePreference(name: 'themePalette' | 'currentMode', value: string): void {
    this.document.cookie = `${name}=${value}; Path=/; SameSite=Lax; Max-Age=31536000`;
  }
}
