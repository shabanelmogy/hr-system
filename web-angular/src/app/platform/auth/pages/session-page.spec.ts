import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAppTheme } from '../../../../theme/public-api';
import { sessionFixture } from '../auth.fixture';
import { AuthSession } from '../state/auth-session';
import { SessionPage } from './session-page';

describe('Direct authenticated entry', () => {
  afterEach(() => { document.cookie = 'i18next=; Path=/; Max-Age=0'; });
  it('loads its own captions after a full reload without visiting login first', async () => {
    document.cookie = 'i18next=en; Path=/';
    TestBed.configureTestingModule({ imports: [SessionPage], providers: [provideRouter([]), provideAppTheme(),
      { provide: AuthSession, useValue: { user: signal(sessionFixture), pending: signal(false), logout: vi.fn() } }] });
    const fixture = TestBed.createComponent(SessionPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    await vi.waitFor(() => { fixture.detectChanges(); expect(root.textContent).toContain('You are signed in'); });
    expect(root.textContent).toContain('Fixture User');
    expect([...root.querySelectorAll('button')].some(button => button.textContent?.includes('Sign out'))).toBe(true);
    expect(root.textContent).not.toContain('angularAuth.signOut');
  });
});
