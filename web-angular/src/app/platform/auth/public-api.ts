import { inject, Injector } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const sessionGuard: CanActivateFn = async () => {
  const injector = inject(Injector); const router = inject(Router);
  const { AuthSession } = await import('./state/auth-session');
  const auth = injector.get(AuthSession);
  await auth.restore(); return auth.user() ? true : router.createUrlTree(['/login']);
};
