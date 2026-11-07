import type { Session } from '../../platform/auth/session.public-api';
import type { NavigationEntry } from '../../shared/ui/public-api';
import { stateReadAllowed } from '../../modules/reference-data/geographical-information/states/policy.public-api';
import { districtReadAllowed } from '../../modules/reference-data/geographical-information/districts/policy.public-api';

export function globalCountryReadAllowed(user: Session | null, development: boolean): boolean {
  return (
    development &&
    !!user &&
    user.roles.some((role) => role.trim().toLowerCase() === 'super_admin') &&
    user.permissions.includes('Countries:View')
  );
}

/** Feature routes and grants are composed here; the shell renders a generic data tree. */
export function globalGeographyEntries(
  user: Session | null,
  text: (key: string) => string,
  path: string,
  development: boolean,
): readonly NavigationEntry[] {
  const children: NavigationEntry[] = [
    ...(globalCountryReadAllowed(user, development)
      ? [
          {
            id: 'countries',
            label: text('menu.countries'),
            icon: 'flag' as const,
            selected: path === '/dev/countries',
          },
        ]
      : []),
    ...(stateReadAllowed(user)
      ? [
          {
            id: 'states',
            label: text('menu.states'),
            icon: 'location' as const,
            selected: path === '/super-admin/geography/states',
          },
        ]
      : []),
    ...(districtReadAllowed(user)
      ? [
          {
            id: 'districts',
            label: text('menu.districts'),
            icon: 'location' as const,
            selected: path === '/super-admin/geography/districts',
          },
        ]
      : []),
  ];
  return children.length
    ? [{ id: 'global-geography', label: text('menu.globalGeography'), icon: 'globe', children }]
    : [];
}
