import type { Session } from '../../platform/auth/session.public-api';
import { tenantAdminAllowed } from '../../platform/tenant-admins/policy.public-api';
import { tenantReadAllowed } from '../../platform/tenants/management/policy.public-api';
import type { NavigationEntry } from '../../shared/ui/public-api';

/** Tenant workflows share one Basic Data branch; each owner retains its access policy. */
export function tenantAdministrationEntries(
  actor: Session | null,
  text: (key: string) => string,
  path: string,
): readonly NavigationEntry[] {
  const children: NavigationEntry[] = [
    ...(tenantAdminAllowed(actor)
      ? [
          {
            id: 'tenant-admins',
            label: text('menu.tenantAdminManagement'),
            icon: 'admin' as const,
            selected: path === '/super-admin/tenant-admins',
          },
        ]
      : []),
    ...(tenantReadAllowed(actor)
      ? [
          {
            id: 'tenants',
            label: text('menu.tenantManagement'),
            icon: 'company' as const,
            selected: path === '/super-admin/tenants' || path.startsWith('/super-admin/tenants/'),
          },
        ]
      : []),
  ];
  return children.length
    ? [
        {
          id: 'tenant-administration',
          label: text('modules.tenantAdministration'),
          icon: 'company',
          children,
        },
      ]
    : [];
}
