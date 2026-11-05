import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAppTheme } from '../../../../../theme/public-api';
import { BrowserAuthService } from '../../services/browser-auth-service';
import { PasswordRequestPage } from './password-request-page';

describe('Password request native submission', () => {
  async function setup() {
    const requestPasswordReset = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAppTheme(),
        { provide: BrowserAuthService, useValue: { requestPasswordReset } },
      ],
    });
    const fixture = TestBed.createComponent(PasswordRequestPage);
    await fixture.whenStable();
    return { fixture, owner: fixture.componentInstance, requestPasswordReset };
  }

  it('reports invalid email through the shared field without dispatching', async () => {
    const { fixture, requestPasswordReset } = await setup();
    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(button.disabled).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(requestPasswordReset).not.toHaveBeenCalled();
    expect(root.querySelector('.error')).not.toBeNull();
    expect(document.activeElement).toBe(root.querySelector('input'));
  });

  it('awaits the real request, guards duplicates and permits an unchanged retry', async () => {
    const { fixture, owner, requestPasswordReset } = await setup();
    owner.form.email().value.set('fixture@example.test');
    let reject!: (reason: Error) => void;
    requestPasswordReset.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, fail) => {
          reject = fail;
        }),
    );
    const first = owner.request();
    void owner.request();
    expect(owner.form().submitting()).toBe(true);
    expect(requestPasswordReset).toHaveBeenCalledOnce();
    reject(new Error('Transport fixture'));
    await first;
    await fixture.whenStable();
    expect(owner.feedback()).toBe('angularAuth.unavailable');
    expect(owner.form().valid()).toBe(true);
    await owner.request();
    await fixture.whenStable();
    expect(requestPasswordReset).toHaveBeenCalledTimes(2);
    expect(owner.feedback()).toBe('angularAuth.passwordRequestSent');
  });
});
