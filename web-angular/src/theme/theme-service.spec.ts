import { TestBed } from '@angular/core/testing';
import { contrastRatio, getTheme, themePaletteOrder } from '@app/tokens';
import { providePrimeNG } from 'primeng/config';
import { LocalizationRuntime } from '../app/platform/localization/public-api';
import { actionHover, buttonColors, createPrimePreset } from './prime-preset';
import { ThemeService } from './theme-service';

describe('Shared token theme integration', () => {
  beforeEach(() => {
    document.cookie = 'currentMode=; Path=/; Max-Age=0';
    document.cookie = 'themePalette=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ providers: [providePrimeNG({ ripple: false })] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    document.cookie = 'currentMode=; Path=/; Max-Age=0';
    document.cookie = 'themePalette=; Path=/; Max-Age=0';
    document.cookie = 'i18next=; Path=/; Max-Age=0';
    document.documentElement.classList.remove('dark');
  });

  for (const palette of themePaletteOrder) {
    for (const mode of ['light', 'dark'] as const) {
      it(`preserves semantic actions and AA text contrast for ${palette}/${mode}`, () => {
        const theme = getTheme(palette, mode);
        const colors = buttonColors(theme);
        expect(colors.secondary?.background).toBe(theme.colors.secondary);
        expect(colors.help?.background).toBe(theme.colors.brand3);
        expect(colors.danger?.color).toBe(theme.colors.destructiveForeground);
        expect(colors.primary?.background).toContain(theme.colors.primary);
        expect(contrastRatio(theme.colors.primaryForeground, actionHover(theme))).toBeGreaterThanOrEqual(4.5);
        expect(createPrimePreset(palette).components?.button).toBeDefined();
      });
    }
  }

  it('restores current Cookie identities and rejects unknown values without changing the current theme', () => {
    document.cookie = 'currentMode=dark; Path=/'; document.cookie = 'themePalette=navy; Path=/';
    const service = TestBed.inject(ThemeService);
    expect(service.palette()).toBe('navy'); expect(service.mode()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(service.setPalette('unknown')).toBe(false); expect(service.setMode('unknown')).toBe(false);
    expect(service.palette()).toBe('navy'); expect(service.mode()).toBe('dark');
    service.setPalette('orange'); service.setMode('light');
    expect(document.cookie).toContain('themePalette=orange'); expect(document.cookie).toContain('currentMode=light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('falls back from invalid preferences and preserves the localization owner and RTL through theme changes', () => {
    document.cookie = 'currentMode=invalid; Path=/'; document.cookie = 'themePalette=invalid; Path=/';
    const service = TestBed.inject(ThemeService);
    expect(service.palette()).toBe('green'); expect(service.mode()).toBe('light');
    const localization = TestBed.inject(LocalizationRuntime); localization.setLanguage('ar');
    service.setPalette('blue'); service.setMode('dark');
    expect(document.documentElement.dir).toBe('rtl'); expect(localization.language()).toBe('ar');
    expect(document.documentElement.dataset['palette']).toBe('blue');
  });
});
