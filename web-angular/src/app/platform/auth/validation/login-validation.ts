import { signal } from '@angular/core';
import {
  email,
  form,
  required,
  validate,
  metadata,
  MAX_LENGTH,
  REQUIRED,
  type FormOptions,
} from '@angular/forms/signals';

export const emptyLogin = { username: '', password: '' };
export function createLoginForm(options: FormOptions<typeof emptyLogin> = {}) {
  return form(
    signal({ ...emptyLogin }),
    (path) => {
      metadata(path.username, MAX_LENGTH, () => 50);
      metadata(path.username, REQUIRED, () => true);
      metadata(path.password, REQUIRED, () => true);
      validate(path.username, ({ value }) => {
        const username = value().trim();
        return !username
          ? { kind: 'required' }
          : username.length < 3
            ? { kind: 'minlength', requiredLength: 3 }
            : username.length > 50
              ? { kind: 'maxlength', requiredLength: 50 }
              : undefined;
      });
      validate(path.password, ({ value }) => (value().trim() ? undefined : { kind: 'required' }));
    },
    options,
  );
}
export function createPasswordRequestForm(options: FormOptions<{ email: string }> = {}) {
  return form(
    signal({ email: '' }),
    (path) => {
      required(path.email);
      email(path.email);
    },
    options,
  );
}
