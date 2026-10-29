import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../platform/auth/session.public-api';
import { tenantWorkspaceAllowed } from '../platform/modules/public-api';
export const homeLandingGuard:CanActivateFn=async()=>{
  const auth=inject(AuthSession),router=inject(Router);await auth.restore();
  if(!auth.user())return router.createUrlTree(['/login']);
  return tenantWorkspaceAllowed(auth.user())?router.createUrlTree(['/apps']):true;
};
