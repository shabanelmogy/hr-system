import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError, type Observable } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { CommandFailure, UnsavedChanges } from '../../../shared/data/public-api';
import { AccountProfileService } from '../services/account-profile-service';
import { AccountProfileState } from './account-profile-state';
import { LocalizationRuntime } from '../../localization/public-api';

const record = {
  id: sessionFixture.userId,
  email: 'account@example.test',
  userName: 'account',
  firstName: 'First',
  lastName: 'Last',
};
async function settle(): Promise<void> {
  await Promise.resolve();
  TestBed.tick();
  await Promise.resolve();
  TestBed.tick();
}
function setup() {
  const identity = signal<Session | null>({ ...sessionFixture });
  const service = {
    info: vi.fn(() => of(record)),
    photo: vi.fn(() => of<string | null>('data:image/png;base64,YQ==')),
    update: vi.fn((_value: unknown): Observable<void> => of(undefined)),
    updatePhoto: vi.fn((_value: unknown): Observable<void> => of(undefined)),
    changePassword: vi.fn((_value: unknown): Observable<void> => of(undefined)),
  };
  const auth = {
    readIdentity: identity,
    synchronizeContext: vi.fn(async () => true),
    revalidateVisibleContext: vi.fn(async () => undefined),
    logout: vi.fn(async () => true),
  };
  TestBed.configureTestingModule({
    providers: [
      AccountProfileState,
      { provide: AuthSession, useValue: auth },
      { provide: AccountProfileService, useValue: service },
      { provide: LocalizationRuntime, useValue: { translate: (key: string) => key } },
    ],
  });
  const state = TestBed.inject(AccountProfileState);
  return { state, service, auth, identity, drafts: TestBed.inject(UnsavedChanges) };
}

describe('Own-account draft and authority lifecycle', () => {
  it('opens the dedicated password route without blocking it on profile or photo reads', async () => {
    const { state, service } = setup();
    state.usePasswordOnly();
    await settle();
    expect(state.infoView()).toBe('ready');
    expect(service.info).not.toHaveBeenCalled();
    expect(service.photo).not.toHaveBeenCalled();
    state.editPassword();
    expect(state.editingPassword()).toBe(true);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('maps actual Identity mismatch under current password and preserves the draft', async () => {
    const { state, service } = setup();
    await settle();
    service.changePassword.mockReturnValue(
      throwError(() => new CommandFailure('rejected', 400, {}, ['PasswordMismatch'])),
    );
    state.editPassword();
    state.passwordForm().value.set({ currentPassword: 'Wrong123!', newPassword: 'Changed123!' });
    await state.savePasswordCommand();
    expect(state.passwordForm.currentPassword().errors()[0]?.message).toBe(
      'accountProfile.currentPasswordInvalid',
    );
    expect(state.passwordForm.newPassword().value()).toBe('Changed123!');
  });

  it('removes a saved photo and restores it on undo', async () => {
    const { state } = setup();
    await settle();
    state.editPhoto();
    state.removePhoto();
    expect(state.displayPhoto()).toBeNull();
    state.cancelPhoto();
    expect(state.displayPhoto()).toBe('data:image/png;base64,YQ==');
  });

  it('releases replaced previews and reloads confirmed photo bytes instead of retaining a revoked URL', async () => {
    const create = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const { state, service, drafts } = setup();
    await settle();
    state.editPhoto();
    state.choosePhoto(new File(['first'], 'first.png', { type: 'image/png' }));
    state.choosePhoto(new File(['second'], 'second.png', { type: 'image/png' }));
    expect(create).toHaveBeenCalledTimes(2);
    expect(revoke).toHaveBeenCalledWith('blob:first');
    service.photo.mockReturnValue(of('data:image/png;base64,Yg=='));
    await state.savePhoto();
    expect(revoke).toHaveBeenCalledWith('blob:second');
    expect(state.displayPhoto()).toBe('data:image/png;base64,Yg==');
    expect(drafts.dirty()).toBe(false);
  });

  it('locks an ambiguous photo command and allows no duplicate submission', async () => {
    const { state, service } = setup();
    await settle();
    service.updatePhoto.mockReturnValue(throwError(() => new CommandFailure('uncertain', 0)));
    state.editPhoto();
    state.removePhoto();
    await state.savePhoto();
    await state.savePhoto();
    expect(service.updatePhoto).toHaveBeenCalledTimes(1);
    expect(state.photoUncertain()).toBe(true);
  });

  it('clears passwords before logout after confirmed save without blocking on its own submitting draft', async () => {
    const { state, auth, drafts } = setup();
    await settle();
    state.editPassword();
    state.passwordForm().value.set({ currentPassword: 'Current123!', newPassword: 'Changed123!' });
    auth.logout.mockImplementation(async () => {
      expect(drafts.busy()).toBe(false);
      return true;
    });
    await state.savePasswordCommand();
    await settle();
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(state.passwordForm().value()).toEqual({ currentPassword: '', newPassword: '' });
  });

  it('requires explicit discard consent for a dirty tab transition and rejects a changed draft stamp', async () => {
    const { state, drafts } = setup();
    await settle();
    state.editInfo();
    state.profileForm.firstName().value.set('Draft');
    const choice = state.discardForTab();
    const prompt = drafts.prompt();
    if (!prompt) throw Error('Expected shared discard prompt');
    state.profileForm.firstName().value.set('Newer');
    drafts.answer(prompt, true);
    expect(await choice).toBe(false);
    expect(state.profileForm.firstName().value()).toBe('Newer');
  });

  it('treats opening unchanged forms as clean and detects only actual changes', async () => {
    const { state, drafts } = setup();
    await settle();
    expect(state.infoView()).toBe('ready');
    state.editInfo();
    expect(drafts.dirty()).toBe(false);
    state.profileForm.firstName().value.set('Changed');
    expect(drafts.dirty()).toBe(true);
    state.cancelInfo();
    expect(drafts.dirty()).toBe(false);
    state.editPassword();
    expect(drafts.dirty()).toBe(false);
  });

  it('updates only information and preserves another dirty panel without refreshing identity', async () => {
    const { state, service, auth } = setup();
    await settle();
    state.editPassword();
    state.passwordForm.currentPassword().value.set('Current123!');
    state.editInfo();
    state.profileForm.firstName().value.set(' Updated ');
    await state.saveInfoCommand();
    await settle();
    expect(service.update).toHaveBeenCalledWith({
      id: record.id,
      userName: record.userName,
      firstName: 'Updated',
      lastName: record.lastName,
    });
    expect(state.info()?.firstName).toBe('Updated');
    expect(state.passwordForm.currentPassword().value()).toBe('Current123!');
    expect(auth.synchronizeContext).not.toHaveBeenCalled();
    expect(auth.revalidateVisibleContext).not.toHaveBeenCalled();
  });

  it('keeps a failed dispatched information write locked until explicit recovery', async () => {
    const { state, service } = setup();
    await settle();
    service.update.mockReturnValue(throwError(() => new CommandFailure('uncertain', 0)));
    state.editInfo();
    state.profileForm.firstName().value.set('Updated');
    await state.saveInfoCommand();
    await state.saveInfoCommand();
    expect(service.update).toHaveBeenCalledTimes(1);
    expect(state.uncertain()).toBe(true);
  });

  it('clears sensitive forms and staged preview on actor replacement and ignores the old response', async () => {
    const { state, service, identity } = setup();
    await settle();
    const response = new Subject<void>();
    service.changePassword.mockReturnValue(response);
    state.editPassword();
    state
      .passwordForm()
      .value.set({ currentPassword: 'Current123!', newPassword: 'NewSecret123!' });
    const saving = state.savePasswordCommand();
    identity.set(null);
    await settle();
    response.next();
    response.complete();
    await saving;
    expect(state.info()).toBeNull();
    expect(state.passwordForm().value()).toEqual({ currentPassword: '', newPassword: '' });
    expect(state.active()).toBe(false);
  });

  it('shows forbidden for a real HttpErrorResponse and does not fetch a photo after denial', async () => {
    const { state, service } = setup();
    service.info.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    await settle();
    expect(state.infoView()).toBe('forbidden');
    expect(service.photo).not.toHaveBeenCalled();
  });
});
