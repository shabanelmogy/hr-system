import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, from, map, switchMap, throwError, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { classifyCommandFailure, CommandFailure } from '../../../shared/data/public-api';
import {
  profileInfoSchema,
  profilePhotoDataUrl,
  type PasswordUpdate,
  type ProfileUpdate,
} from '../types/account-profile';

const accountFields = [
  'userName',
  'firstName',
  'lastName',
  'currentPassword',
  'newPassword',
  'profilePicture',
] as const;

@Injectable({ providedIn: 'root' })
export class AccountProfileService {
  private readonly http = inject(HttpClient);
  private readonly security = inject(BrowserMutationSecurity);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly base = this.origin + '/AccountInfo/';

  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw new Error('An exact HTTPS API origin is required');
  }

  info(actorId: string) {
    return this.http.get<unknown>(this.base + 'GetInfo', { withCredentials: true }).pipe(
      timeout(10000),
      map((body) => {
        const info = profileInfoSchema.parse(body);
        if (info.id !== actorId) throw new Error('Account response does not match the actor');
        return info;
      }),
    );
  }

  photo() {
    return this.http
      .get<unknown>(this.base + 'GetUserPhoto', { withCredentials: true })
      .pipe(timeout(10000), map(profilePhotoDataUrl));
  }

  update(profile: ProfileUpdate) {
    return this.write('UpdateInfo', {
      id: profile.id,
      userName: profile.userName,
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  }

  updatePhoto(file: File | null) {
    const body = new FormData();
    if (file) body.append('ProfilePicture', file, file.name);
    else body.append('Remove', 'true');
    return this.write('UpdateUserPicture', body);
  }

  changePassword(passwords: PasswordUpdate) {
    return this.write('ChangePassword', {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
  }

  private write(action: string, body: object) {
    return defer(() => {
      let dispatched = false;
      return from(this.security.csrf()).pipe(
        switchMap((token) => {
          dispatched = true;
          return this.http.put<unknown>(this.base + action, body, {
            withCredentials: true,
            headers: { 'X-ERP-XSRF': token },
            observe: 'response',
          });
        }),
        timeout(15000),
        map((response) => {
          if (response.status !== 204) throw new Error('Unconfirmed account update');
          return undefined;
        }),
        catchError((error: unknown) =>
          throwError(() => {
            const failure = classifyCommandFailure(
              error,
              dispatched,
              accountFields.flatMap((field) => [field, 'Request.' + field]),
            );
            const fieldErrors: Record<string, string> = {};
            for (const field of accountFields) {
              const message = failure.fieldErrors[field] ?? failure.fieldErrors['Request.' + field];
              if (message) fieldErrors[field] = message;
            }
            const body: unknown = error instanceof HttpErrorResponse ? error.error : null;
            if (
              failure.outcome === 'rejected' &&
              typeof body === 'object' &&
              body !== null &&
              'title' in body &&
              typeof body.title === 'string' &&
              /^[A-Za-z][A-Za-z0-9.]{0,99}$/.test(body.title)
            ) {
              return new CommandFailure(failure.outcome, failure.status, fieldErrors, [
                ...failure.codes,
                body.title,
              ]);
            }
            return new CommandFailure(failure.outcome, failure.status, fieldErrors, failure.codes);
          }),
        ),
      );
    });
  }
}
