import type { Session } from '../auth/session.public-api';

export function translationAllowed(actor: Session | null): boolean {
  return (
    !!actor?.userId &&
    actor.roles.includes('super_admin') &&
    actor.permissions.includes('SystemUiTexts:View')
  );
}
