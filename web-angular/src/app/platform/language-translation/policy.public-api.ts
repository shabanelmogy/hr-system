import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../auth/session.public-api';
import { translationAllowed } from './language-translation-access';

export { translationAllowed } from './language-translation-access';

export const languageTranslationGuard: CanActivateFn = () =>
  translationAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');
