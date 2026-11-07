import { signal } from '@angular/core';
import {
  form,
  metadata,
  MAX_LENGTH,
  REQUIRED,
  validate,
  type FormOptions,
} from '@angular/forms/signals';
import type { PasswordUpdate, ProfileUpdate } from '../types/account-profile';

export const emptyProfileUpdate: ProfileUpdate = {
  id: '',
  userName: '',
  firstName: '',
  lastName: '',
};
export const emptyPasswordUpdate: PasswordUpdate = {
  currentPassword: '',
  newPassword: '',
};

function textError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'required';
  if (trimmed.length < 3) return 'minlength';
  if (trimmed.length > 50) return 'maxlength';
  return undefined;
}

export function createProfileForm(options: FormOptions<ProfileUpdate> = {}) {
  return form(
    signal<ProfileUpdate>({ ...emptyProfileUpdate }),
    (path) => {
      metadata(path.id, REQUIRED, () => true);
      for (const field of [path.userName, path.firstName, path.lastName]) {
        metadata(field, REQUIRED, () => true);
        metadata(field, MAX_LENGTH, () => 50);
        validate(field, ({ value }) => {
          const kind = textError(value());
          return kind ? { kind } : undefined;
        });
      }
    },
    options,
  );
}

export function createPasswordForm(options: FormOptions<PasswordUpdate> = {}) {
  return form(
    signal<PasswordUpdate>({ ...emptyPasswordUpdate }),
    (path) => {
      metadata(path.currentPassword, REQUIRED, () => true);
      metadata(path.newPassword, REQUIRED, () => true);
      metadata(path.currentPassword, MAX_LENGTH, () => 50);
      metadata(path.newPassword, MAX_LENGTH, () => 50);
      validate(path.currentPassword, ({ value }) =>
        !value().length
          ? { kind: 'required' }
          : value().length > 50
            ? { kind: 'maxlength' }
            : undefined,
      );
      validate(path.newPassword, (context) => {
        const password = context.value();
        if (!password) return { kind: 'required' };
        if (password.length > 50) return { kind: 'maxlength' };
        if (password.length < 8) return { kind: 'minlength' };
        if (password === context.valueOf(path.currentPassword)) return { kind: 'same' };
        if (
          !/^(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
            password,
          )
        )
          return { kind: 'policy' };
        return undefined;
      });
    },
    options,
  );
}

export function normalizeProfile(value: ProfileUpdate): ProfileUpdate {
  return {
    id: value.id,
    userName: value.userName.trim(),
    firstName: value.firstName.trim(),
    lastName: value.lastName.trim(),
  };
}
