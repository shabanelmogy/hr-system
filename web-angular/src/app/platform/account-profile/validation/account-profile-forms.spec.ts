import { TestBed } from '@angular/core/testing';
import { submit } from '@angular/forms/signals';
import {
  createPasswordForm,
  createProfileForm,
  emptyPasswordUpdate,
  emptyProfileUpdate,
  normalizeProfile,
} from './account-profile-forms';

describe('Own account forms', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('keeps Save actionable while exposing exact personal field errors', async () => {
    TestBed.configureTestingModule({});
    const form = TestBed.runInInjectionContext(() =>
      createProfileForm({ submission: { action: async () => undefined } }),
    );
    expect(await submit(form)).toBe(false);
    expect(form.userName().invalid()).toBe(true);
    form().value.set({
      ...emptyProfileUpdate,
      id: 'a',
      userName: 'ab',
      firstName: 'Ali',
      lastName: 'Hassan',
    });
    expect(await submit(form)).toBe(false);
    expect(form.userName().invalid()).toBe(true);
    expect(normalizeProfile({ ...form().value(), userName: ' admin ' })).toMatchObject({
      userName: 'admin',
    });
  });
  it('does not trim passwords and enforces minimum/policy/different rules', async () => {
    TestBed.configureTestingModule({});
    const form = TestBed.runInInjectionContext(() =>
      createPasswordForm({ submission: { action: async () => undefined } }),
    );
    form().value.set({ currentPassword: 'Current123!', newPassword: 'Current123!' });
    expect(await submit(form)).toBe(false);
    expect(form.newPassword().invalid()).toBe(true);
    form().value.set({ currentPassword: 'Current123!', newPassword: 'A1!' + 'a'.repeat(48) });
    expect(await submit(form)).toBe(false);
    form().value.set({ currentPassword: 'Current123!', newPassword: 'NoSymbol123' });
    expect(await submit(form)).toBe(false);
    form().value.set({
      ...emptyPasswordUpdate,
      currentPassword: 'Current123!',
      newPassword: ' NewPass123! ',
    });
    expect(await submit(form)).toBe(true);
    expect(form().value().newPassword).toBe(' NewPass123! ');
  });
});
