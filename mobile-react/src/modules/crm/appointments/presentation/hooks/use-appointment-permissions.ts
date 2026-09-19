import { permissions, useAuthorization } from '@/src/platform/auth';

export function useAppointmentPermissions() {
  const view = useAuthorization({ requiredPermissions: [permissions.ViewAppointments], allowSuperAdmin: true });
  const create = useAuthorization({ requiredPermissions: [permissions.CreateAppointments], allowSuperAdmin: true });
  const edit = useAuthorization({ requiredPermissions: [permissions.EditAppointments], allowSuperAdmin: true });
  const remove = useAuthorization({ requiredPermissions: [permissions.DeleteAppointments], allowSuperAdmin: true });
  return { canView: view.allowed, canCreate: create.allowed, canEdit: edit.allowed, canDelete: remove.allowed } as const;
}
