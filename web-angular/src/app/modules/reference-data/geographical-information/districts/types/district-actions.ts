import { districtReadAllowed } from './district';

export type DistrictWriteAction = 'Create' | 'Edit' | 'Archive' | 'Restore';
export function districtWriteAllowed(
  actor: {
    readonly roles: readonly string[];
    readonly permissions: readonly string[];
    readonly tenantReadOnly: boolean;
  } | null,
  action: DistrictWriteAction,
): boolean {
  return (
    !!actor &&
    districtReadAllowed(actor) &&
    !actor.tenantReadOnly &&
    actor.permissions.includes('Districts:' + action)
  );
}
