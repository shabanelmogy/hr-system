type ErrorLogActor = {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly tenantReadOnly: boolean;
};

const hasRole = (actor: ErrorLogActor | null) =>
  !!actor && actor.roles.some((role) => role.trim().toLowerCase() === 'super_admin');
const hasPermission = (actor: ErrorLogActor | null, permission: string) =>
  !!actor && hasRole(actor) && actor.permissions.includes(permission);

export function systemErrorLogsAllowed(actor: ErrorLogActor | null): boolean {
  return hasPermission(actor, 'SystemErrorLogs:View');
}
export function systemErrorLogDetailsAllowed(actor: ErrorLogActor | null): boolean {
  return systemErrorLogsAllowed(actor) && hasPermission(actor, 'SystemErrorLogs:ViewDetails');
}
export function systemErrorLogExportAllowed(actor: ErrorLogActor | null): boolean {
  return systemErrorLogsAllowed(actor) && hasPermission(actor, 'SystemErrorLogs:Export');
}
export function errorLogSettingsAllowed(actor: ErrorLogActor | null): boolean {
  return hasPermission(actor, 'ErrorLogSettings:View');
}
export function errorLogSettingsEditAllowed(actor: ErrorLogActor | null): boolean {
  return (
    errorLogSettingsAllowed(actor) &&
    hasPermission(actor, 'ErrorLogSettings:Edit') &&
    actor?.tenantReadOnly === false
  );
}
