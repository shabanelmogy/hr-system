import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { submit, type ValidationError } from '@angular/forms/signals';
import { firstValueFrom, Subject, take, takeUntil, throwIfEmpty } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { LocalizationRuntime } from '../../localization/public-api';
import { CommandFailure, UnsavedChanges } from '../../../shared/data/public-api';
import { mapServerFieldErrors } from '../../../shared/ui/public-api';
import { AccountProfileService } from '../services/account-profile-service';
import { profilePhotoLimit, type ProfileInfo } from '../types/account-profile';
import {
  createPasswordForm,
  createProfileForm,
  emptyPasswordUpdate,
  emptyProfileUpdate,
  normalizeProfile,
} from '../validation/account-profile-forms';

type SubmissionErrors = ValidationError.WithFieldTree[] | undefined;
type ReadPhase = 'loading' | 'ready' | 'error' | 'forbidden';
interface AccountContext {
  readonly actor: Session;
  readonly generation: number;
}

@Injectable()
export class AccountProfileState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(AccountProfileService);
  private readonly locale = inject(LocalizationRuntime);
  private readonly drafts = inject(UnsavedChanges);
  private readonly destroy = inject(DestroyRef);
  private readonly cancelled = new Subject<void>();
  private readonly context = signal<AccountContext | null>(null);
  private readonly infoState = signal<ReadPhase>('loading');
  private readonly infoValue = signal<ProfileInfo | null>(null);
  private readonly photoValue = signal<string | null>(null);
  private readonly photoState = signal<ReadPhase>('loading');
  private readonly refreshIdentity = signal(false);
  private readonly signOutRequired = signal(false);
  private generation = 0;
  private passwordOnly = false;
  private previewUrl: string | null = null;
  readonly editingInfo = signal(false);
  readonly editingPhoto = signal(false);
  readonly editingPassword = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly preview = signal<string | null>(null);
  readonly photoPending = signal(false);
  readonly feedback = signal('');
  readonly photoFeedback = signal('');
  readonly photoFieldError = signal('');
  readonly passwordFeedback = signal('');
  readonly uncertain = signal(false);
  readonly photoUncertain = signal(false);
  readonly passwordUncertain = signal(false);
  readonly active = computed(() => {
    const context = this.context();
    return !!context && context.actor === this.auth.readIdentity();
  });
  readonly info = computed(() => (this.active() ? this.infoValue() : null));
  readonly infoView = computed<ReadPhase>(() => (this.active() ? this.infoState() : 'forbidden'));
  readonly photoView = computed<ReadPhase>(() => (this.active() ? this.photoState() : 'forbidden'));
  readonly displayPhoto = computed(() =>
    this.active() ? (this.editingPhoto() ? this.preview() : this.photoValue()) : null,
  );
  readonly profileForm = createProfileForm({
    submission: { action: () => this.saveInfo(), ignoreValidators: 'none' },
  });
  readonly passwordForm = createPasswordForm({
    submission: { action: () => this.savePassword(), ignoreValidators: 'none' },
  });
  readonly pending = computed(
    () =>
      this.profileForm().submitting() || this.passwordForm().submitting() || this.photoPending(),
  );
  readonly infoDirty = computed(() => {
    const current = this.info();
    return (
      this.editingInfo() &&
      !!current &&
      JSON.stringify(normalizeProfile(this.profileForm().value())) !==
        JSON.stringify(normalizeProfile(current))
    );
  });
  readonly photoDirty = computed(
    () => this.editingPhoto() && (!!this.selectedFile() || this.preview() !== this.photoValue()),
  );
  readonly passwordDirty = computed(
    () =>
      this.editingPassword() &&
      !!(this.passwordForm().value().currentPassword || this.passwordForm().value().newPassword),
  );
  readonly unsaved = computed(
    () =>
      this.active() &&
      (this.infoDirty() ||
        this.photoDirty() ||
        this.passwordDirty() ||
        this.uncertain() ||
        this.photoUncertain() ||
        this.passwordUncertain()),
  );
  readonly revision = linkedSignal<string, number>({
    source: () =>
      JSON.stringify([
        this.profileForm().value(),
        this.passwordForm().value(),
        this.preview(),
        this.photoFeedback(),
        this.feedback(),
        this.passwordFeedback(),
      ]),
    computation: (_value, previous) => (previous?.value ?? 0) + 1,
  });
  readonly identity = computed(() => 'account-profile:' + (this.context()?.generation ?? 0));
  readonly infoLocked = computed(
    () =>
      !this.active() ||
      !this.editingInfo() ||
      this.pending() ||
      this.uncertain() ||
      this.signOutRequired(),
  );
  readonly passwordLocked = computed(
    () =>
      !this.active() ||
      !this.editingPassword() ||
      this.pending() ||
      this.passwordUncertain() ||
      this.signOutRequired(),
  );
  readonly photoLocked = computed(
    () => !this.active() || this.pending() || this.photoUncertain() || this.signOutRequired(),
  );

  constructor() {
    const unregister = this.drafts.register({
      read: () => ({
        identity: this.identity(),
        revision: this.revision(),
        active: this.active(),
        unsaved: this.unsaved(),
        pending: this.pending(),
      }),
      invalidate: () => this.invalidate(),
    });
    effect(() => {
      const actor = this.auth.readIdentity();
      if (actor !== this.context()?.actor) untracked(() => this.load(actor));
    });
    effect(() => {
      if (
        this.refreshIdentity() &&
        this.active() &&
        !this.pending() &&
        !this.unsaved() &&
        !this.drafts.requiresDecision()
      ) {
        untracked(() => {
          this.refreshIdentity.set(false);
          void this.auth.revalidateVisibleContext();
        });
      }
      if (this.signOutRequired() && this.active() && !this.pending()) {
        untracked(() => {
          void this.finishSignOut();
        });
      }
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.invalidate();
      this.cancelled.complete();
    });
  }

  private load(actor: Session | null): void {
    this.invalidate();
    if (!actor) return;
    const context = { actor, generation: ++this.generation };
    this.context.set(context);
    if (this.passwordOnly) {
      this.infoState.set('ready');
      this.photoState.set('ready');
      return;
    }
    this.infoState.set('loading');
    this.photoState.set('loading');
    void this.readInfo(context);
  }

  usePasswordOnly(): void {
    if (!this.context()) this.passwordOnly = true;
  }

  private current(context: AccountContext): boolean {
    return !this.destroy.destroyed && this.context() === context && this.active();
  }

  private async readInfo(context: AccountContext): Promise<void> {
    try {
      const info = await firstValueFrom(
        this.service
          .info(context.actor.userId)
          .pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(context)) return;
      this.infoValue.set(info);
      this.profileForm().reset(normalizeProfile(info));
      this.infoState.set('ready');
      void this.readPhoto(context);
    } catch (error: unknown) {
      if (!this.current(context)) return;
      this.infoState.set(this.denied(error) ? 'forbidden' : 'error');
      this.photoState.set(this.denied(error) ? 'forbidden' : 'error');
    }
  }

  private async readPhoto(context: AccountContext): Promise<void> {
    this.photoState.set('loading');
    try {
      const photo = await firstValueFrom(
        this.service.photo().pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(context)) return;
      this.photoValue.set(photo);
      this.photoState.set('ready');
    } catch (error: unknown) {
      if (!this.current(context)) return;
      this.photoValue.set(null);
      this.photoState.set(this.denied(error) ? 'forbidden' : 'error');
    }
  }

  retry(): void {
    if (!this.pending() && !this.unsaved()) this.load(this.auth.readIdentity());
  }
  retryPhoto(): void {
    const context = this.context();
    if (context && this.current(context) && !this.pending() && !this.editingPhoto())
      void this.readPhoto(context);
  }
  editInfo(): void {
    if (
      this.infoView() === 'ready' &&
      !this.pending() &&
      !this.uncertain() &&
      !this.signOutRequired()
    )
      this.editingInfo.set(true);
  }
  cancelInfo(): void {
    const info = this.info();
    if (!info || this.pending() || this.uncertain()) return;
    this.profileForm().reset(normalizeProfile(info));
    this.editingInfo.set(false);
    this.feedback.set('');
  }
  editPhoto(): void {
    if (!this.active() || this.photoView() !== 'ready' || this.photoLocked()) return;
    this.preview.set(this.photoValue());
    this.editingPhoto.set(true);
    this.photoFeedback.set('');
    this.photoFieldError.set('');
  }
  choosePhoto(file: File | null): void {
    if (!this.editingPhoto() || this.photoLocked()) return;
    if (!file) {
      this.resetPhotoDraft();
      return;
    }
    if (
      !file.size ||
      file.size > profilePhotoLimit ||
      !['image/jpeg', 'image/png'].includes(file.type) ||
      !/\.(jpe?g|png)$/i.test(file.name)
    ) {
      this.photoFeedback.set('accountProfile.invalidImage');
      this.photoFieldError.set(
        this.locale.translate('accountProfile.invalidImage', 'platform-auth'),
      );
      return;
    }
    this.revokePreview();
    this.previewUrl = URL.createObjectURL(file);
    this.selectedFile.set(file);
    this.preview.set(this.previewUrl);
    this.photoFeedback.set('');
    this.photoFieldError.set('');
  }
  removePhoto(): void {
    if (!this.editingPhoto() || this.photoLocked()) return;
    this.revokePreview();
    this.selectedFile.set(null);
    this.preview.set(null);
    this.photoFeedback.set('');
    this.photoFieldError.set('');
  }
  cancelPhoto(): void {
    if (this.photoLocked()) return;
    this.resetPhotoDraft();
    this.editingPhoto.set(false);
    this.photoFeedback.set('');
  }

  async savePhoto(): Promise<void> {
    const context = this.context();
    if (
      !context ||
      !this.current(context) ||
      !this.editingPhoto() ||
      this.photoLocked() ||
      this.photoFieldError()
    )
      return;
    if (!this.photoDirty()) {
      this.cancelPhoto();
      return;
    }
    this.photoPending.set(true);
    try {
      await firstValueFrom(
        this.service
          .updatePhoto(this.selectedFile())
          .pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(context)) return;
      this.editingPhoto.set(false);
      this.resetPhotoDraft();
      this.photoFeedback.set('accountProfile.photoSaved');
      await this.readPhoto(context);
      if (this.current(context) && this.photoView() === 'error')
        this.photoFeedback.set('accountProfile.photoRefreshFailed');
    } catch (error: unknown) {
      if (!this.current(context)) return;
      const failure = this.failure(error);
      this.photoFieldError.set(failure.fieldErrors['profilePicture'] ?? '');
      this.photoUncertain.set(failure.outcome === 'uncertain');
      this.photoFeedback.set(
        this.photoUncertain() ? 'accountProfile.uncertain' : 'accountProfile.saveFailed',
      );
      if (this.denied(error)) this.forbid();
    } finally {
      if (this.current(context)) this.photoPending.set(false);
    }
  }

  editPassword(): void {
    if (
      this.infoView() !== 'ready' ||
      this.pending() ||
      this.passwordUncertain() ||
      this.signOutRequired()
    )
      return;
    if (!this.editingPassword()) this.passwordForm().reset({ ...emptyPasswordUpdate });
    this.editingPassword.set(true);
    this.passwordFeedback.set('');
  }
  cancelPassword(): void {
    if (this.pending() || this.passwordUncertain()) return;
    this.passwordForm().reset({ ...emptyPasswordUpdate });
    this.editingPassword.set(false);
    this.passwordFeedback.set('');
  }
  saveInfoCommand(): Promise<boolean> | false {
    return !this.infoLocked() ? submit(this.profileForm) : false;
  }
  savePasswordCommand(): Promise<boolean> | false {
    return !this.passwordLocked() ? submit(this.passwordForm) : false;
  }

  private async saveInfo(): Promise<SubmissionErrors> {
    const context = this.context();
    if (
      !context ||
      !this.current(context) ||
      !this.editingInfo() ||
      this.uncertain() ||
      this.photoPending() ||
      this.passwordForm().submitting()
    )
      return;
    const draft = this.profileForm().value();
    const update = normalizeProfile(draft);
    try {
      await firstValueFrom(
        this.service.update(update).pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(context)) return;
      const previous = this.infoValue();
      if (previous) this.infoValue.set({ ...previous, ...update });
      this.profileForm().value.set(update);
      this.editingInfo.set(false);
      this.feedback.set('accountProfile.saved');
      this.refreshIdentity.set(true);
    } catch (error: unknown) {
      if (!this.current(context)) return;
      const failure = this.failure(error);
      this.uncertain.set(failure.outcome === 'uncertain');
      this.feedback.set(
        this.uncertain() ? 'accountProfile.uncertain' : 'accountProfile.saveFailed',
      );
      if (this.denied(error)) {
        this.forbid();
        return;
      }
      const fields = { ...failure.fieldErrors };
      if (failure.codes.includes('DuplicateUserName'))
        fields['userName'] ??= this.locale.translate(
          'accountProfile.duplicateUserName',
          'platform-auth',
        );
      const mapped = mapServerFieldErrors(this.profileForm, fields, draft);
      return mapped.length ? mapped : undefined;
    }
    return undefined;
  }

  private async savePassword(): Promise<SubmissionErrors> {
    const context = this.context();
    if (
      !context ||
      !this.current(context) ||
      !this.editingPassword() ||
      this.passwordUncertain() ||
      this.signOutRequired() ||
      this.photoPending() ||
      this.profileForm().submitting()
    )
      return;
    if (this.infoDirty() || this.photoDirty() || this.uncertain() || this.photoUncertain()) {
      this.passwordFeedback.set('accountProfile.otherDrafts');
      return;
    }
    const draft = this.passwordForm().value();
    try {
      await firstValueFrom(
        this.service.changePassword(draft).pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(context)) return;
      this.passwordForm().value.set({ ...emptyPasswordUpdate });
      this.editingPassword.set(false);
      this.passwordFeedback.set('accountProfile.passwordSaved');
      this.signOutRequired.set(true);
    } catch (error: unknown) {
      if (!this.current(context)) return;
      const failure = this.failure(error);
      this.passwordUncertain.set(failure.outcome === 'uncertain');
      this.passwordFeedback.set(
        this.passwordUncertain() ? 'accountProfile.uncertain' : 'accountProfile.passwordFailed',
      );
      if (this.denied(error)) {
        this.forbid();
        return;
      }
      const fields = { ...failure.fieldErrors };
      if (failure.codes.includes('PasswordMismatch'))
        fields['currentPassword'] ??= this.locale.translate(
          'accountProfile.currentPasswordInvalid',
          'platform-auth',
        );
      if (failure.codes.some((code) => code.startsWith('Password') && code !== 'PasswordMismatch'))
        fields['newPassword'] ??= this.locale.translate(
          'accountProfile.passwordPolicy',
          'platform-auth',
        );
      const mapped = mapServerFieldErrors(this.passwordForm, fields, draft);
      return mapped.length ? mapped : undefined;
    }
    return undefined;
  }

  private async finishSignOut(): Promise<void> {
    // AuthSession owns draft consent. This account's confirmed password draft is already clean.
    this.signOutRequired.set(false);
    await this.auth.logout();
  }

  async recover(): Promise<void> {
    const context = this.context();
    if (!context || this.pending()) return;
    const stamp = this.drafts.stamp();
    if (
      !(await this.drafts.request('account-profile:reload')) ||
      !this.drafts.matches(stamp) ||
      !this.current(context)
    )
      return;
    this.load(context.actor);
  }

  async discardForTab(): Promise<boolean> {
    if (this.pending()) return false;
    const stamp = this.drafts.stamp();
    if (!(await this.drafts.request('account-profile:tab')) || !this.drafts.matches(stamp))
      return false;
    if (this.uncertain() || this.passwordUncertain() || this.photoUncertain()) {
      this.load(this.auth.readIdentity());
      return true;
    }
    this.cancelInfo();
    this.cancelPassword();
    this.cancelPhoto();
    return true;
  }

  private failure(error: unknown): CommandFailure {
    return error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
  }
  private denied(error: unknown): boolean {
    return (
      (error instanceof HttpErrorResponse || error instanceof CommandFailure) &&
      [401, 403].includes(error.status ?? 0)
    );
  }
  private forbid(): void {
    this.invalidate();
    // Retain a denied context so the same actor cannot automatically reload/replay.
    const actor = this.auth.readIdentity();
    if (actor) this.context.set({ actor, generation: ++this.generation });
    this.infoState.set('forbidden');
    this.photoState.set('forbidden');
  }
  private resetPhotoDraft(): void {
    this.revokePreview();
    this.photoFieldError.set('');
    this.selectedFile.set(null);
    this.preview.set(this.photoValue());
  }
  private revokePreview(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }
  private invalidate(): void {
    this.cancelled.next();
    this.context.set(null);
    this.infoValue.set(null);
    this.photoValue.set(null);
    this.revokePreview();
    this.selectedFile.set(null);
    this.preview.set(null);
    this.editingInfo.set(false);
    this.editingPhoto.set(false);
    this.editingPassword.set(false);
    this.profileForm().value.set({ ...emptyProfileUpdate });
    this.passwordForm().value.set({ ...emptyPasswordUpdate });
    this.photoPending.set(false);
    this.uncertain.set(false);
    this.photoUncertain.set(false);
    this.passwordUncertain.set(false);
    this.refreshIdentity.set(false);
    this.signOutRequired.set(false);
    this.feedback.set('');
    this.photoFeedback.set('');
    this.photoFieldError.set('');
    this.passwordFeedback.set('');
  }
}
