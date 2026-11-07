import { stateReadAllowed } from './state';

export type StateWriteAction = 'Create' | 'Edit' | 'Archive' | 'Restore';
export function stateWriteAllowed(
  actor: {
    readonly roles: readonly string[];
    readonly permissions: readonly string[];
    readonly tenantReadOnly: boolean;
  } | null,
  action: StateWriteAction,
): boolean {
  return (
    !!actor &&
    stateReadAllowed(actor) &&
    !actor.tenantReadOnly &&
    actor.permissions.includes('States:' + action)
  );
}
