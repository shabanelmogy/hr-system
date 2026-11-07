import type { NavigationEntry } from '../../shared/ui/public-api';

/** Composition groups already-authorized workflow entries; shared navigation renders them. */
export function groupAdministrationNavigation(
  entries: readonly NavigationEntry[],
  title: string,
): readonly NavigationEntry[] {
  const order = [
    'system-audit',
    'system-health',
    'system-api-docs',
    'hangfire-dashboard',
    'system-error-logs',
    'settings',
    'language-translation',
  ];
  const children = order.flatMap((id) => entries.filter((entry) => entry.id === id));
  if (!children.length) return entries;
  return [
    ...entries.filter((entry) => !order.includes(entry.id)),
    { id: 'system-administration', label: title, icon: 'admin', children },
  ];
}
