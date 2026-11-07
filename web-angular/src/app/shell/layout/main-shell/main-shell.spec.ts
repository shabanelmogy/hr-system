import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ThemeService } from '../../../../theme/public-api';
import { sessionFixture } from '../../../platform/auth/auth.fixture';
import { AuthSession } from '../../../platform/auth/session.public-api';
import { LocalizationRuntime } from '../../../platform/localization/public-api';
import type { NavigationEntry } from '../../../shared/ui/public-api';
import { SHELL_ADDITIONAL_NAVIGATION } from '../../context-slot';
import { MainShell } from './main-shell';

describe('Shell Settings navigation', () => {
  it('renders the Settings workspace once without a duplicate preferences item', () => {
    const user = signal({ ...sessionFixture, roles: ['super_admin'] });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthSession,
          useValue: { user, readIdentity: user, pending: signal(false), restoring: signal(false) },
        },
        {
          provide: LocalizationRuntime,
          useValue: {
            translate: (key: string) => key,
            loadNamespace: () => Promise.resolve(),
            language: signal('en'),
          },
        },
        { provide: ThemeService, useValue: {} },
        {
          provide: SHELL_ADDITIONAL_NAVIGATION,
          useValue: {
            entries: signal<readonly NavigationEntry[]>([
              {
                id: 'system-administration',
                label: 'Administration',
                icon: 'admin',
                children: [{ id: 'settings', label: 'menu.settings', icon: 'settings' }],
              },
            ]),
            activate: () => false,
          },
        },
      ],
    });
    const shell = TestBed.createComponent(MainShell).componentInstance;
    const flatten = (entries: readonly NavigationEntry[]): readonly NavigationEntry[] =>
      entries.flatMap((entry) => [entry, ...flatten(entry.children ?? [])]);
    expect(
      flatten(shell.navigation()).filter((entry) => entry.label === 'menu.settings'),
    ).toHaveLength(1);
    expect(flatten(shell.navigation()).some((entry) => entry.id === 'preferences')).toBe(false);
  });
});
