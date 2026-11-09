import type { Session } from '../../platform/auth/session.public-api';
import { tenantReadAllowed } from '../../platform/tenants/management/policy.public-api';
import type { NavigationEntry } from '../../shared/ui/public-api';

/** Tenant Management is a direct Basic Data destination with its existing access policy. */
export function tenantAdministrationEntries(
  actor: Session | null,
  text: (key: string) => string,
  path: string,
): readonly NavigationEntry[] {
  const children: NavigationEntry[] = [
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
  return children;
}
