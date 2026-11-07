import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideAppTheme } from '../../../../../theme/public-api';
import { AuthSession } from '../../../auth/session.public-api';
import { sessionFixture } from '../../../auth/auth.fixture';
import { LocalizationRuntime } from '../../../localization/public-api';
import { SystemErrorLogService } from '../../services/system-error-log-service';
import { systemErrorLogSettingsFixture } from '../../error-log.fixture';
import { ErrorLogSettingsPage } from './error-log-settings-page';

describe('Retention settings shared composition', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('renders five counters with settings-only authority and validates beneath the native shared field', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      media: '',
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }));
    const actor = signal({
      ...sessionFixture,
      roles: ['super_admin'],
      permissions: ['ErrorLogSettings:View', 'ErrorLogSettings:Edit'],
    });
    const service = {
      settings: vi.fn(() => of(systemErrorLogSettingsFixture)),
      saveSettings: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideAppTheme(),
        { provide: AuthSession, useValue: { readIdentity: actor } },
        { provide: SystemErrorLogService, useValue: service },
      ],
    });
    const locale = TestBed.inject(LocalizationRuntime);
    locale.setLanguage('en');
    await locale.loadNamespace('core');
    await locale.loadNamespace('platform-advanced-tools');
    const fixture = TestBed.createComponent(ErrorLogSettingsPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('erp-metric-card')).toHaveLength(5);
    const edit = Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Edit retention',
    );
    expect(edit).toBeDefined();
    edit?.click();
    await fixture.whenStable();
    const dialog = document.querySelector<HTMLElement>('[role=dialog]') ?? root;
    const input = dialog.querySelector<HTMLInputElement>('erp-numeric-field input');
    expect(input).not.toBeNull();
    if (!input) throw Error('Expected retention field');
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const save = dialog.querySelector<HTMLButtonElement>('erp-form button[type=submit]');
    expect(save?.disabled).toBe(false);
    save?.click();
    await fixture.whenStable();
    expect(dialog.textContent).toContain('Enter a retention period.');
    expect(service.saveSettings).not.toHaveBeenCalled();
    expect(dialog.querySelector('form')?.noValidate).toBe(true);
  });
});
